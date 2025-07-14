
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Search, Filter, Download, Star, Clock, LogOut, Crown } from "lucide-react";

// Mock movie data
const mockMovies = [
  {
    id: "1",
    title: "Quantum Dreams",
    description: "A sci-fi thriller about parallel universes and the nature of reality.",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop",
    year: 2024,
    duration: "2h 15m",
    genre: "Sci-Fi",
    language: "English",
    rating: 8.5,
    trailerUrl: "https://youtube.com/watch?v=example1",
    downloadCount: 1250
  },
  {
    id: "2", 
    title: "Mountain's Call",
    description: "An epic adventure of courage and friendship in the highest peaks.",
    poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop",
    year: 2023,
    duration: "1h 58m",
    genre: "Adventure",
    language: "English",
    rating: 7.8,
    trailerUrl: "https://youtube.com/watch?v=example2",
    downloadCount: 890
  },
  {
    id: "3",
    title: "Digital Hearts",
    description: "A romantic drama exploring love in the age of artificial intelligence.",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop",
    year: 2024,
    duration: "1h 42m",
    genre: "Romance",
    language: "English", 
    rating: 7.2,
    trailerUrl: "https://youtube.com/watch?v=example3",
    downloadCount: 2100
  },
  {
    id: "4",
    title: "Shadows of Tokyo",
    description: "A noir thriller set in the neon-lit streets of modern Tokyo.",
    poster: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=300&h=450&fit=crop",
    year: 2023,
    duration: "2h 8m",
    genre: "Thriller",
    language: "Japanese",
    rating: 8.9,
    trailerUrl: "https://youtube.com/watch?v=example4",
    downloadCount: 1560
  }
];

const Movies = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredMovies = mockMovies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all" || movie.genre === selectedGenre;
    const matchesLanguage = selectedLanguage === "all" || movie.language === selectedLanguage;
    
    return matchesSearch && matchesGenre && matchesLanguage;
  });

  const genres = ["all", ...Array.from(new Set(mockMovies.map(m => m.genre)))];
  const languages = ["all", ...Array.from(new Set(mockMovies.map(m => m.language)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
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
        {/* Subscription Check */}
        {!user.isSubscribed && (
          <Card className="mb-8 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Crown className="h-6 w-6 text-orange-500" />
                <CardTitle className="text-orange-700 dark:text-orange-300">
                  Subscription Required
                </CardTitle>
              </div>
              <CardDescription className="text-orange-600 dark:text-orange-400">
                You need an active subscription to download movies. Browse our collection and subscribe to get started!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/subscription">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Subscribe Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Movie Library</h2>
          <p className="text-muted-foreground">
            Discover and download premium movies in high quality
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full md:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>
                  {genre === "all" ? "All Genres" : genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(language => (
                <SelectItem key={language} value={language}>
                  {language === "all" ? "All Languages" : language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Movies Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map(movie => (
            <Card key={movie.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/80 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    {movie.rating}
                  </Badge>
                </div>
                <div className="absolute bottom-2 left-2">
                  <Badge variant="outline" className="bg-black/80 text-white border-white/20">
                    {movie.genre}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{movie.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{movie.year}</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {movie.duration}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="line-clamp-2 mb-4">
                  {movie.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {movie.downloadCount} downloads
                  </span>
                  <div className="flex space-x-2">
                    <Link to={`/movies/${movie.id}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                    {user.isSubscribed ? (
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    ) : (
                      <Button size="sm" disabled>
                        <Crown className="h-4 w-4 mr-1" />
                        Subscribe
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">No movies found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
