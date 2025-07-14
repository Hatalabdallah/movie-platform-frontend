
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Play, CheckCircle, Calendar, User, Globe, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { movieService, Movie } from "@/services/movieService";
import { useAuth } from "@/contexts/AuthContext";

interface MovieCardProps {
  movie: Movie;
  isDownloaded?: boolean;
  onDownload?: () => void;
}

export function MovieCard({ movie, isDownloaded = false, onDownload }: MovieCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDownload = async () => {
    if (!user || isDownloaded) return;

    try {
      setIsDownloading(true);
      
      // Record the download
      await movieService.recordDownload(user.id, movie.id);
      
      // If there's a file URL, trigger download
      if (movie.file_url) {
        window.open(movie.file_url, '_blank');
      }

      toast({
        title: "Download Started",
        description: `${movie.title} download has been initiated.`
      });

      // Call the callback to refresh the parent component
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "There was an error starting the download.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[2/3] relative">
        {movie.thumbnail_url ? (
          <img
            src={movie.thumbnail_url}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Play className="h-12 w-12 text-primary/50" />
          </div>
        )}
        {isDownloaded && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-green-500/90 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Downloaded
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{movie.title}</CardTitle>
        <CardDescription className="space-y-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{movie.vj}</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>{movie.language}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              <span>{movie.size}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(movie.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline">{movie.category}</Badge>
        </div>
        
        {isDownloaded ? (
          <Button disabled className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Already Downloaded
          </Button>
        ) : (
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
