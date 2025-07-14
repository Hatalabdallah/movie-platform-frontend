
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Download, User, Settings, LogOut, Crown, Film } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-muted-foreground">
            {user.isSubscribed 
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

          {!user.isSubscribed && (
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
                  <CardDescription>Manage platform</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          )}
        </div>

        {/* Account Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Subscription</span>
                <Badge variant={user.isSubscribed ? "default" : "secondary"}>
                  {user.isSubscribed ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Plan</span>
                <span className="font-medium">
                  {user.subscriptionTier || "Free Trial"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Device ID</span>
                <span className="text-sm text-muted-foreground font-mono">
                  {user.deviceId}
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
                <span className="font-bold text-2xl text-primary">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Storage Used</span>
                <span className="font-medium">24.5 GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Last Download</span>
                <span className="text-sm text-muted-foreground">2 hours ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
