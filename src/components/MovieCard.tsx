// movie-platform-frontend/src/components/MovieCard.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, Download, Play, Calendar, Crown, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast"; // Corrected import path
// Import Movie interface and CLOUDFRONT_DOMAIN from nodeBackendService
import { Movie as NodeMovie, nodeBackendService, CLOUDFRONT_DOMAIN } from "@/services/nodeBackendService";
import { Link } from "react-router-dom";

interface MovieCardProps {
  movie: NodeMovie;
  isSubscribed: boolean;
}

export function MovieCard({ movie, isSubscribed }: MovieCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // The backend should now be providing the full CloudFront URL directly in movie.thumbnail_url.
  // We will directly use this URL.
  const fullThumbnailUrl = movie.thumbnail_url;

  console.log(`Movie ID: ${movie.id}, Title: ${movie.title}, Thumbnail URL: ${fullThumbnailUrl}`);
  console.log(`  Created at value:`, movie.created_at, `(type: ${typeof movie.created_at})`);
  console.log(`  isSubscribed prop in MovieCard:`, isSubscribed);


  const handleDownload = async () => {
    if (!isSubscribed) {
      toast({
        title: "Subscription Required",
        description: "You need an active subscription to download movies.",
        variant: "destructive"
      });
      return;
    }

    // Now check for movie.s3_key, as this is what the backend uses for signed URLs
    if (!movie.s3_key) {
      toast({
        title: "Error",
        description: "Movie file key is missing. Cannot download.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    try {
      // Request a pre-signed download URL from your backend
      const response = await nodeBackendService.getPresignedDownloadUrl(movie.s3_key);
      const downloadUrl = response.downloadUrl;

      // Redirect the user to the signed CloudFront URL to initiate download
      window.open(downloadUrl, '_blank');

      toast({
        title: "Download Initiated",
        description: `${movie.title} download should begin shortly.`,
      });
    } catch (error) {
      console.error("Error initiating download:", error);
      toast({
        title: "Download Failed",
        description: `Could not initiate movie download: ${(error as Error).message}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const isUserAllowedToDownload = isSubscribed;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/movies/${movie.id}`} className="block">
        <div className="aspect-[2/3] relative">
          {fullThumbnailUrl ? (
            <img
              src={fullThumbnailUrl} // Directly use the full CDN URL here
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
              <Film className="h-12 w-12 text-primary/50" />
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
            disabled={isDownloading || !movie.s3_key} // Now checks for s3_key
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
