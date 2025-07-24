// film-vault-downloads/src/services/nodeBackendService.ts

import axios, { AxiosProgressEvent } from 'axios';
// Removed specific imports for getToken and uuidv4 as apiClient handles auth and deviceId is managed by AuthContext

// Define your API base URL
export const API_BASE_URL = import.meta.env.VITE_NODE_BACKEND_API_URL || 'http://localhost:3001/api';
export const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL || 'http://localhost:3000';
export const CLOUDFRONT_DOMAIN = import.meta.env.VITE_CLOUDFRONT_DOMAIN || ''; // Ensure CloudFront domain is available

if (!API_BASE_URL) {
  console.error("VITE_NODE_BACKEND_API_URL is not defined in .env. Please check your .env file.");
}

const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

// --- INTERFACES ---
export interface Movie {
  id: string;
  title: string;
  description: string | null; // Changed to match backend's nullable description
  vj: string;
  category: string;
  thumbnail_url: string | null; // This should now be a full CloudFront URL
  s3_key: string | null; // The S3 key for the main movie file (can be null if not yet uploaded)
  created_at: string;
  size: number | null; // Size in bytes (can be null)
}

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  isAdmin: boolean; // Changed from is_admin to isAdmin for consistency with UserProfileResponse
  createdAt: string;
  phone?: string | null;
  isSubscribed?: boolean; // Changed from is_subscribed to isSubscribed
  subscriptionPlan?: string; // Changed from subscription_plan to subscriptionPlan
  subscription_end_date?: string | null;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string | null;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionPlan: string;
  deviceIDs: string[];
  createdAt: string;
  updatedAt: string;
  phone?: string | null;
  subscription_end_date?: string | null; // Added to match backend response
}

export interface UserDownloadStatsResponse {
  summary: {
    totalMoviesDownloaded: number;
    totalStorageUsed: string;
    lastDownloadDate: string | null;
  };
  detailedDownloads: Array<{
    movieId: string;
    movieTitle: string;
    thumbnailUrl: string | null; // Changed to string | null
    movieSize: number;
    downloadCount: number;
    lastDownloadDate: string;
  }>;
}

export interface Analytics {
  totalDownloads: number;
  totalSubscribers: number;
  newSubscribersThisWeek: number;
  totalMovies: number; // For Admin Dashboard Overview
}

export interface DownloadStat {
  movie_id: string;
  movie_title: string;
  download_count: number;
}

export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  price_ugx: string;
  duration_days: number;
  duration_unit: 'day' | 'week' | 'month' | 'year'; // Specific types
  description: string;
  features: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanPayload {
  plan_name: string;
  price_ugx: string;
  duration_days: number;
  duration_unit: 'day' | 'week' | 'month' | 'year'; // Specific types
  description: string;
  features: string[];
  is_active: boolean;
  display_order: number;
}

export interface GetPresignedUploadUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  folder?: 'movies' | 'thumbnails'; // Specific types for folders
}

export interface GetPresignedUploadUrlResponse {
  presignedUrl: string;
  s3Key: string; // The key (path) in S3/Wasabi to store in DB
}

// Renamed from UploadMovieData to MovieMetadataPayload for clarity
export interface MovieMetadataPayload {
  title: string;
  description: string | null;
  vj: string;
  category: string;
  movieS3Key: string; // The S3 key after direct upload
  thumbnailS3Key: string | null; // The S3 key after direct upload
  size: number; // The size of the movie file
}

export interface GetPresignedDownloadUrlResponse {
  downloadUrl: string; // The signed CloudFront URL
}

export interface InitiatePaymentRequest {
  subscription_plan_id: string;
  amount: number;
  currency: string;
  description: string;
  client_redirect_url: string;
  client_back_url: string;
  selected_payment_method: string;
}

export interface InitiatePaymentResponse {
  message: string;
  redirect_url: string;
  transaction_id: string;
  dpo_token: string;
}

export interface VerifyPaymentResponse {
  message: string;
  status: 'successful' | 'failed' | 'pending'; // Added 'pending' status
  dpoResponse?: string; // Made optional
}

export interface AdminManageSubscriptionRequest {
  action: 'activate_extend' | 'deactivate';
  subscription_plan_id?: string;
}

export interface AdminManageSubscriptionResponse {
  message: string;
  subscription?: {
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
  deactivatedSubscriptions?: Array<{
    id: string;
    user_id: string;
    status: string;
  }>;
}

// --- AXIOS CLIENT SETUP ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // General timeout for most requests (5 minutes)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization token AND Device ID
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    const deviceId = localStorage.getItem('device_id'); // Retrieve device ID from local storage

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (deviceId) {
      config.headers['X-Device-Id'] = deviceId; // Add custom header for device ID
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration or invalidity
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      // If 401, it could be token expired OR session invalidated by device check.
      // Clear token and device ID, then redirect to login.
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('device_id'); // Clear device ID on 401
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const nodeBackendService = {
  API_BASE_URL,
  FRONTEND_BASE_URL,
  CLOUDFRONT_DOMAIN, // Export CloudFront domain

  // --- AUTHENTICATION ---
  async login(email: string, password: string, deviceId: string): Promise<{ token: string; user: UserProfileResponse }> {
    try {
      devLog('Sending login request with:', { email, password: '[REDACTED]', deviceId });
      const response = await apiClient.post('/auth/login', { email, password, currentDeviceId: deviceId });
      // Store deviceId upon successful login
      localStorage.setItem('device_id', deviceId); // Use 'device_id' consistently
      return response.data;
    } catch (error) {
      console.error("Error during login via service:", error);
      throw error;
    }
  },

  async register(email: string, password: string, fullName: string, deviceId: string): Promise<{ token: string; user: UserProfileResponse }> {
    try {
      devLog('Sending registration request with:', { email, password: '[REDACTED]', fullName, deviceId });
      const response = await apiClient.post('/auth/register', { email, password, fullName, currentDeviceId: deviceId });
      // Store deviceId upon successful registration
      localStorage.setItem('device_id', deviceId); // Use 'device_id' consistently
      return response.data;
    } catch (error) {
      console.error("Error during registration via service:", error);
      throw error;
    }
  },

  async logout(deviceId: string): Promise<any> { // Logout now accepts deviceId
    try {
      // Send deviceId with logout request so backend can remove it specifically
      const response = await apiClient.post('/auth/logout', { currentDeviceId: deviceId });
      // Cleanup handled by interceptor on 401 or by AuthContext on success
      return response.data;
    } catch (error) {
      console.error("Error during logout via service:", error);
      throw error;
    }
  },

  // --- USER PROFILE ---
  async getUserProfile(): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.get('/auth/profile'); // Corrected path to /auth/profile
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  async updateUserProfile(payload: { fullName?: string; email?: string; phone?: string }): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.put('/users/profile', payload);
      const data = response.data;
      const user: UserProfileResponse = data.user || data; // Backend might return {message, user} or just user
      return user;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  async changeUserPassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/users/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      console.error("Error changing user password:", error);
      throw error;
    }
  },

  async getUserDownloadStats(): Promise<UserDownloadStatsResponse> {
    try {
      const response = await apiClient.get('/users/me/download-stats');
      return response.data;
    } catch (error) {
      console.error("Error fetching user download statistics:", error);
      throw error;
    }
  },

  // --- MOVIES (PUBLIC & ADMIN) ---
  async getMovies(): Promise<Movie[]> {
    try {
      const response = await apiClient.get('/movies');
      return response.data;
    } catch (error) {
      console.error("Error fetching movies from Node.js backend:", error);
      throw error;
    }
  },

  async getMovieById(id: string): Promise<Movie> {
    try {
      const response = await apiClient.get(`/movies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie ${id} from Node.js backend:`, error);
      throw error;
    }
  },

  async getAllMovies(): Promise<Movie[]> {
    try {
      const response = await apiClient.get('/admin/movies');
      return response.data;
    } catch (error) {
      console.error("Error fetching all movies for admin from Node.js backend:", error);
      throw error;
    }
  },

  async getPresignedUploadUrl(request: GetPresignedUploadUrlRequest): Promise<GetPresignedUploadUrlResponse> {
    try {
      const response = await apiClient.post('/admin/movies/generate-upload-url', request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `Failed to get pre-signed upload URL: ${error.message}`);
      }
      throw error;
    }
  },

  async uploadFileToS3(presignedUrl: string, file: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<void> {
    try {
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: onUploadProgress,
        timeout: 600000, // 10 minutes timeout for direct S3 upload
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `Failed to upload file directly to S3: ${error.message}`);
      }
      throw error;
    }
  },

  // Renamed from UploadMovieData to MovieMetadataPayload for clarity
  async saveMovieMetadata(data: MovieMetadataPayload): Promise<Movie> {
    try {
      const response = await apiClient.post('/admin/movies', data, {
        timeout: 60000, // 1 minute timeout for metadata save
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `Failed to record movie metadata: ${error.message}`);
      }
      throw error;
    }
  },

  async deleteMovie(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/admin/movies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting movie ${id} from Node.js backend:`, error);
      throw error;
    }
  },

  async getPresignedDownloadUrl(movieS3Key: string): Promise<GetPresignedDownloadUrlResponse> {
    try {
      const response = await apiClient.post('/users/movies/generate-download-url', { s3Key: movieS3Key });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `Failed to get pre-signed download URL: ${error.message}`);
      }
      throw error;
    }
  },

  // --- SUBSCRIPTION PLANS ---
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get('/users/subscription-plans'); // Corrected path to /users/subscription-plans
      return response.data;
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      throw error;
    }
  },

  async getAllSubscriptionPlansAdmin(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get('/admin/subscription-plans');
      return response.data;
    } catch (error) {
      console.error("Error fetching all subscription plans for admin:", error);
      throw error;
    }
  },

  async createSubscriptionPlan(payload: SubscriptionPlanPayload): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.post('/admin/subscription-plans', payload);
      return response.data;
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      throw error;
    }
  },

  async updateSubscriptionPlan(id: string, payload: Partial<SubscriptionPlanPayload>): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.put(`/admin/subscription-plans/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating subscription plan ${id}:`, error);
      throw error;
    }
  },

  async deleteSubscriptionPlan(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/admin/subscription-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subscription plan ${id}:`, error);
      throw error;
    }
  },

  // --- DPO PAYMENT INTEGRATION ---
  async initiateDPOPayment(
    payload: InitiatePaymentRequest
  ): Promise<InitiatePaymentResponse> {
    try {
      const response = await apiClient.post('/payments/initiate', payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `DPO Payment Initiation Failed: ${error.message}`);
      }
      throw error;
    }
  },

  async verifyDPOPayment(ptrId: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await apiClient.get(`/payments/verify?Ptrid=${ptrId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `DPO Payment Verification Failed: ${error.message}`);
      }
      throw error;
    }
  },

  // --- ADMIN SUBSCRIBERS ---
  async getAllSubscribers(): Promise<Profile[]> {
    try {
      const response = await apiClient.get('/admin/subscribers');
      return response.data;
    } catch (error) {
      console.error("Error fetching all subscribers for admin from Node.js backend:", error);
      throw error;
    }
  },

  async deleteSubscriber(userId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/admin/subscribers/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subscriber ${userId} from Node.js backend:`, error);
      throw error;
    }
  },

  async adminManageUserSubscription(
    userId: string,
    payload: AdminManageSubscriptionRequest
  ): Promise<AdminManageSubscriptionResponse> {
    try {
      const response = await apiClient.put(`/admin/subscribers/${userId}/manage-subscription`, payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || `Failed to manage subscription: ${error.message}`);
      }
      throw error;
    }
  },

  // --- ANALYTICS ---
  async getPlatformAnalytics(): Promise<Analytics> {
    try {
      const response = await apiClient.get('/admin/analytics');
      return response.data;
    } catch (error) {
      console.error("Error fetching platform analytics from Node.js backend:", error);
      throw error;
    }
  },

  async getMovieDownloadStats(): Promise<DownloadStat[]> {
    try {
      const response = await apiClient.get('/admin/download-stats');
      return response.data;
    } catch (error) {
      console.error("Error fetching movie download stats from Node.js backend:", error);
      throw error;
    }
  },
};
