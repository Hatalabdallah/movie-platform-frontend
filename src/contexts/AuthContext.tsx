// movie-platform-frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast"; // Corrected import path
import { nodeBackendService, UserProfileResponse } from "@/services/nodeBackendService";
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 for generating device IDs

// Define the shape of your User object, including new fields
interface User {
  id: string;
  email: string;
  fullName?: string | null;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionPlan?: string;
  deviceId?: string; // Stored device ID for the current session
  phone?: string | null; // Added phone field
  subscriptionEndDate?: string | null; // Added subscriptionEndDate field
  createdAt: string; // ADDED: createdAt property
  updatedAt: string; // ADDED: updatedAt property
}

// Define the shape of your AuthContext
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSubscribed: boolean; // Exposed directly for convenience
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, fullName: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
  checkUserProfile: () => Promise<User | null>; // Exposed to allow manual refresh
}

// Create the context with a default (undefined) value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Helper for conditional logging in development
const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

// Helper function to get or generate a device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device_id'); // Use 'device_id' consistently
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('device_id', deviceId); // Use 'device_id' consistently
  }
  return deviceId;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!token;
  const isAdmin = user ? user.isAdmin : false;
  const isSubscribed = user ? user.isSubscribed : false;

  const cleanupAuthState = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('device_id'); // Ensure device_id is also cleared on cleanup
    setUser(null);
    setToken(null);
    devLog('[AuthContext] Auth state cleaned up.');
  };

  // This function now fetches the *full* user profile using nodeBackendService
  const checkUserProfile = async (): Promise<User | null> => {
    setLoading(true);
    const storedToken = localStorage.getItem('jwt_token');
    const currentDeviceId = getDeviceId(); // Ensure deviceId is available for profile check

    if (storedToken) {
      try {
        devLog('[AuthContext] Checking user profile...');
        // Use the service function to get the profile.
        const profileData: UserProfileResponse = await nodeBackendService.getUserProfile();
        devLog('[AuthContext] User profile fetched:', profileData);

        const fetchedUser: User = {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.fullName,
          isAdmin: profileData.isAdmin,
          isSubscribed: profileData.isSubscribed,
          subscriptionPlan: profileData.subscriptionPlan,
          deviceId: currentDeviceId, // Store the current device ID in the user object
          phone: profileData.phone, // Map phone
          subscriptionEndDate: profileData.subscription_end_date, // Map subscription_end_date
          createdAt: profileData.createdAt, // Mapped from UserProfileResponse
          updatedAt: profileData.updatedAt, // Mapped from UserProfileResponse
        };

        setUser(fetchedUser);
        setToken(storedToken); // Ensure token is still set
        setLoading(false);
        devLog('[AuthContext] User profile set:', fetchedUser);
        return fetchedUser;
      } catch (error) {
        console.error('[AuthContext] Error checking user profile:', error);
        // If profile check fails (e.g., 401 due to session invalidation), clean up
        cleanupAuthState();
        setLoading(false);
        return null;
      }
    }
    // If no stored token, ensure loading is false and user/token are null
    cleanupAuthState(); // Ensure state is clean if no token
    setLoading(false);
    devLog('[AuthContext] No stored token found, user not authenticated.');
    return null;
  };

  useEffect(() => {
    checkUserProfile();
  }, []); // Run only once on mount

  // Login function - now calls nodeBackendService.login
  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    devLog('[AuthContext] Attempting login...');
    try {
      cleanupAuthState(); // Ensure clean state before new login attempt

      const deviceId = getDeviceId(); // Get or generate device ID for login
      devLog('[AuthContext] Calling nodeBackendService.login...');
      const { token: newToken, user: fetchedUserProfile } = await nodeBackendService.login(email, password, deviceId); // Pass deviceId
      devLog('[AuthContext] nodeBackendService.login returned:', { newToken, fetchedUserProfile });

      localStorage.setItem('jwt_token', newToken);
      // nodeBackendService.login already sets device_id in local storage

      const mappedUser: User = {
        id: fetchedUserProfile.id,
        email: fetchedUserProfile.email,
        fullName: fetchedUserProfile.fullName,
        isAdmin: fetchedUserProfile.isAdmin,
        isSubscribed: fetchedUserProfile.isSubscribed,
        subscriptionPlan: fetchedUserProfile.subscriptionPlan,
        deviceId: deviceId, // Set the current device ID
        createdAt: fetchedUserProfile.createdAt,
        updatedAt: fetchedUserProfile.updatedAt,
        phone: fetchedUserProfile.phone, // Map phone
        subscriptionEndDate: fetchedUserProfile.subscription_end_date, // Map subscription_end_date
      };
      setUser(mappedUser);
      setToken(newToken);
      setLoading(false);
      devLog('[AuthContext] Login successful, user set:', mappedUser);
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
    devLog('[AuthContext] Attempting registration...');
    try {
      cleanupAuthState(); // Ensure clean state before new registration attempt

      const deviceId = getDeviceId(); // Get or generate device ID for registration
      devLog('[AuthContext] Calling nodeBackendService.register...');
      const { token: newToken, user: fetchedUserProfile } = await nodeBackendService.register(email, password, fullName, deviceId); // Pass deviceId
      devLog('[AuthContext] nodeBackendService.register returned:', { newToken, fetchedUserProfile });

      localStorage.setItem('jwt_token', newToken);
      // nodeBackendService.register already sets device_id in local storage

      const mappedUser: User = {
        id: fetchedUserProfile.id,
        email: fetchedUserProfile.email,
        fullName: fetchedUserProfile.fullName,
        isAdmin: fetchedUserProfile.isAdmin,
        isSubscribed: fetchedUserProfile.isSubscribed,
        subscriptionPlan: fetchedUserProfile.subscriptionPlan,
        deviceId: deviceId, // Set the current device ID
        createdAt: fetchedUserProfile.createdAt,
        updatedAt: fetchedUserProfile.updatedAt,
        phone: fetchedUserProfile.phone, // Map phone
        subscriptionEndDate: fetchedUserProfile.subscription_end_date, // Map subscription_end_date
      };
      setUser(mappedUser);
      setLoading(false);
      toast({
        title: "Registration Successful",
        description: "You have been registered and logged in!",
      });
      devLog('[AuthContext] Registration successful, user set:', mappedUser);
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
    const deviceId = localStorage.getItem('device_id'); // Get deviceId to send to backend
    if (deviceId) {
      nodeBackendService.logout(deviceId).finally(() => { // Call logout with deviceId
        cleanupAuthState();
        window.location.href = '/'; // Full page reload to clear all state
      });
    } else {
      cleanupAuthState();
      window.location.href = '/';
    }
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
    checkUserProfile, // Expose checkUserProfile for manual refresh
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
