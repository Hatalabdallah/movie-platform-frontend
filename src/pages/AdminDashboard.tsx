
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Upload, Users, BarChart3, LogOut, Film, Trash2, Edit, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { movieService, Movie } from "@/services/movieService";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalSubscribers: 0,
    totalDownloads: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    vj: "",
    language: "English",
    category: "Action",
    size: "",
    thumbnail_url: "",
    file_url: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!user.isAdmin) {
      navigate("/dashboard");
    } else {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [moviesData, statsData] = await Promise.all([
        movieService.getAllMovies(),
        movieService.getMovieStats()
      ]);
      
      setMovies(moviesData);
      setStats(prev => ({
        ...prev,
        totalMovies: statsData.totalMovies,
        totalDownloads: statsData.totalDownloads
      }));
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.isAdmin) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.vj || !uploadForm.size) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await movieService.uploadMovie({
        title: uploadForm.title,
        vj: uploadForm.vj,
        language: uploadForm.language,
        category: uploadForm.category,
        size: uploadForm.size,
        thumbnail_url: uploadForm.thumbnail_url || null,
        file_url: uploadForm.file_url || null
      });

      toast({
        title: "Success",
        description: `${uploadForm.title} has been uploaded successfully!`
      });

      setUploadForm({
        title: "",
        vj: "",
        language: "English",
        category: "Action",
        size: "",
        thumbnail_url: "",
        file_url: ""
      });

      // Reload data to show the new movie
      await loadData();
    } catch (error) {
      console.error("Error uploading movie:", error);
      toast({
        title: "Error",
        description: "Failed to upload movie",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await movieService.deleteMovie(id);
      
      toast({
        title: "Success",
        description: `${title} has been deleted successfully`
      });

      // Reload data to reflect the deletion
      await loadData();
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast({
        title: "Error",
        description: "Failed to delete movie",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Play className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">MovieFlix Pro - Admin</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <Badge variant="destructive">Admin</Badge>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage movies, subscribers, and platform analytics
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Movies</CardTitle>
                  <div className="text-2xl font-bold">{stats.totalMovies}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Available movies</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
                  <div className="text-2xl font-bold">{stats.totalDownloads}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">All time downloads</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscribers</CardTitle>
                  <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Active users</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                  <div className="text-2xl font-bold">${stats.monthlyRevenue}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Movies */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Movies</CardTitle>
                <CardDescription>Latest uploads to the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {movies.slice(0, 5).map(movie => (
                  <div key={movie.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{movie.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {movie.language} • {movie.category} • {movie.size}
                      </p>
                    </div>
                    <Badge variant="secondary">{movie.status}</Badge>
                  </div>
                ))}
                {movies.length === 0 && (
                  <p className="text-muted-foreground">No movies uploaded yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movies" className="space-y-6">
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Upload New Movie
                </CardTitle>
                <CardDescription>Add a new movie to the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Movie Title *</Label>
                      <Input
                        id="title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                        placeholder="Enter movie title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vj">VJ/Uploader *</Label>
                      <Input
                        id="vj"
                        value={uploadForm.vj}
                        onChange={(e) => setUploadForm({...uploadForm, vj: e.target.value})}
                        placeholder="Enter VJ name"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={uploadForm.language} onValueChange={(value) => setUploadForm({...uploadForm, language: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Japanese">Japanese</SelectItem>
                          <SelectItem value="Korean">Korean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({...uploadForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Action">Action</SelectItem>
                          <SelectItem value="Adventure">Adventure</SelectItem>
                          <SelectItem value="Comedy">Comedy</SelectItem>
                          <SelectItem value="Drama">Drama</SelectItem>
                          <SelectItem value="Horror">Horror</SelectItem>
                          <SelectItem value="Romance">Romance</SelectItem>
                          <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                          <SelectItem value="Thriller">Thriller</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="size">File Size *</Label>
                      <Input
                        id="size"
                        value={uploadForm.size}
                        onChange={(e) => setUploadForm({...uploadForm, size: e.target.value})}
                        placeholder="e.g., 1.5GB, 720MB"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                      <Input
                        id="thumbnail_url"
                        value={uploadForm.thumbnail_url}
                        onChange={(e) => setUploadForm({...uploadForm, thumbnail_url: e.target.value})}
                        placeholder="Movie poster/thumbnail URL"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file_url">Download File URL</Label>
                    <Input
                      id="file_url"
                      value={uploadForm.file_url}
                      onChange={(e) => setUploadForm({...uploadForm, file_url: e.target.value})}
                      placeholder="Direct download link"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? "Uploading..." : "Upload Movie"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Movie Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Film className="h-5 w-5 mr-2" />
                  Manage Movies ({movies.length})
                </CardTitle>
                <CardDescription>Edit or delete existing movies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {movies.map(movie => (
                    <div key={movie.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{movie.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          VJ: {movie.vj} • {movie.language} • {movie.category} • {movie.size}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(movie.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={movie.status === 'available' ? 'default' : 'secondary'}>
                          {movie.status}
                        </Badge>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteMovie(movie.id, movie.title)} disabled={loading}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  {movies.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No movies uploaded yet. Upload your first movie above!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Subscriber Management
                </CardTitle>
                <CardDescription>View and manage platform subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-center text-muted-foreground py-8">
                    Subscriber management functionality will be implemented here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Platform Analytics
                </CardTitle>
                <CardDescription>Download trends and user analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Top Downloaded Movies</h4>
                    <div className="space-y-2">
                      {movies.slice(0, 5).map((movie, index) => (
                        <div key={movie.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <span>{movie.title}</span>
                          </div>
                          <span className="font-bold">0 downloads</span>
                        </div>
                      ))}
                      {movies.length === 0 && (
                        <p className="text-muted-foreground">No movies available yet</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Subscription Distribution</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">0%</div>
                        <div className="text-sm text-muted-foreground">Basic</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">0%</div>
                        <div className="text-sm text-muted-foreground">Premium</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">0%</div>
                        <div className="text-sm text-muted-foreground">Enterprise</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
