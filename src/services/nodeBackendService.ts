// movie-platform-frontend/src/services/nodeBackendService.ts

import axios, { AxiosProgressEvent } from 'axios'; // Import AxiosProgressEvent directly from axios
import { getToken } from '@/lib/utils/auth';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 for generating device IDs

export const API_BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:3001/api';
// Get frontend URL for DPO redirects
export const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:8080';


if (!API_BASE_URL) {
  console.error("VITE_NODE_BACKEND_URL is not defined in .env. Please check your .env file.");
}

// Define interfaces to match your Node.js backend's PostgreSQL schema and API responses
export interface Movie {
  id: string;
  title: string;
  description?: string | null;
  vj: string;
  category: string;
  thumbnail_url?: string | null;
  file_url: string;
  created_at: string; // This is the only timestamp now
  size?: number; // Added for backend movie size
}

// Profile interface for admin view (might still contain is_subscribed, subscription_plan for admin convenience)
export interface Profile {
  id: string;
  email: string;
  fullName?: string | null; // Changed from full_name to fullName for consistency
  is_admin: boolean;
  created_at: string; // ISO string
  phone?: string | null;
  // These are for admin view, backend might still return them even if derived
  is_subscribed?: boolean;
  subscription_plan?: string;
  subscription_end_date?: string | null; // Added for admin view to show end date
}

// Interface for the user profile response from /api/users/me/profile and update
// This interface defines the CAMELCASE structure expected by the FRONTEND
export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string | null;
  isAdmin: boolean;
  isSubscribed: boolean; // Derived from subscriptions table
  subscriptionPlan: string; // Derived from subscriptions table, e.g., 'none', 'Basic', 'Premium'
  deviceIDs: string[]; // Or whatever type device IDs are
  createdAt: string;
  updatedAt: string;
}

// Interface for the user download stats response from /api/users/me/download-stats
export interface UserDownloadStatsResponse {
  detailedDownloads: Array<{
    movieId: string;
    movieTitle: string;
    thumbnailUrl: string;
    movieSize: number; // in bytes
    downloadCount: number;
    lastDownloadDate: string; // ISO string
  }>;
  summary: {
    totalMoviesDownloaded: number;
    totalStorageUsed: string; // e.g., "24.5 GB"
    lastDownloadDate: string | null; // ISO string or null
  };
}

export interface Analytics {
  totalDownloads: number;
  totalSubscribers: number;
  newSubscribersThisWeek: number;
}

export interface DownloadStat {
  movie_id: string;
  movie_title: string;
  download_count: number;
}

// Interface for Subscription Plans from the backend
export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  price_ugx: string; // Using string as DECIMAL from DB might come as string
  duration_days: number;
  duration_unit: string; // e.g., 'week', 'month', 'year'
  description: string;
  features: string[]; // Array of strings for benefits
  is_active: boolean; // For admin to enable/disable
  display_order: number; // For sorting on frontend
  created_at: string;
  updated_at: string;
}

// NEW: Interface for creating/updating a subscription plan (payload)
export interface SubscriptionPlanPayload {
  plan_name: string;
  price_ugx: string;
  duration_days: number;
  duration_unit: string;
  description: string;
  features: string[];
  is_active: boolean;
  display_order: number;
}

// Extend the UploadMovieData interface to include the file types
export interface UploadMovieData {
  title: string;
  description: string | null;
  vj: string;
  category: string;
  movieFile: File; // Changed to single File for individual upload calls
  thumbnailFile: File | null;
}

// NEW: Interfaces for DPO Payment
export interface InitiatePaymentRequest {
  subscription_plan_id: string;
  amount: number;
  currency: string;
  description: string;
  client_redirect_url: string; // URL where DPO redirects user after successful payment
  client_back_url: string;     // URL where DPO redirects user after cancelled payment
}

export interface InitiatePaymentResponse {
  message: string;
  redirect_url: string; // DPO's payment URL to redirect the user to
  transaction_id: string; // Your internal transaction ID
  dpo_token: string;      // DPO's transaction token
}

export interface VerifyPaymentResponse {
  message: string;
  status: 'successful' | 'failed';
  dpoResponse: string; // Raw XML response from DPO for verification
}

// NEW: Interface for Admin Subscription Management Request
export interface AdminManageSubscriptionRequest {
  action: 'activate_extend' | 'deactivate';
  subscription_plan_id?: string; // Required for 'activate_extend'
}

// NEW: Interface for Admin Subscription Management Response
export interface AdminManageSubscriptionResponse {
  message: string;
  subscription?: { // Optional, depending on action
    id: string;
    user_id: string;
    plan_id: string;
    start_date: string;
    end_date: string;
    status: string;
    plan_name: string;
    created_at: string;
    updated_at: string;
  };
  deactivatedSubscriptions?: Array<{ // Optional, for 'deactivate' action
    id: string;
    user_id: string;
    status: string;
  }>;
}


const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json', // Added for JSON payloads
  };
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


export const nodeBackendService = {
  API_BASE_URL, // Export API_BASE_URL for use in other modules
  FRONTEND_BASE_URL, // Export FRONTEND_BASE_URL for use in other modules

  // Login function now sends currentDeviceId
  async login(email: string, password: string): Promise<{ token: string; user: UserProfileResponse }> {
    try {
      const currentDeviceId = getDeviceId(); // Get existing or generate new

      console.log('Sending login request with:', { email, password, currentDeviceId }); // Log what's being sent

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, currentDeviceId }), // Send device ID
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Backend now directly returns UserProfileResponse (camelCase)
      return { token: data.token, user: data.user };
    } catch (error) {
      console.error("Error during login via service:", error);
      throw error;
    }
  },

  // Register function now sends a generated deviceId
  async register(email: string, password: string, fullName: string): Promise<{ token: string; user: UserProfileResponse }> {
    try {
      const currentDeviceId = getDeviceId(); // Get existing or generate new

      console.log('Sending registration request with:', { email, password, fullName, currentDeviceId }); // Log what's being sent

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, currentDeviceId }), // Send device ID
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Backend now directly returns UserProfileResponse (camelCase)
      return { token: data.token, user: data.user };
    } catch (error) {
      console.error("Error during registration via service:", error);
      throw error;
    }
  },

  async getMovies(): Promise<Movie[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/movies`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Movie[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching movies from Node.js backend:", error);
      throw error;
    }
  },
  async getMovieById(id: string): Promise<Movie> {
    try {
      const response = await fetch(`${API_BASE_URL}/movies/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: Movie = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching movie ${id} from Node.js backend:`, error);
      throw error;
    }
  },
  async getAllMovies(): Promise<Movie[]> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/movies`, { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: Movie[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching all movies for admin from Node.js backend:", error);
      throw error;
    }
  },
  // Modified uploadMovie to handle a single movie file and its progress
  async uploadMovie(
    data: UploadMovieData,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<Movie> {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) {
      formData.append("description", data.description);
    }
    formData.append("vj", data.vj);
    formData.append("category", data.category);
    formData.append("movieFile", data.movieFile); // Append single movie file
    if (data.thumbnailFile) {
      formData.append("thumbnailFile", data.thumbnailFile);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/movies`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onUploadProgress,
        timeout: 600000, // 10 minutes timeout for large files
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `Failed to upload movie: ${error.message}`);
      }
      throw error;
    }
  },
  async deleteMovie(id: string): Promise<{ message: string }> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/movies/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: { message: string } = await response.json();
      return data;
    } catch (error) {
      console.error(`Error deleting movie ${id} from Node.js backend:`, error);
      throw error;
    }
  },
  async getAllSubscribers(): Promise<Profile[]> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/subscribers`, { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      // The backend now returns `is_subscribed` and `subscription_plan` directly in the Profile
      const data: Profile[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching all subscribers for admin from Node.js backend:", error);
      throw error;
    }
  },
  async deleteSubscriber(userId: string): Promise<{ message: string }> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/subscribers/${userId}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: { message: string } = await response.json();
      return data;
    } catch (error) {
      console.error(`Error deleting subscriber ${userId} from Node.js backend:`, error);
      throw error;
    }
  },
  // Removed old updateUserSubscriptionAdmin as it was directly setting flags on 'users' table.
  // The new manageSubscriptionAdmin function will interact with the 'subscriptions' table.
  // async updateUserSubscriptionAdmin(
  //   userId: string,
  //   isSubscribed: boolean,
  //   subscriptionPlan: string
  // ): Promise<Profile> {
  //   try {
  //     const headers = getAuthHeaders();
  //     const response = await fetch(`${API_BASE_URL}/admin/subscribers/${userId}/subscription`, {
  //       method: 'PUT',
  //       headers,
  //       body: JSON.stringify({ isSubscribed, subscriptionPlan }),
  //     });
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     return data.user;
  //   } catch (error) {
  //     console.error(`Error updating subscription for user ${userId}:`, error);
  //     throw error;
  //   }
  // },
  async getPlatformAnalytics(): Promise<Analytics> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/analytics`, { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: Analytics = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching platform analytics from Node.js backend:", error);
      throw error;
    }
  },
  // NOTE: This function likely fetches admin-level stats, not user's personal stats
  async getMovieDownloadStats(): Promise<DownloadStat[]> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/download-stats`, { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: DownloadStat[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching movie download stats from Node.js backend:", error);
      throw error;
    }
  },
  async getUserProfile(): Promise<UserProfileResponse> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/auth/profile`, { headers }); // Changed to /auth/profile
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: UserProfileResponse = await response.json();
      // Backend /auth/profile now returns UserProfileResponse directly, no need for extensive mapping here
      // The backend is responsible for returning camelCase and derived status
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },
  async getUserDownloadStats(): Promise<UserDownloadStatsResponse> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/me/download-stats`, { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: UserDownloadStatsResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user download statistics:", error);
      throw error;
    }
  },
  // Function to update user profile (full_name, email)
  async updateUserProfile(payload: { fullName?: string; email?: string }): Promise<UserProfileResponse> {
    try {
      const headers = getAuthHeaders(); // Includes 'Content-Type': 'application/json' now
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: headers, // Pass the headers including Content-Type
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      // The backend /users/profile PUT route returns a 'user' object within a 'message' object
      const data = await response.json();
      // Assuming the backend returns the updated user profile directly or within a 'user' property
      const user: UserProfileResponse = data.user || data; // Handle cases where 'user' might be direct or nested
      return user;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },
  async changeUserPassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const headers = getAuthHeaders(); // Includes 'Content-Type': 'application/json'
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: { message: string } = await response.json();
      return data;
    } catch (error) {
      console.error("Error changing user password:", error);
      throw error;
    }
  },
  // Original checkSubscription - kept for reference, but getUserProfile should now be preferred for dashboard status
  async checkSubscription(userId: string): Promise<{ isSubscribed: boolean, subscriptionTier?: string }> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${userId}/subscription-status`, { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      throw error;
    }
  },
  // Function to fetch all active subscription plans (public view)
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      // No auth headers needed as this is a public endpoint
      const response = await fetch(`${API_BASE_URL}/users/subscription-plans`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: SubscriptionPlan[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      throw error;
    }
  },
  // NEW ADMIN FUNCTIONS FOR SUBSCRIPTION PLANS
  // Admin function to fetch ALL subscription plans (including inactive ones)
  async getAllSubscriptionPlansAdmin(): Promise<SubscriptionPlan[]> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/subscription-plans`, { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: SubscriptionPlan[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching all subscription plans for admin:", error);
      throw error;
    }
  },
  // Admin function to create a new subscription plan
  async createSubscriptionPlan(payload: SubscriptionPlanPayload): Promise<SubscriptionPlan> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/subscription-plans`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: SubscriptionPlan = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      throw error;
    }
  },
  // Admin function to update an existing subscription plan
  async updateSubscriptionPlan(id: string, payload: Partial<SubscriptionPlanPayload>): Promise<SubscriptionPlan> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/subscription-plans/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: SubscriptionPlan = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating subscription plan ${id}:`, error);
      throw error;
    }
  },
  // Admin function to delete a subscription plan
  async deleteSubscriptionPlan(id: string): Promise<{ message: string }> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/subscription-plans/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: { message: string } = await response.json();
      return data;
    } catch (error) {
      console.error(`Error deleting subscription plan ${id}:`, error);
      throw error;
    }
  },

  // NEW DPO PAYMENT FUNCTIONS
  async initiateDPOPayment(
    payload: InitiatePaymentRequest
  ): Promise<InitiatePaymentResponse> {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/payments/initiate`, payload, { headers });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `DPO Payment Initiation Failed: ${error.message}`);
      }
      throw error;
    }
  },

  async verifyDPOPayment(dpoToken: string): Promise<VerifyPaymentResponse> {
    try {
      const headers = getAuthHeaders();
      // DPO redirects with Ptrid, which is our dpo_token
      const response = await axios.get(`${API_BASE_URL}/payments/verify?Ptrid=${dpoToken}`, { headers });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `DPO Payment Verification Failed: ${error.message}`);
      }
      throw error;
    }
  },

  // NEW: Admin function to manage user subscriptions via the 'subscriptions' table
  async adminManageUserSubscription(
    userId: string,
    payload: AdminManageSubscriptionRequest
  ): Promise<AdminManageSubscriptionResponse> {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`${API_BASE_URL}/admin/subscribers/${userId}/manage-subscription`, payload, { headers });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // The backend might send a specific error message, use that
        throw new Error(error.response.data.message || `Failed to manage subscription: ${error.message}`);
      }
      throw error;
    }
  },
};
