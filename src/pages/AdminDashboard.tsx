// movie-platform-frontend/src/pages/AdminDashboard.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Film, Upload, Users, BarChart3, LogOut, Trash2, Plus, TrendingUp, Download, Settings, Loader2, Check, Edit, Sun, Moon, Crown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nodeBackendService, Movie, Profile, Analytics, DownloadStat, SubscriptionPlan, SubscriptionPlanPayload, MovieMetadataPayload, AdminManageSubscriptionRequest, GetPresignedUploadUrlRequest } from "@/services/nodeBackendService";
import { Progress } from "@/components/ui/progress";
import { useTheme } from '@/contexts/ThemeContext';

const initialPlanFormState: SubscriptionPlanPayload = {
  plan_name: "",
  price_ugx: "",
  duration_days: 0,
  duration_unit: "month",
  description: "",
  features: [],
  is_active: true,
  display_order: 0,
};

interface FileUploadState {
  id: string;
  file: File;
  title: string;
  description: string;
  vj: string;
  category: string;
  thumbnailFile: File | null;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  s3Key?: string;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    vj: "",
    category: "Action",
  });
  const movieFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const [movieFiles, setMovieFiles] = useState<File[]>([]);
  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
  const [activeUploads, setActiveUploads] = useState<FileUploadState[]>([]);

  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<SubscriptionPlanPayload>(initialPlanFormState);
  const [featuresInput, setFeaturesInput] = useState<string>("");

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [currentSubscriber, setCurrentSubscriber] = useState<Profile | null>(null);
  const [selectedSubscriptionPlanId, setSelectedSubscriptionPlanId] = useState<string>("");
  const [subscriptionAction, setSubscriptionAction] = useState<'activate_extend' | 'deactivate'>('activate_extend');

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!user.isAdmin) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const { data: movies, isLoading: isLoadingMovies, error: errorLoadingMovies } = useQuery<Movie[], Error>({
    queryKey: ['adminMovies'],
    queryFn: nodeBackendService.getAllMovies,
    enabled: !!user?.isAdmin,
    onError: (err) => {
      console.error("Error fetching admin movies:", err);
      toast({ title: "Error", description: `Failed to load movies: ${err.message}`, variant: "destructive" });
    },
  });

  const { data: subscribers, isLoading: isLoadingSubscribers, error: errorLoadingSubscribers } = useQuery<Profile[], Error>({
    queryKey: ['adminSubscribers'],
    queryFn: nodeBackendService.getAllSubscribers,
    enabled: !!user?.isAdmin,
    onError: (err) => {
      console.error("Error fetching admin subscribers:", err);
      toast({ title: "Error", description: `Failed to load subscribers: ${err.message}`, variant: "destructive" });
    },
  });

  const { data: analytics, isLoading: isLoadingAnalytics, error: errorLoadingAnalytics } = useQuery<Analytics, Error>({
    queryKey: ['adminAnalytics'],
    queryFn: nodeBackendService.getPlatformAnalytics,
    enabled: !!user?.isAdmin,
    onError: (err) => {
      console.error("Error fetching platform analytics:", err);
      toast({ title: "Error", description: `Failed to load analytics: ${err.message}`, variant: "destructive" });
    },
  });

  const { data: downloadStats, isLoading: isLoadingDownloadStats, error: errorLoadingDownloadStats } = useQuery<DownloadStat[], Error>({
    queryKey: ['adminDownloadStats'],
    queryFn: nodeBackendService.getMovieDownloadStats,
    enabled: !!user?.isAdmin,
    onError: (err) => {
      console.error("Error fetching movie download stats:", err);
      toast({ title: "Error", description: `Failed to load download stats: ${err.message}`, variant: "destructive" });
    },
  });

  const { data: subscriptionPlans, isLoading: isLoadingPlans, error: errorLoadingPlans } = useQuery<SubscriptionPlan[], Error>({
    queryKey: ['adminSubscriptionPlans'],
    queryFn: nodeBackendService.getAllSubscriptionPlansAdmin,
    enabled: !!user?.isAdmin,
    onError: (err) => {
      console.error("Error fetching admin subscription plans:", err);
      toast({ title: "Error", description: `Failed to load subscription plans: ${err.message}`, variant: "destructive" });
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: nodeBackendService.createSubscriptionPlan,
    onSuccess: () => {
      toast({ title: "Success", description: "Subscription plan created successfully." });
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      setPlanForm(initialPlanFormState);
      setFeaturesInput("");
      setIsEditingPlan(false);
      setCurrentPlanId(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: `Failed to create plan: ${err.message}`, variant: "destructive" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SubscriptionPlanPayload> }) =>
      nodeBackendService.updateSubscriptionPlan(id, payload),
    onSuccess: () => {
      toast({ title: "Success", description: "Subscription plan updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      setPlanForm(initialPlanFormState);
      setFeaturesInput("");
      setIsEditingPlan(false);
      setCurrentPlanId(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: `Failed to update plan: ${err.message}`, variant: "destructive" });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: nodeBackendService.deleteSubscriptionPlan,
    onSuccess: () => {
      toast({ title: "Success", description: "Subscription plan deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: `Failed to delete plan: ${err.message}`, variant: "destructive" });
    },
  });

  const adminManageSubscriptionMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: AdminManageSubscriptionRequest }) =>
      nodeBackendService.adminManageUserSubscription(userId, payload),
    onSuccess: (data, variables) => {
      toast({ title: "Success", description: data.message });
      queryClient.invalidateQueries({ queryKey: ['adminSubscribers'] });
      if (user?.id === variables.userId) {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      }
      setIsSubscriptionModalOpen(false);
      setCurrentSubscriber(null);
      setSelectedSubscriptionPlanId("");
      setSubscriptionAction('activate_extend');
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: `Failed to manage subscription: ${err.message}`, variant: "destructive" });
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMovieFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMovieFiles(Array.from(e.target.files));
    } else {
      setMovieFiles([]);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setThumbnailFiles(Array.from(e.target.files));
    } else {
      setThumbnailFiles([]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.title || !uploadForm.vj || !uploadForm.category || movieFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required text fields and select at least one movie file.",
        variant: "destructive"
      });
      return;
    }

    const newUploads: FileUploadState[] = movieFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file: file,
      title: uploadForm.title,
      description: uploadForm.description,
      vj: uploadForm.vj,
      category: uploadForm.category,
      thumbnailFile: null, // Will be set later if a thumbnail is chosen
      progress: 0,
      status: 'pending',
    }));

    const thumbnailFile = thumbnailFiles.length > 0 ? thumbnailFiles[0] : null;

    // Add new uploads to the activeUploads list
    setActiveUploads(prev => [...prev, ...newUploads]);

    // Clear the form fields and file inputs immediately after initiating the upload
    setUploadForm({ title: "", description: "", vj: "", category: "Action" });
    setMovieFiles([]);
    setThumbnailFiles([]);

    if (movieFileInputRef.current) movieFileInputRef.current.value = "";
    if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = "";

    // Process each new upload concurrently
    newUploads.forEach(async (uploadState) => {
      try {
        setActiveUploads(prev => prev.map(u => u.id === uploadState.id ? { ...u, status: 'uploading' } : u));

        // 1. Get pre-signed URL for movie file
        const moviePresignedUrlRequest: GetPresignedUploadUrlRequest = {
          fileName: uploadState.file.name,
          fileType: uploadState.file.type,
          fileSize: uploadState.file.size,
          folder: 'movies',
        };
        const moviePresignedResponse = await nodeBackendService.getPresignedUploadUrl(moviePresignedUrlRequest);
        const movieS3Key = moviePresignedResponse.s3Key;

        // 2. Upload movie file directly to S3
        await nodeBackendService.uploadFileToS3(
          moviePresignedResponse.presignedUrl,
          uploadState.file,
          (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setActiveUploads(prev => prev.map(u => u.id === uploadState.id ? { ...u, progress: percentCompleted } : u));
            }
          }
        );

        let thumbnailS3Key: string | null = null;
        if (thumbnailFile) {
          // 3. Get pre-signed URL for thumbnail file (if exists)
          const thumbnailPresignedUrlRequest: GetPresignedUploadUrlRequest = {
            fileName: thumbnailFile.name,
            fileType: thumbnailFile.type,
            fileSize: thumbnailFile.size,
            folder: 'thumbnails',
          };
          const thumbnailPresignedResponse = await nodeBackendService.getPresignedUploadUrl(thumbnailPresignedUrlRequest);
          thumbnailS3Key = thumbnailPresignedResponse.s3Key;

          // 4. Upload thumbnail file directly to S3
          await nodeBackendService.uploadFileToS3(thumbnailPresignedResponse.presignedUrl, thumbnailFile);
        }

        // 5. Send movie metadata and S3 keys to backend to save in DB
        const movieDataToSave: MovieMetadataPayload = {
          title: uploadState.title,
          description: uploadForm.description || null,
          vj: uploadForm.vj,
          category: uploadForm.category,
          movieS3Key: movieS3Key,
          thumbnailS3Key: thumbnailS3Key,
          size: uploadState.file.size,
        };

        await nodeBackendService.saveMovieMetadata(movieDataToSave);

        setActiveUploads(prev => prev.map(u => u.id === uploadState.id ? { ...u, status: 'completed', progress: 100, s3Key: movieS3Key } : u));

        toast({
          title: "Success",
          description: `${uploadState.title || uploadState.file.name} has been uploaded and recorded successfully!`,
        });

      } catch (error) {
        console.error(`Error uploading movie ${uploadState.file.name}:`, error);
        setActiveUploads(prev => prev.map(u => u.id === uploadState.id ? { ...u, status: 'failed', errorMessage: (error as Error).message || "Upload failed." } : u));
        toast({
          title: "Error",
          description: `Failed to upload ${uploadState.title || uploadState.file.name}: ${(error as Error).message || "Check console for details."}`,
          variant: "destructive"
        });
      } finally {
        // Invalidate queries to refresh movie list after each upload attempt (success or failure)
        queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
      }
    });
  };

  const handleDeleteMovie = async (id: string, title: string) => {
    try {
      await nodeBackendService.deleteMovie(id);
      toast({
        title: "Success",
        description: `${title} has been deleted successfully`
      });
      queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
    } catch (error) {
      console.error("Error deleting movie:", error);
      toast({
        title: "Error",
        description: "Failed to delete movie. Check console for details.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    try {
      await nodeBackendService.deleteSubscriber(id);
      toast({
        title: "Success",
        description: `Subscriber ${email} has been deleted successfully`
      });
      queryClient.invalidateQueries({ queryKey: ['adminSubscribers'] });
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to delete subscriber. Check console for details.",
        variant: "destructive"
      });
    }
  };

  const handleManageSubscriptionClick = (subscriber: Profile) => {
    setCurrentSubscriber(subscriber);
    const currentPlan = subscriptionPlans?.find(p => p.plan_name === subscriber.subscription_plan);
    setSelectedSubscriptionPlanId(currentPlan?.id || "");
    setSubscriptionAction(subscriber.is_subscribed ? 'activate_extend' : 'activate_extend');
    setIsSubscriptionModalOpen(true);
  };

  const handleSaveSubscription = async () => {
    if (!currentSubscriber) return;

    let payload: AdminManageSubscriptionRequest;

    if (subscriptionAction === 'deactivate') {
      payload = { action: 'deactivate' };
    } else {
      if (!selectedSubscriptionPlanId) {
        toast({ title: "Error", description: "Please select a subscription plan.", variant: "destructive" });
        return;
      }
      payload = {
        action: 'activate_extend',
        subscription_plan_id: selectedSubscriptionPlanId,
      };
    }

    try {
      await adminManageSubscriptionMutation.mutateAsync({ userId: currentSubscriber.id, payload });
    } catch (error) {
      // Error handled by mutation's onError
    }
  };

  const handleFeaturesInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeaturesInput(e.target.value);
  };

  const handlePlanFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setPlanForm(prev => ({ ...prev, [id]: value }));
  };

  const handlePlanSelectChange = (id: string, value: string) => {
    setPlanForm(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setPlanForm(prev => ({ ...prev, [id]: checked }));
  };

  const handleEditPlanClick = (plan: SubscriptionPlan) => {
    setIsEditingPlan(true);
    setCurrentPlanId(plan.id);
    setPlanForm({
      plan_name: plan.plan_name,
      price_ugx: plan.price_ugx,
      duration_days: plan.duration_days,
      duration_unit: plan.duration_unit,
      description: plan.description,
      features: plan.features,
      is_active: plan.is_active,
      display_order: plan.display_order,
    });
    setFeaturesInput(plan.features.join('\n'));
  };

  const handleCancelEdit = () => {
    setIsEditingPlan(false);
    setCurrentPlanId(null);
    setPlanForm(initialPlanFormState);
    setFeaturesInput("");
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: SubscriptionPlanPayload = {
      ...planForm,
      features: featuresInput.split('\n').map(f => f.trim()).filter(f => f.length > 0),
      duration_days: parseInt(planForm.duration_days.toString(), 10),
      display_order: parseInt(planForm.display_order.toString(), 10),
    };

    if (isEditingPlan && currentPlanId) {
      await updatePlanMutation.mutateAsync({ id: currentPlanId, payload });
    } else {
      await createPlanMutation.mutateAsync(payload);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    await deletePlanMutation.mutateAsync(id);
  };

  const sortedSubscriptionPlans = useMemo(() => {
    if (!subscriptionPlans) return [];
    return Array.isArray(subscriptionPlans) ? [...subscriptionPlans].sort((a, b) => a.display_order - b.display_order) : [];
  }, [subscriptionPlans]);

  const overallLoading = isLoadingMovies || isLoadingSubscribers || isLoadingAnalytics || isLoadingDownloadStats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
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
            <Badge variant="destructive">Admin</Badge>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage movies, subscribers, platform analytics, and subscription plans
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {overallLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Movies</CardTitle>
                      <div className="text-2xl font-bold">{movies?.length || 0}</div>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Movies</CardTitle>
                    <CardDescription>Latest uploads to the platform</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {movies && movies.length > 0 ? (
                      movies.slice(0, 5).map(movie => (
                        <div key={movie.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{movie.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {movie.category}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded:{" "}
                              {movie.created_at && !isNaN(new Date(movie.created_at).getTime())
                                ? new Date(movie.created_at).toLocaleDateString()
                                : "N/A Date"}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No movies uploaded yet</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="movies" className="space-y-6">
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
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        placeholder="Enter movie title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vj">VJ/Uploader *</Label>
                      <Input
                        id="vj"
                        value={uploadForm.vj}
                        onChange={(e) => setUploadForm({ ...uploadForm, vj: e.target.value })}
                        placeholder="Enter VJ name"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      placeholder="Enter movie description (optional)"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="thumbnailFile">Thumbnail Image</Label>
                      <Input
                        id="thumbnailFile"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        multiple
                        ref={thumbnailFileInputRef}
                      />
                      <p className="text-sm text-muted-foreground">Optional: Select an image file for the movie thumbnail.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="movieFile">Movie File *</Label>
                    <Input
                      id="movieFile"
                      type="file"
                      accept="video/*"
                      onChange={handleMovieFileChange}
                      multiple
                      required
                      ref={movieFileInputRef}
                    />
                    <p className="text-sm text-muted-foreground">Select the movie file (MP4, MKV, etc.).</p>
                  </div>

                  {/* Display active uploads and their progress */}
                  {activeUploads.map(upload => (
                    <div key={upload.id} className="space-y-2 border p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <Label>{upload.file.name} ({upload.status === 'completed' ? '100' : upload.progress}%)</Label>
                        {upload.status === 'failed' && (
                          <span className="text-red-500 text-sm">Error: {upload.errorMessage}</span>
                        )}
                        {upload.status === 'completed' && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                        {upload.status === 'uploading' && (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        )}
                      </div>
                      <Progress value={upload.progress} className="w-full" />
                    </div>
                  ))}

                  <Button
                    type="submit"
                    className="w-full"
                    // Modified: Removed the check for active uploads, allowing concurrent submissions
                    disabled={!uploadForm.title || !uploadForm.vj || !uploadForm.category || movieFiles.length === 0}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {/* Display status based on overall active uploads, but button remains clickable */}
                    {activeUploads.some(u => u.status === 'uploading') ? "Uploading..." :
                      activeUploads.some(u => u.status === 'processing') ? "Processing..." :
                        "Upload Movie"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Film className="h-5 w-5 mr-2" />
                  Manage Movies ({movies?.length || 0})
                </CardTitle>
                <CardDescription>Edit or delete existing movies</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMovies ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : movies && movies.length > 0 ? (
                  <div className="space-y-4">
                    {movies.map(movie => {
                      const displayThumbnailUrl = movie.thumbnail_url
                        ? (movie.thumbnail_url.startsWith('http://') || movie.thumbnail_url.startsWith('https://'))
                          ? movie.thumbnail_url
                          : nodeBackendService.CLOUDFRONT_DOMAIN && movie.thumbnail_url.startsWith('/thumbnails/')
                            ? `${nodeBackendService.CLOUDFRONT_DOMAIN}${movie.thumbnail_url}`
                            : null
                        : null;

                      return (
                        <div key={movie.id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
                          <div className="flex items-center space-x-4">
                            {displayThumbnailUrl ? (
                              <img
                                src={displayThumbnailUrl}
                                alt={`${movie.title} thumbnail`}
                                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.png';
                                  e.currentTarget.alt = 'Thumbnail not available';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-md text-muted-foreground text-center text-sm flex-shrink-0">
                                No <br />Img
                              </div>
                            )}

                            <div className="flex-1">
                              <h4 className="font-medium">{movie.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                VJ: {movie.vj} • {movie.category}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded:{" "}
                                {movie.created_at && !isNaN(new Date(movie.created_at).getTime())
                                  ? new Date(movie.created_at).toLocaleDateString()
                                  : "N/A Date"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={isLoadingMovies}>
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
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No movies uploaded yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Subscriber Management ({subscribers?.length || 0})
                </CardTitle>
                <CardDescription>View and manage platform subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSubscribers ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : subscribers && subscribers.length > 0 ? (
                  <div className="space-y-4">
                    {subscribers.map(subscriber => (
                      <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{subscriber.fullName || subscriber.email}</h4>
                          <p className="text-sm text-muted-foreground">
                            {subscriber.email} • Joined {new Date(subscriber.created_at).toLocaleDateString()}
                          </p>
                          {subscriber.phone && (
                            <p className="text-xs text-muted-foreground">Phone: {subscriber.phone}</p>
                          )}
                          <div className="text-sm mt-1">
                            Subscription:{" "}
                            <Badge variant={subscriber.is_subscribed ? "default" : "secondary"}>
                              {subscriber.is_subscribed ? subscriber.subscription_plan : "None"}
                            </Badge>
                            {subscriber.is_subscribed && subscriber.subscription_end_date && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (Ends: {new Date(subscriber.subscription_end_date).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {subscriber.is_admin ? 'Admin' : 'Subscriber'}
                          </Badge>
                          {subscriber.email !== 'abdallahddumbakato@gmail.com' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManageSubscriptionClick(subscriber)}
                                disabled={adminManageSubscriptionMutation.isPending}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Manage Subscription
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" disabled={isLoadingSubscribers}>
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
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No subscribers found.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {isLoadingAnalytics || isLoadingDownloadStats ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
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
                        New This Week
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
                      {downloadStats && downloadStats.length > 0 ? (
                        downloadStats.slice(0, 10).map((movie, index) => (
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
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No download data available yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  {isEditingPlan ? "Edit Subscription Plan" : "Add New Subscription Plan"}
                </CardTitle>
                <CardDescription>
                  {isEditingPlan ? "Modify an existing plan's details." : "Create a new subscription plan for your users."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlanSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan_name">Plan Name *</Label>
                      <Input
                        id="plan_name"
                        value={planForm.plan_name}
                        onChange={(e) => handlePlanFormChange(e)}
                        placeholder="e.g., Basic, Premium, Enterprise"
                        required
                        disabled={isEditingPlan}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_ugx">Price (UGX) *</Label>
                      <Input
                        id="price_ugx"
                        type="number"
                        step="0.01"
                        value={planForm.price_ugx}
                        onChange={(e) => handlePlanFormChange(e)}
                        placeholder="e.g., 9999.00"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration_days">Duration (Days) *</Label>
                      <Input
                        id="duration_days"
                        type="number"
                        value={planForm.duration_days}
                        onChange={(e) => handlePlanFormChange(e)}
                        placeholder="e.g., 30 for 1 month"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration_unit">Duration Unit *</Label>
                      <Select
                        value={planForm.duration_unit}
                        onValueChange={(value) => handlePlanSelectChange("duration_unit", value)}
                        required
                      >
                        <SelectTrigger id="duration_unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="display_order">Display Order *</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={planForm.display_order}
                        onChange={(e) => handlePlanFormChange(e)}
                        placeholder="e.g., 1 for first"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={planForm.description}
                      onChange={(e) => handlePlanFormChange(e)}
                      placeholder="A short description of the plan."
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="features">Features (one per line) *</Label>
                    <Textarea
                      id="features"
                      value={featuresInput}
                      onChange={handleFeaturesInputChange}
                      placeholder="e.g., Unlimited downloads\n4K quality\nPriority support"
                      rows={5}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={planForm.is_active}
                      onCheckedChange={(checked) => handleCheckboxChange("is_active", checked as boolean)}
                    />
                    <Label htmlFor="is_active">Active Plan (visible to users)</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    {isEditingPlan && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                    >
                      {isEditingPlan ? (updatePlanMutation.isPending ? "Updating..." : "Update Plan") : (createPlanMutation.isPending ? "Creating..." : "Create Plan")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Manage Subscription Plans ({sortedSubscriptionPlans.length})
                </CardTitle>
                <CardDescription>Edit or delete existing subscription plans.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPlans ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading plans...
                  </div>
                ) : sortedSubscriptionPlans.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No subscription plans found. Add one above!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sortedSubscriptionPlans.map(plan => (
                      <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{plan.plan_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            UGX {parseFloat(plan.price_ugx).toLocaleString()} / {plan.duration_unit} ({plan.duration_days} days)
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {plan.description}
                          </p>
                          <ul className="text-xs text-muted-foreground list-disc list-inside mt-2">
                            {plan.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                          <Badge variant={plan.is_active ? "default" : "outline"} className="mt-2">
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="secondary" className="ml-2">
                            Order: {plan.display_order}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditPlanClick(plan)} disabled={isEditingPlan || deletePlanMutation.isPending}>
                            Edit
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={isEditingPlan || deletePlanMutation.isPending}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the "{plan.plan_name}" plan? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePlan(plan.id, plan.plan_name)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  {deletePlanMutation.isPending ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {currentSubscriber && (
        <Dialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Manage Subscription for {currentSubscriber.fullName || currentSubscriber.email}</DialogTitle>
              <DialogDescription>
                Manually activate, extend, or deactivate the subscription for this user.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 px-6">
              <div className="space-y-2">
                <Label htmlFor="subscriptionAction">Action</Label>
                <Select
                  value={subscriptionAction}
                  onValueChange={(value: 'activate_extend' | 'deactivate') => setSubscriptionAction(value)}
                >
                  <SelectTrigger id="subscriptionAction">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate_extend">Activate / Extend Subscription</SelectItem>
                    <SelectItem value="deactivate">Deactivate Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {subscriptionAction === 'activate_extend' && (
                <div className="space-y-2">
                  <Label htmlFor="subscriptionPlanSelect">Choose Plan</Label>
                  <Select
                    value={selectedSubscriptionPlanId}
                    onValueChange={setSelectedSubscriptionPlanId}
                    disabled={isLoadingPlans}
                  >
                    <SelectTrigger id="subscriptionPlanSelect">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingPlans ? (
                        <SelectItem value="loading" disabled>Loading plans...</SelectItem>
                      ) : sortedSubscriptionPlans.length > 0 ? (
                        sortedSubscriptionPlans.map(plan => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.plan_name} (UGX {parseFloat(plan.price_ugx).toLocaleString()} / {plan.duration_unit})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-plans" disabled>No active plans available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Current Status:</Label>
                <Badge variant={currentSubscriber.is_subscribed ? "default" : "secondary"}>
                  {currentSubscriber.is_subscribed ? currentSubscriber.subscription_plan : "None"}
                </Badge>
                {currentSubscriber.is_subscribed && currentSubscriber.subscription_end_date && (
                  <p className="text-sm text-muted-foreground">
                    Ends: {new Date(currentSubscriber.subscription_end_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="px-6 pt-4">
              <Button variant="outline" onClick={() => setIsSubscriptionModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSubscription} disabled={adminManageSubscriptionMutation.isPending}>
                {adminManageSubscriptionMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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

export default AdminDashboard;
