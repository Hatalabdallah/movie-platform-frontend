
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Movie = Tables<"movies">;
export type MovieInsert = TablesInsert<"movies">;

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

  // Get recent movies with download counts
  async getRecentMoviesWithStats() {
    const { data, error } = await supabase
      .from("movies")
      .select(`
        *,
        downloads(count)
      `)
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  }
};
