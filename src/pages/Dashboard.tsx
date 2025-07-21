// movie-platform-frontend/src/pages/Dashboard.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react"; // Added useState
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Download, User, Settings, LogOut, Crown, Film } from "lucide-react";
import { Link } from "react-router-dom";
import { nodeBackendService, UserProfileResponse, UserDownloadStatsResponse } from "@/services/nodeBackendService"; // Import new types and service

const Dashboard = () => {
    // Destructure user, logout, and isSubscribed directly from useAuth
    const { user, logout, isSubscribed } = useAuth();
    const navigate = useNavigate();

    // State for dynamic data
    const [accountStatus, setAccountStatus] = useState<UserProfileResponse | null>(null);
    const [downloadStats, setDownloadStats] = useState<UserDownloadStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return; // Exit early if no user
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch Account Status (this is where the derived subscription status comes from)
                const profileData = await nodeBackendService.getUserProfile();
                setAccountStatus(profileData);

                // Fetch Download Stats
                const statsData = await nodeBackendService.getUserDownloadStats();
                setDownloadStats(statsData);

            } catch (err) {
                console.error("Failed to load dashboard data:", err);
                // Type guard for error message
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred while fetching dashboard data.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, navigate]); // Re-fetch if user changes (e.g., after login/logout)

    if (!user) return null; // Should redirect by useEffect, but good for safety

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Helper for formatting last download date
    const formatLastDownload = (dateString: string | null) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.round(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 24) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else {
            // For older dates, you might want to format it differently, e.g., "Jul 20, 2025"
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
            {/* Header */}
            <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2">
                        <Play className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold">Ronnie's Ent</h1>
                    </Link>
                    <div className="flex items-center space-x-4">
                        {/* Use the isSubscribed from AuthContext directly */}
                        <Badge variant={isSubscribed ? "default" : "secondary"}>
                            {isSubscribed ? `${user.subscriptionPlan || 'Active'} Member` : "Free Trial"}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    {/* Updated to use dynamic user.fullName from accountStatus if available */}
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {accountStatus?.fullName || user.email}!</h2>
                    <p className="text-muted-foreground">
                        {isSubscribed // Use isSubscribed from AuthContext
                            ? "Enjoy unlimited movie downloads"
                            : "Complete your subscription to start downloading movies"
                        }
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link to="/movies">
                            <CardHeader className="pb-2">
                                <Film className="h-8 w-8 text-primary mb-2" />
                                <CardTitle className="text-lg">Browse Movies</CardTitle>
                                <CardDescription>Explore our movie library</CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    {!isSubscribed && ( // Use isSubscribed from AuthContext for conditional rendering
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary">
                            <Link to="/subscription">
                                <CardHeader className="pb-2">
                                    <Crown className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle className="text-lg">Subscribe</CardTitle>
                                    <CardDescription>Unlock unlimited downloads</CardDescription>
                                </CardHeader>
                            </Link>
                        </Card>
                    )}

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link to="/profile">
                            <CardHeader className="pb-2">
                                <User className="h-8 w-8 text-primary mb-2" />
                                <CardTitle className="text-lg">Profile</CardTitle>
                                <CardDescription>Manage your account</CardDescription>
                            </CardHeader>
                        </Link>
                    </Card>

                    {user.isAdmin && (
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-500">
                            <Link to="/admin">
                                <CardHeader className="pb-2">
                                    <Settings className="h-8 w-8 text-orange-500 mb-2" />
                                    <CardTitle className="text-lg">Admin Panel</CardTitle>
                                    <CardDescription>Manage platform</CardDescription> {/* Corrected CardSheetHeader to CardDescription */}
                                </CardHeader>
                            </Link>
                        </Card>
                    )}
                </div>

                {/* Loading and Error States */}
                {loading && (
                    <div className="text-center text-muted-foreground text-lg py-8">Loading dashboard data...</div>
                )}
                {error && (
                    <div className="text-center text-destructive text-lg py-8">Error: {error}</div>
                )}

                {/* Account Status and Download Stats */}
                {!loading && !error && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Subscription</span>
                                    {/* Use isSubscribed from AuthContext directly */}
                                    <Badge variant={isSubscribed ? "default" : "secondary"}>
                                        {isSubscribed ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Plan</span>
                                    <span className="font-medium">
                                        {/* Use user.subscriptionPlan for the specific plan name */}
                                        {user.subscriptionPlan || "none"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Device ID</span>
                                    <span className="text-sm text-muted-foreground font-mono">
                                        {user.deviceId // Use user.deviceId from AuthContext
                                            ? user.deviceId
                                            : "N/A"
                                        }
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Download Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Movies Downloaded</span>
                                    <span className="font-bold text-2xl text-primary">
                                        {downloadStats?.summary.totalMoviesDownloaded ?? '0'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Storage Used</span>
                                    <span className="font-medium">
                                        {downloadStats?.summary.totalStorageUsed ?? '0 GB'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Last Download</span>
                                    <span className="text-sm text-muted-foreground">
                                        {formatLastDownload(downloadStats?.summary.lastDownloadDate || null)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
