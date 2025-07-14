
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Play, Upload, Users, BarChart3, LogOut, Film, Trash2, Plus, TrendingUp, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { movieService, Movie, Profile } from "@/services/movieService";
import { ThemeToggle } from "@/components/ThemeToggle";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [subscribers, setSubscribers] = useState<Profile[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [downloadStats, setDownloadStats] = useState<any[]>([]);
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
      const [moviesData, subscribersData, analyticsData, downloadStatsData] = await Promise.all([
        movieService.getAllMovies(),
        movieService.getAllSubscribers(),
        movieService.getPlatformAnalytics(),
        movieService.getMovieDownloadStats()
      ]);
      
      setMovies(moviesData);
      setSubscribers(subscribersData);
      setAnalytics(analyticsData);
      setDownloadStats(downloadStatsData);
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
    try {
      setLoading(true);
      await movieService.deleteMovie(id);
      
      toast({
        title: "Success",
        description: `${title} has been deleted successfully`
      });

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

  const handleDeleteSubscriber = async (id: string, email: string) => {
    try {
      setLoading(true);
      await movieService.deleteSubscriber(id);
      
      toast({
        title: "Success",
        description: `Subscriber ${email} has been deleted successfully`
      });

      await loadData();
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
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
            <ThemeToggle />
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
                  <div className="text-2xl font-bold">{movies.length}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Available movies</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
                  <div className="text-2xl font-bold">{analytics?.totalDownloads || 0}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">All time downloads</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscribers</CardTitle>
                  <div className="text-2xl font-bold">{analytics?.totalSubscribers || 0}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Active users</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">New This Week</CardTitle>
                  <div className="text-2xl font-bold">{analytics?.newSubscribersThisWeek || 0}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">New subscribers</p>
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={loading}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Movie</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{movie.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteMovie(movie.id, movie.title)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                  Subscriber Management ({subscribers.length})
                </CardTitle>
                <CardDescription>View and manage platform subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscribers.map(subscriber => (
                    <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{subscriber.full_name || subscriber.email}</h4>
                        <p className="text-sm text-muted-foreground">
                          {subscriber.email} • Joined {new Date(subscriber.created_at).toLocaleDateString()}
                        </p>
                        {subscriber.phone && (
                          <p className="text-xs text-muted-foreground">Phone: {subscriber.phone}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {subscriber.email === 'admin@movieflix.com' ? 'Admin' : 'Subscriber'}
                        </Badge>
                        {subscriber.email !== 'admin@movieflix.com' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={loading}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete subscriber "{subscriber.email}"? This will permanently remove their access to the platform.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSubscriber(subscriber.id, subscriber.email)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                  {subscribers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No subscribers found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Total Downloads
                  </CardTitle>
                  <div className="text-2xl font-bold">{analytics?.totalDownloads || 0}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Across all movies</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Active Subscribers
                  </CardTitle>
                  <div className="text-2xl font-bold">{analytics?.totalSubscribers || 0}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    This Week
                  </CardTitle>
                  <div className="text-2xl font-bold">{analytics?.newSubscribersThisWeek || 0}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">New subscribers</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Top Downloaded Movies
                </CardTitle>
                <CardDescription>Most popular movies by download count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {downloadStats.slice(0, 10).map((movie, index) => (
                    <div key={movie.movie_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{movie.movie_title}</p>
                          <p className="text-sm text-muted-foreground">Movie ID: {movie.movie_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{movie.download_count}</div>
                        <div className="text-xs text-muted-foreground">downloads</div>
                      </div>
                    </div>
                  ))}
                  {downloadStats.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No download data available yet.
                    </p>
                  )}
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
