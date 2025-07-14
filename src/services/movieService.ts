
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Movie = Tables<"movies">;
export type MovieInsert = TablesInsert<"movies">;
export type Download = Tables<"downloads">;
export type Profile = Tables<"profiles">;

export const movieService = {
  // Get all available movies for subscribers
  async getMovies() {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get a single movie by ID
  async getMovieById(id: string) {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("id", id)
      .eq("status", "available")
      .single();

    if (error) throw error;
    return data;
  },

  // Check if user has downloaded a movie
  async hasUserDownloadedMovie(userId: string, movieId: string) {
    const { data, error } = await supabase
      .rpc("has_user_downloaded_movie", {
        user_uuid: userId,
        movie_uuid: movieId
      });

    if (error) throw error;
    return data;
  },

  // Record a download
  async recordDownload(userId: string, movieId: string) {
    const { data, error } = await supabase
      .from("downloads")
      .insert([{
        user_id: userId,
        movie_id: movieId,
        ip_address: null // You can add IP tracking if needed
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's downloads
  async getUserDownloads(userId: string) {
    const { data, error } = await supabase
      .from("downloads")
      .select(`
        *,
        movies (*)
      `)
      .eq("user_id", userId)
      .order("downloaded_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Admin: Get all movies regardless of status
  async getAllMovies() {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Admin: Upload a new movie
  async uploadMovie(movieData: {
    title: string;
    vj: string;
    language: string;
    size: string;
    category: string;
    thumbnail_url?: string;
    file_url?: string;
  }) {
    const { data, error } = await supabase
      .from("movies")
      .insert([movieData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin: Update a movie
  async updateMovie(id: string, updates: Partial<Movie>) {
    const { data, error } = await supabase
      .from("movies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin: Delete a movie
  async deleteMovie(id: string) {
    const { data, error } = await supabase
      .from("movies")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get movie statistics
  async getMovieStats() {
    const { data: moviesCount } = await supabase
      .from("movies")
      .select("id", { count: "exact" })
      .eq("status", "available");

    const { data: downloadsCount } = await supabase
      .from("downloads")
      .select("id", { count: "exact" });

    return {
      totalMovies: moviesCount?.length || 0,
      totalDownloads: downloadsCount?.length || 0,
    };
  },

  // Get platform analytics
  async getPlatformAnalytics() {
    const { data, error } = await supabase.rpc("get_platform_analytics");
    if (error) throw error;
    return data;
  },

  // Get movie download statistics
  async getMovieDownloadStats() {
    const { data, error } = await supabase.rpc("get_movie_download_stats");
    if (error) throw error;
    return data;
  },

  // Admin: Get all subscribers
  async getAllSubscribers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Admin: Delete a subscriber
  async deleteSubscriber(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
