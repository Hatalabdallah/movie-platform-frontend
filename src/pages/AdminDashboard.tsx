
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

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    language: "English",
    genre: "Action",
    trailerUrl: "",
    poster: null as File | null,
    movieFile: null as File | null
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!user.isAdmin) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (!user || !user.isAdmin) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Movie uploaded successfully!",
      description: `${uploadForm.title} has been added to the library.`,
    });
    setUploadForm({
      title: "",
      description: "",
      language: "English", 
      genre: "Action",
      trailerUrl: "",
      poster: null,
      movieFile: null
    });
  };

  const mockStats = {
    totalMovies: 1247,
    totalSubscribers: 8942,
    totalDownloads: 45678,
    monthlyRevenue: 89420
  };

  const mockRecentMovies = [
    { id: "1", title: "Quantum Dreams", downloads: 1250, uploadDate: "2024-01-15" },
    { id: "2", title: "Mountain's Call", downloads: 890, uploadDate: "2024-01-14" },
    { id: "3", title: "Digital Hearts", downloads: 2100, uploadDate: "2024-01-13" },
  ];

  const mockRecentSubscribers = [
    { id: "1", name: "John Doe", email: "john@example.com", signupDate: "2024-01-15", plan: "Premium" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", signupDate: "2024-01-14", plan: "Basic" },
    { id: "3", name: "Bob Wilson", email: "bob@example.com", signupDate: "2024-01-13", plan: "Enterprise" },
  ];

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
                  <div className="text-2xl font-bold">{mockStats.totalMovies.toLocaleString()}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+12 this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscribers</CardTitle>
                  <div className="text-2xl font-bold">{mockStats.totalSubscribers.toLocaleString()}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+347 this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
                  <div className="text-2xl font-bold">{mockStats.totalDownloads.toLocaleString()}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+2,341 this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                  <div className="text-2xl font-bold">${mockStats.monthlyRevenue.toLocaleString()}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+15.3% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Movies</CardTitle>
                  <CardDescription>Latest uploads to the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRecentMovies.map(movie => (
                    <div key={movie.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{movie.title}</p>
                        <p className="text-sm text-muted-foreground">{movie.uploadDate}</p>
                      </div>
                      <Badge variant="secondary">{movie.downloads} downloads</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Subscribers</CardTitle>
                  <CardDescription>New users who joined recently</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRecentSubscribers.map(subscriber => (
                    <div key={subscriber.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{subscriber.name}</p>
                        <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                      </div>
                      <Badge variant="outline">{subscriber.plan}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
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
                      <Label htmlFor="title">Movie Title</Label>
                      <Input
                        id="title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                        placeholder="Enter movie title"
                        required
                      />
                    </div>
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
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="genre">Genre</Label>
                      <Select value={uploadForm.genre} onValueChange={(value) => setUploadForm({...uploadForm, genre: value})}>
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
                    <div className="space-y-2">
                      <Label htmlFor="trailerUrl">Trailer URL</Label>
                      <Input
                        id="trailerUrl"
                        value={uploadForm.trailerUrl}
                        onChange={(e) => setUploadForm({...uploadForm, trailerUrl: e.target.value})}
                        placeholder="YouTube or video URL"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                      placeholder="Enter movie description"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="poster">Movie Poster</Label>
                      <Input
                        id="poster"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setUploadForm({...uploadForm, poster: e.target.files?.[0] || null})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="movieFile">Movie File</Label>
                      <Input
                        id="movieFile"
                        type="file"
                        accept="video/*"
                        onChange={(e) => setUploadForm({...uploadForm, movieFile: e.target.files?.[0] || null})}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Movie
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Movie Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Film className="h-5 w-5 mr-2" />
                  Manage Movies
                </CardTitle>
                <CardDescription>Edit or delete existing movies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentMovies.map(movie => (
                    <div key={movie.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{movie.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {movie.downloads} downloads • Uploaded {movie.uploadDate}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
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
                  {mockRecentSubscribers.map(subscriber => (
                    <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{subscriber.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {subscriber.email} • Joined {subscriber.signupDate}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{subscriber.plan}</Badge>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
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
                      {mockRecentMovies.sort((a, b) => b.downloads - a.downloads).map((movie, index) => (
                        <div key={movie.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <span>{movie.title}</span>
                          </div>
                          <span className="font-bold">{movie.downloads.toLocaleString()} downloads</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Subscription Distribution</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">45%</div>
                        <div className="text-sm text-muted-foreground">Basic</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">40%</div>
                        <div className="text-sm text-muted-foreground">Premium</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">15%</div>
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
