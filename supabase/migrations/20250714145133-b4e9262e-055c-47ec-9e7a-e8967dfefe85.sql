
-- First, let's update the downloads table to better track download history
-- and add some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_downloads_user_movie ON downloads(user_id, movie_id);
CREATE INDEX IF NOT EXISTS idx_downloads_movie_id ON downloads(movie_id);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(downloaded_at);

-- Add a function to get download statistics
CREATE OR REPLACE FUNCTION get_movie_download_stats()
RETURNS TABLE (
  movie_id uuid,
  movie_title text,
  download_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as movie_id,
    m.title as movie_title,
    COALESCE(COUNT(d.id), 0) as download_count
  FROM movies m
  LEFT JOIN downloads d ON m.id = d.movie_id
  WHERE m.status = 'available'
  GROUP BY m.id, m.title
  ORDER BY download_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a function to check if user has downloaded a movie
CREATE OR REPLACE FUNCTION has_user_downloaded_movie(user_uuid uuid, movie_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM downloads 
    WHERE user_id = user_uuid AND movie_id = movie_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get analytics data
CREATE OR REPLACE FUNCTION get_platform_analytics()
RETURNS JSON AS $$
DECLARE
  total_downloads bigint;
  total_subscribers bigint;
  new_subscribers_this_week bigint;
  result JSON;
BEGIN
  -- Get total downloads
  SELECT COUNT(*) INTO total_downloads FROM downloads;
  
  -- Get total subscribers (users with profiles)
  SELECT COUNT(*) INTO total_subscribers FROM profiles;
  
  -- Get new subscribers this week
  SELECT COUNT(*) INTO new_subscribers_this_week 
  FROM profiles 
  WHERE created_at >= DATE_TRUNC('week', NOW());
  
  -- Build result JSON
  SELECT json_build_object(
    'totalDownloads', total_downloads,
    'totalSubscribers', total_subscribers,
    'newSubscribersThisWeek', new_subscribers_this_week
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policy for profiles to allow admin access
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles" ON profiles
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE email = 'admin@movieflix.com'
  ) OR auth.uid() = id
);

-- Add delete policy for profiles (admin only)
CREATE POLICY "Admin can delete profiles" ON profiles
FOR DELETE USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE email = 'admin@movieflix.com'
  )
);
