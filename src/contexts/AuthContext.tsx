// movie-platform-frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { nodeBackendService, UserProfileResponse } from "@/services/nodeBackendService";
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating device IDs

// Define the shape of your User object, including new fields
interface User {
  id: string;
  email: string;
  fullName?: string | null;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionPlan?: string;
  deviceId?: string;
  phone?: string | null; // NEW: Added phone field
  subscriptionEndDate?: string | null; // NEW: Added subscriptionEndDate field
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
  checkUserProfile: () => Promise<User | null>;
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
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('deviceId', deviceId);
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

  const checkUserProfile = async (): Promise<User | null> => {
    setLoading(true);
    const storedToken = localStorage.getItem('jwt_token');

    if (storedToken) {
      try {
        devLog('[AuthContext] Checking user profile...');
        const profileData: UserProfileResponse = await nodeBackendService.getUserProfile();
        devLog('[AuthContext] User profile fetched:', profileData);

        const fetchedUser: User = {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.fullName,
          isAdmin: profileData.isAdmin,
          isSubscribed: profileData.isSubscribed,
          subscriptionPlan: profileData.subscriptionPlan,
          deviceId: profileData.deviceIDs && profileData.deviceIDs.length > 0 ? profileData.deviceIDs[0] : undefined,
          phone: profileData.phone, // NEW: Map phone
          subscriptionEndDate: profileData.subscription_end_date, // NEW: Map subscription_end_date
        };

        setUser(fetchedUser);
        setToken(storedToken);
        setLoading(false);
        devLog('[AuthContext] User profile set:', fetchedUser);
        return fetchedUser;
      } catch (error) {
        console.error('[AuthContext] Error checking user profile:', error);
        cleanupAuthState();
        setLoading(false);
        return null;
      }
    }
    cleanupAuthState();
    setLoading(false);
    devLog('[AuthContext] No stored token found, user not authenticated.');
    return null;
  };

  useEffect(() => {
    checkUserProfile();
  }, []);

  const cleanupAuthState = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    setToken(null);
    devLog('[AuthContext] Auth state cleaned up.');
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    devLog('[AuthContext] Attempting login...');
    try {
      cleanupAuthState();
      const deviceId = getDeviceId(); // Get or generate device ID

      devLog('[AuthContext] Calling nodeBackendService.login...');
      const { token: newToken, user: fetchedUserProfile } = await nodeBackendService.login(email, password, deviceId); // Pass deviceId
      devLog('[AuthContext] nodeBackendService.login returned:', { newToken, fetchedUserProfile });

      localStorage.setItem('jwt_token', newToken);
      setToken(newToken);

      const mappedUser: User = {
        id: fetchedUserProfile.id,
        email: fetchedUserProfile.email,
        fullName: fetchedUserProfile.fullName,
        isAdmin: fetchedUserProfile.isAdmin,
        isSubscribed: fetchedUserProfile.isSubscribed,
        subscriptionPlan: fetchedUserProfile.subscriptionPlan,
        deviceId: fetchedUserProfile.deviceIDs && fetchedUserProfile.deviceIDs.length > 0 ? fetchedUserProfile.deviceIDs[0] : undefined,
        phone: fetchedUserProfile.phone, // NEW: Map phone
        subscriptionEndDate: fetchedUserProfile.subscription_end_date, // NEW: Map subscription_end_date
      };
      setUser(mappedUser);
      setLoading(false);
      devLog('[AuthContext] Login successful, user set:', mappedUser);
      return mappedUser;
    } catch (error) {
      console.error('[AuthContext] Error during login:', error);
      toast({
        title: "Login Failed",
        description: (error as Error).message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      cleanupAuthState();
      setLoading(false);
      return null;
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<User | null> => {
    setLoading(true);
    devLog('[AuthContext] Attempting registration...');
    try {
      cleanupAuthState();
      const deviceId = getDeviceId(); // Get or generate device ID

      devLog('[AuthContext] Calling nodeBackendService.register...');
      const { token: newToken, user: fetchedUserProfile } = await nodeBackendService.register(email, password, fullName, deviceId); // Pass deviceId
      devLog('[AuthContext] nodeBackendService.register returned:', { newToken, fetchedUserProfile });

      localStorage.setItem('jwt_token', newToken);
      setToken(newToken);

      const mappedUser: User = {
        id: fetchedUserProfile.id,
        email: fetchedUserProfile.email,
        fullName: fetchedUserProfile.fullName,
        isAdmin: fetchedUserProfile.isAdmin,
        isSubscribed: fetchedUserProfile.isSubscribed,
        subscriptionPlan: fetchedUserProfile.subscriptionPlan,
        deviceId: fetchedUserProfile.deviceIDs && fetchedUserProfile.deviceIDs.length > 0 ? fetchedUserProfile.deviceIDs[0] : undefined,
        phone: fetchedUserProfile.phone, // NEW: Map phone
        subscriptionEndDate: fetchedUserProfile.subscription_end_date, // NEW: Map subscription_end_date
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
      cleanupAuthState();
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
    checkUserProfile,
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
