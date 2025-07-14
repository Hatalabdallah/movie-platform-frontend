
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Download, Star, Clock, Calendar, Globe, LogOut, Crown, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock movie data - in a real app, this would come from an API
const mockMovieDetails = {
  "1": {
    id: "1",
    title: "Quantum Dreams",
    description: "A sci-fi thriller about parallel universes and the nature of reality. Dr. Sarah Chen, a quantum physicist, discovers a way to communicate with alternate versions of herself across multiple dimensions. As she explores these parallel worlds, she uncovers a cosmic threat that could destroy all realities. With time running out, she must unite with her alternate selves to save the multiverse from collapse.",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=900&fit=crop",
    year: 2024,
    duration: "2h 15m",
    genre: "Sci-Fi",
    language: "English",
    rating: 8.5,
    trailerUrl: "https://youtube.com/watch?v=example1",
    downloadCount: 1250,
    director: "Michael Rodriguez",
    cast: ["Emma Stone", "Oscar Isaac", "Lupita Nyong'o", "Dev Patel"],
    releaseDate: "2024-01-15",
    fileSize: "4.2 GB",
    quality: "4K UHD"
  }
};

const MovieDetails = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const movie = mockMovieDetails[id as keyof typeof mockMovieDetails];
  
  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
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

    setIsDownloading(true);
    
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      toast({
        title: "Download Started",
        description: `${movie.title} is being downloaded to your device.`,
      });
    }, 2000);
  };

  const handleWatchTrailer = () => {
    if (movie.trailerUrl) {
      window.open(movie.trailerUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/movies" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <Play className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">MovieFlix Pro</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <Badge variant={user.isSubscribed ? "default" : "secondary"}>
              {user.isSubscribed ? `${user.subscriptionTier} Member` : "Free Trial"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Movie Hero Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <div className="relative">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full rounded-lg shadow-2xl"
              />
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-black/80 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  {movie.rating}
                </Badge>
              </div>
            </div>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge variant="outline">{movie.genre}</Badge>
                <span className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {movie.year}
                </span>
                <span className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {movie.duration}
                </span>
                <span className="flex items-center text-muted-foreground">
                  <Globe className="h-4 w-4 mr-1" />
                  {movie.language}
                </span>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {user.isSubscribed ? (
                <Button 
                  size="lg" 
                  onClick={handleDownload}
                  disabled={isDownloading}
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
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleWatchTrailer}
                className="px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Trailer
              </Button>
            </div>

            {/* Movie Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{movie.downloadCount}</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{movie.rating}</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{movie.fileSize}</div>
                <div className="text-sm text-muted-foreground">File Size</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{movie.quality}</div>
                <div className="text-sm text-muted-foreground">Quality</div>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Details Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Movie Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Director</span>
                <span className="font-medium">{movie.director}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Release Date</span>
                <span className="font-medium">{movie.releaseDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Genre</span>
                <span className="font-medium">{movie.genre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium">{movie.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{movie.duration}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cast & Crew</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Starring</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast.map((actor, index) => (
                      <Badge key={index} variant="secondary">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Director</h4>
                  <Badge variant="outline">{movie.director}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Information */}
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
                Subscribe to MovieFlix Pro to download this movie and thousands more in high quality.
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
    </div>
  );
};

export default MovieDetails;
