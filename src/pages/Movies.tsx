
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Search, Filter, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { movieService, Movie } from "@/services/movieService";
import { MovieCard } from "@/components/MovieCard";
import { ThemeToggle } from "@/components/ThemeToggle";

const Movies = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [userDownloads, setUserDownloads] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [moviesData, downloadsData] = await Promise.all([
        movieService.getMovies(),
        movieService.getUserDownloads(user!.id)
      ]);
      
      setMovies(moviesData);
      setUserDownloads(downloadsData.map(d => d.movie_id));
    } catch (error) {
      console.error("Error loading movies:", error);
      toast({
        title: "Error",
        description: "Failed to load movies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Single device enforcement - sign out globally
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.vj.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || movie.category === selectedCategory;
    const matchesLanguage = selectedLanguage === "all" || movie.language === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const categories = [...new Set(movies.map(movie => movie.category))];
  const languages = [...new Set(movies.map(movie => movie.language))];

  if (!user) return null;

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
            <ThemeToggle />
            <Badge variant="secondary">Premium</Badge>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Movie Library</h2>
          <p className="text-muted-foreground">
            Download your favorite movies. Each movie can only be downloaded once.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search movies or VJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map(language => (
                    <SelectItem key={language} value={language}>{language}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted aspect-[2/3] rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No movies found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== "all" || selectedLanguage !== "all"
                ? "Try adjusting your search criteria"
                : "No movies are available at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isDownloaded={userDownloads.includes(movie.id)}
                onDownload={loadData}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Showing {filteredMovies.length} of {movies.length} movies
            {userDownloads.length > 0 && (
              <span className="ml-2">• {userDownloads.length} downloaded</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Movies;
