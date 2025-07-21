// movie-platform-frontend/src/components/MovieCard.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Play, Calendar, Crown, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Removed useAuth import as isSubscribed will be passed as a prop
// import { useAuth } from "@/contexts/AuthContext"; 
import { Movie as NodeMovie } from "@/services/nodeBackendService";
import { Link } from "react-router-dom";

// Get the backend URL from environment variables
const BACKEND_BASE_URL = import.meta.env.VITE_NODE_BACKEND_URL || 'http://localhost:3001';

interface MovieCardProps {
  movie: NodeMovie;
  isSubscribed: boolean; // NEW: Add isSubscribed as a prop
}

export function MovieCard({ movie, isSubscribed }: MovieCardProps) { // Destructure isSubscribed prop
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  // Removed user from useAuth as isSubscribed is now a prop
  // const { user } = useAuth(); 

  // Construct the full absolute URL for the thumbnail
  const fullThumbnailUrl = movie.thumbnail_url
    ? `${BACKEND_BASE_URL}${movie.thumbnail_url}`
    : null;

  console.log(`Movie ID: ${movie.id}, Title: ${movie.title}, Thumbnail URL: ${fullThumbnailUrl}`);
  console.log(`  Created at value:`, movie.created_at, `(type: ${typeof movie.created_at})`);
  // Add a log for the isSubscribed prop to debug its value
  console.log(`  isSubscribed prop in MovieCard:`, isSubscribed);


  const handleDownload = async () => {
    // Use the isSubscribed prop directly
    if (!isSubscribed) { 
      toast({
        title: "Subscription Required",
        description: "You need an active subscription to download movies.",
        variant: "destructive"
      });
      return;
    }

    if (!movie.file_url) {
      toast({
        title: "Error",
        description: "Movie file URL is missing.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      window.open(movie.file_url, '_blank'); // Directly opens the file URL

      toast({
        title: "Download Initiated",
        description: `Attempting to download ${movie.title}.`
      });
    } catch (error) {
      console.error("Direct access error:", error);
      toast({
        title: "Action Failed",
        description: "Could not initiate movie download.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Use the isSubscribed prop directly
  const isUserAllowedToDownload = isSubscribed;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* This Link wraps the image and header, making them clickable for navigation */}
      <Link to={`/movies/${movie.id}`} className="block">
        <div className="aspect-[2/3] relative">
          {fullThumbnailUrl ? (
            <img
              src={fullThumbnailUrl}
              alt={`${movie.title} thumbnail`}
              className="w-full h-full object-cover rounded-t-lg"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.png';
                e.currentTarget.alt = 'Thumbnail not available';
                console.error(`Failed to load thumbnail for ${movie.title}: ${fullThumbnailUrl} (attempted URL)`);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center rounded-t-lg">
              <Play className="h-12 w-12 text-primary/50" />
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2">{movie.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-1">
              {movie.vj && (
                  <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{movie.vj}</span>
                  </span>
              )}
              <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                      {movie.created_at && !isNaN(new Date(movie.created_at).getTime())
                          ? new Date(movie.created_at).toLocaleDateString()
                          : "Invalid Date"}
                  </span>
              </span>
          </div>
          {movie.category && <Badge variant="secondary" className="mr-auto">{movie.category}</Badge>}
        </CardHeader>
      </Link>

      <CardContent className="pt-0">
        {isUserAllowedToDownload ? (
          <Button
            onClick={handleDownload}
            disabled={isDownloading || !movie.file_url}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Initiating Download..." : "Download Now"}
          </Button>
        ) : (
          <Link to="/subscription" className="w-full">
            <Button className="w-full">
              <Crown className="h-4 w-4 mr-2" />
              Subscribe to Download
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
