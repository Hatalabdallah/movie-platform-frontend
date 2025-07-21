// movie-platform-frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
// Import nodeBackendService and UserProfileResponse to use its centralized functions and types
import { nodeBackendService, UserProfileResponse } from "@/services/nodeBackendService"; 

// Define the shape of your User object (matches what your Node.js backend returns from /profile
// after nodeBackendService has mapped it to camelCase)
interface User {
  id: string;
  email: string;
  fullName?: string | null; // Matches UserProfileResponse
  isAdmin: boolean;        // Matches UserProfileResponse
  isSubscribed: boolean;   // Matches UserProfileResponse
  subscriptionPlan?: string; // Matches UserProfileResponse
  deviceId?: string;       // Derived from deviceIDs in UserProfileResponse
}

// Define the shape of your AuthContext
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSubscribed: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, fullName: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
  // ADDED: checkUserProfile function to refresh user data
  checkUserProfile: () => Promise<User | null>;
}

// Create the context with a default (undefined) value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!token;
  const isAdmin = user ? user.isAdmin : false;
  const isSubscribed = user ? user.isSubscribed : false;

  // This function now fetches the *full* user profile using nodeBackendService
  const checkUserProfile = async (): Promise<User | null> => {
    setLoading(true);
    const storedToken = localStorage.getItem('jwt_token');

    if (storedToken) {
      try {
        console.log('[AuthContext] Checking user profile...');
        // Use the service function to get the profile.
        // It now handles the API call and maps the backend's snake_case response
        // to the frontend's camelCase UserProfileResponse.
        const profileData: UserProfileResponse = await nodeBackendService.getUserProfile();
        console.log('[AuthContext] User profile fetched:', profileData);

        // Directly use the profileData as it's already in the correct camelCase format
        const fetchedUser: User = {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.fullName,
          isAdmin: profileData.isAdmin,
          isSubscribed: profileData.isSubscribed,
          subscriptionPlan: profileData.subscriptionPlan,
          // Ensure deviceIDs is an array before accessing [0]
          deviceId: profileData.deviceIDs && profileData.deviceIDs.length > 0 ? profileData.deviceIDs[0] : undefined,
        };

        setUser(fetchedUser);
        setToken(storedToken); // Ensure token is still set
        setLoading(false);
        console.log('[AuthContext] User profile set:', fetchedUser);
        return fetchedUser;
      } catch (error) {
        console.error('[AuthContext] Error checking user profile:', error);
        cleanupAuthState();
        setLoading(false);
        return null;
      }
    }
    // If no stored token, ensure loading is false and user/token are null
    cleanupAuthState(); // Ensure state is clean if no token
    setLoading(false);
    console.log('[AuthContext] No stored token found, user not authenticated.');
    return null;
  };

  useEffect(() => {
    checkUserProfile();
  }, []);

  const cleanupAuthState = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    setToken(null);
    console.log('[AuthContext] Auth state cleaned up.');
  };

  // Login function - now calls nodeBackendService.login
  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    console.log('[AuthContext] Attempting login...');
    try {
      cleanupAuthState(); // Ensure clean state before new login attempt

      console.log('[AuthContext] Calling nodeBackendService.login...');
      // Use the login function from nodeBackendService.
      // It returns the token and the already mapped UserProfileResponse.
      const { token: newToken, user: fetchedUserProfile } = await nodeBackendService.login(email, password);
      console.log('[AuthContext] nodeBackendService.login returned:', { newToken, fetchedUserProfile });

      localStorage.setItem('jwt_token', newToken);
      setToken(newToken);
      
      // Set user directly from the fetchedUserProfile (already in camelCase)
      const mappedUser: User = {
        id: fetchedUserProfile.id,
        email: fetchedUserProfile.email,
        fullName: fetchedUserProfile.fullName,
        isAdmin: fetchedUserProfile.isAdmin,
        isSubscribed: fetchedUserProfile.isSubscribed,
        subscriptionPlan: fetchedUserProfile.subscriptionPlan,
        // Ensure deviceIDs is an array before accessing [0]
        deviceId: fetchedUserProfile.deviceIDs && fetchedUserProfile.deviceIDs.length > 0 ? fetchedUserProfile.deviceIDs[0] : undefined,
      };
      setUser(mappedUser);
      setLoading(false);
      console.log('[AuthContext] Login successful, user set:', mappedUser);
      return mappedUser;
    } catch (error) {
      console.error('[AuthContext] Error during login:', error); // This is the key log
      toast({
        title: "Login Failed",
        description: (error as Error).message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      cleanupAuthState(); // Clean up on login failure
      setLoading(false);
      return null;
    }
  };

  // Register function - now calls nodeBackendService.register
  const register = async (email: string, password: string, fullName: string): Promise<User | null> => {
    setLoading(true);
    console.log('[AuthContext] Attempting registration...');
    try {
      cleanupAuthState(); // Ensure clean state before new registration attempt

      console.log('[AuthContext] Calling nodeBackendService.register...');
      // Use the register function from nodeBackendService.
      // It returns the token and the already mapped UserProfileResponse.
      const { token: newToken, user: fetchedUserProfile } = await nodeBackendService.register(email, password, fullName);
      console.log('[AuthContext] nodeBackendService.register returned:', { newToken, fetchedUserProfile });

      localStorage.setItem('jwt_token', newToken);
      setToken(newToken);
      
      // Set user directly from the fetchedUserProfile (already in camelCase)
      const mappedUser: User = {
        id: fetchedUserProfile.id,
        email: fetchedUserProfile.email,
        fullName: fetchedUserProfile.fullName,
        isAdmin: fetchedUserProfile.isAdmin,
        isSubscribed: fetchedUserProfile.isSubscribed,
        subscriptionPlan: fetchedUserProfile.subscriptionPlan,
        // Ensure deviceIDs is an array before accessing [0]
        deviceId: fetchedUserProfile.deviceIDs && fetchedUserProfile.deviceIDs.length > 0 ? fetchedUserProfile.deviceIDs[0] : undefined,
      };
      setUser(mappedUser);
      setLoading(false);
      toast({
        title: "Registration Successful",
        description: "You have been registered and logged in!",
      });
      console.log('[AuthContext] Registration successful, user set:', mappedUser);
      return mappedUser;
    } catch (error) {
      console.error('[AuthContext] Error during registration:', error);
      toast({
        title: "Registration Error",
        description: (error as Error).message || "An unexpected error occurred during registration. Please try again.",
        variant: "destructive",
      });
      cleanupAuthState(); // Clean up on registration failure
      setLoading(false);
      return null;
    }
  };

  const logout = () => {
    cleanupAuthState();
    window.location.href = '/';
  };

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isSubscribed,
    login,
    register,
    logout,
    loading,
    checkUserProfile, // ADDED: Provide the checkUserProfile function
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
