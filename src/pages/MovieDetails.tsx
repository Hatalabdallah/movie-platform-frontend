// movie-platform-frontend/src/pages/MovieDetails.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Download, Star, Clock, Calendar, Globe, LogOut, Crown, ArrowLeft, Sun, Moon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast"; // Corrected import path
import { Movie as NodeMovie, nodeBackendService, CLOUDFRONT_DOMAIN } from "@/services/nodeBackendService";
import { useTheme } from '@/contexts/ThemeContext';

const MovieDetails = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [movie, setMovie] = useState<NodeMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchMovieDetails = async () => {
      if (!id) {
        setError("Movie ID is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const fetchedMovie = await nodeBackendService.getMovieById(id);
        setMovie(fetchedMovie);
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError("Failed to load movie details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [user, navigate, id]);


  if (!user) return null;


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <p className="text-lg text-muted-foreground">Loading movie details...</p>
      </div>
    );
  }


  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Movie Not Found"}</h1>
          <Link to="/movies">
            <Button>Back to Movies</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDownload = async () => {
    if (!user.isSubscribed) {
      toast({
        title: "Subscription Required",
        description: "You need an active subscription to download movies.",
        variant: "destructive",
      });
      return;
    }

    // Ensure movie.s3_key exists before attempting download
    // The backend now expects s3_key to generate the signed URL
    if (!movie.s3_key) {
      toast({
        title: "Error",
        description: "Movie file key is missing. Cannot download.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    try {
      // Request a pre-signed download URL from your backend
      // This calls the new endpoint in userRoutes.js
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
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatMovieDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return "Invalid Date";
    }
  };

  // Simplified thumbnail URL construction:
  // We assume the backend always returns the full CloudFront URL in movie.thumbnail_url
  const thumbnailUrl = movie.thumbnail_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/movies" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Ronnie's Ent</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Badge variant={user.isSubscribed ? "default" : "secondary"}>
              {user.isSubscribed ? `${user.subscriptionPlan || 'Active'} Member` : "Free Trial"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="relative">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={`${movie.title} thumbnail`}
                  className="w-full rounded-lg shadow-2xl object-cover aspect-[2/3]"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                    e.currentTarget.alt = 'Thumbnail not available';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center rounded-lg shadow-2xl aspect-[2/3]">
                  <Film className="h-24 w-24 text-primary/50" />
                </div>
              )}
              <div className="absolute top-4 right-4"></div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {movie.category && <Badge variant="outline">{movie.category}</Badge>}
                {movie.created_at && (
                  <span className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatMovieDate(movie.created_at)}
                  </span>
                )}
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {movie.description || "No description available."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {user.isSubscribed ? (
                <Button
                  size="lg"
                  onClick={handleDownload}
                  disabled={isDownloading || !movie.s3_key} // Now checks for s3_key
                  className="px-8"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {isDownloading ? "Downloading..." : "Download Movie"}
                </Button>
              ) : (
                <Link to="/subscription">
                  <Button size="lg" className="px-8">
                    <Crown className="h-5 w-5 mr-2" />
                    Subscribe to Download
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{movie.size ?
                  (movie.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB' : 'N/A'}</div>
                <div className="text-sm text-muted-foreground">File Size</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Movie Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">VJ</span>
                <span className="font-medium">{movie.vj}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{movie.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created At</span>
                <span
                  className="font-medium">{formatMovieDate(movie.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {movie.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{movie.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {!user.isSubscribed && (
          <Card className="mt-6 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Crown className="h-6 w-6 text-orange-500" />
                <CardTitle className="text-orange-700 dark:text-orange-300">
                  Subscription Required
                </CardTitle>
              </div>
              <CardDescription className="text-orange-600 dark:text-orange-400">
                Subscribe to Ronnie's Ent to download this movie and thousands more in
                high quality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/subscription">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  View Subscription Plans
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <footer className="border-t bg-background py-12 px-4 mt-auto">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Ronnie's Ent</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {currentYear} Ronnie's Ent. All Rights Reserved. | Designed by{' '}
            <a
              href="https://kyakabi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Kyakabi Group
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MovieDetails;
