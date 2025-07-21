// movie-platform-frontend/src/pages/Profile.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, User, Download, Settings, LogOut, Eye, EyeOff, Smartphone } from "lucide-react"; // Changed Play to Film
import { useToast } from "@/hooks/use-toast";
import { nodeBackendService, UserProfileResponse, UserDownloadStatsResponse } from "@/services/nodeBackendService"; // Import service and types

const Profile = () => {
    const { user, logout } = useAuth(); // Initial user data from AuthContext
    const navigate = useNavigate();
    const { toast } = useToast();

    // State for fetched dynamic profile data
    const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
    const [downloadHistory, setDownloadHistory] = useState<UserDownloadStatsResponse['detailedDownloads'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form data for profile and password changes
    const [formData, setFormData] = useState({
        fullName: "", // Changed from 'name' to 'fullName' to match backend/type
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [editMode, setEditMode] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedProfile = await nodeBackendService.getUserProfile();
                setProfileData(fetchedProfile);
                setFormData(prev => ({
                    ...prev,
                    fullName: fetchedProfile.fullName || "", // Populate from fetched data
                    email: fetchedProfile.email || ""
                }));

                const fetchedDownloadStats = await nodeBackendService.getUserDownloadStats();
                setDownloadHistory(fetchedDownloadStats.detailedDownloads);

            } catch (err) {
                console.error("Failed to load profile data:", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred while fetching profile data.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user, navigate]); // Re-fetch if user object changes

    if (!user) return null; // Should redirect, but for safety

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleSaveProfile = async () => {
        // This will call the backend API to update the profile
        try {
            // Only send updated fields
            const updatePayload: { fullName?: string, email?: string } = {};
            if (profileData?.fullName !== formData.fullName) {
                updatePayload.fullName = formData.fullName;
            }
            if (profileData?.email !== formData.email) {
                updatePayload.email = formData.email;
            }

            if (Object.keys(updatePayload).length > 0) {
                await nodeBackendService.updateUserProfile(updatePayload); // This function needs to be added next!
                toast({
                    title: "Profile updated",
                    description: "Your profile information has been saved successfully.",
                });
                // Re-fetch profile data to ensure UI is in sync
                const updatedProfile = await nodeBackendService.getUserProfile();
                setProfileData(updatedProfile);
            } else {
                toast({
                    title: "No changes",
                    description: "No profile information was changed.",
                    variant: "default",
                });
            }
            setEditMode(false);
        } catch (err) {
            console.error("Error saving profile:", err);
            toast({
                title: "Failed to update profile",
                description: err instanceof Error ? err.message : "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    const handleChangePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                title: "Password mismatch",
                description: "New password and confirm password do not match.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.currentPassword || !formData.newPassword) {
            toast({
                title: "Missing fields",
                description: "Please fill in current and new passwords.",
                variant: "destructive",
            });
            return;
        }

        try {
            await nodeBackendService.changeUserPassword(formData.currentPassword, formData.newPassword); // This function needs to be confirmed/added
            toast({
                title: "Password changed",
                description: "Your password has been updated successfully.",
            });
            setFormData({
                ...formData,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (err) {
            console.error("Error changing password:", err);
            toast({
                title: "Failed to change password",
                description: err instanceof Error ? err.message : "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    // Helper for formatting file sizes
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 1; // 1 decimal place
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // Helper for formatting download date (re-used from Dashboard)
    const formatDownloadDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
            {/* Header */}
            <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <Film className="h-8 w-8 text-primary" /> {/* Changed Play to Film */}
                        <h1 className="text-2xl font-bold">Ronnie's Ent</h1>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Badge variant={profileData?.isSubscribed ? "default" : "secondary"}>
                            {profileData?.isSubscribed ? `${profileData.subscriptionPlan} Member` : "Free Trial"}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">My Profile</h2>
                    <p className="text-muted-foreground">
                        Manage your account settings and view your download history
                    </p>
                </div>

                {loading && <div className="text-center py-8 text-muted-foreground">Loading profile data...</div>}
                {error && <div className="text-center py-8 text-destructive">Error: {error}</div>}

                {!loading && !error && (
                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="subscription">Subscription</TabsTrigger>
                            <TabsTrigger value="downloads">Downloads</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center">
                                                <User className="h-5 w-5 mr-2" />
                                                Profile Information
                                            </CardTitle>
                                            <CardDescription>Update your personal information</CardDescription>
                                        </div>
                                        <Button
                                            variant={editMode ? "default" : "outline"}
                                            onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                                        >
                                            {editMode ? "Save Changes" : "Edit Profile"}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <Input
                                                id="fullName"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                disabled={!editMode}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                disabled={!editMode}
                                            />
                                        </div>
                                    </div>
                                    {editMode && (
                                        <div className="flex space-x-2 pt-4">
                                            <Button onClick={handleSaveProfile}>Save Changes</Button>
                                            <Button variant="outline" onClick={() => setEditMode(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="subscription" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Subscription Details</CardTitle>
                                    <CardDescription>Manage your Ronnie's Ent subscription</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Current Plan</Label>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge variant={profileData?.isSubscribed ? "default" : "secondary"}>
                                                    {profileData?.subscriptionPlan || "Free Trial"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Status</Label>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge variant={profileData?.isSubscribed ? "default" : "secondary"}>
                                                    {profileData?.isSubscribed ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Benefits</Label>
                                        <ul className="mt-2 space-y-1 text-sm">
                                            {profileData?.isSubscribed ? (
                                                <>
                                                    <li>✅ Unlimited movie downloads</li>
                                                    <li>✅ 4K quality downloads</li>
                                                    <li>✅ Priority customer support</li>
                                                    <li>✅ Early access to new releases</li>
                                                </>
                                            ) : (
                                                <>
                                                    <li>❌ Limited movie access</li>
                                                    <li>❌ Standard quality only</li>
                                                    <li>❌ Basic support</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="flex space-x-2 pt-4">
                                        {profileData?.isSubscribed ? (
                                            <Button variant="outline">Manage Subscription</Button>
                                        ) : (
                                            <Link to="/subscription">
                                                <Button>Upgrade to Premium</Button>
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="downloads" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Download className="h-5 w-5 mr-2" />
                                        Download History
                                    </CardTitle>
                                    <CardDescription>View your previously downloaded movies</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {downloadHistory && downloadHistory.length > 0 ? (
                                            downloadHistory.map(download => (
                                                <div key={download.movieId} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div>
                                                        <h4 className="font-medium">{download.movieTitle}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Downloaded on {formatDownloadDate(download.lastDownloadDate)} • {formatFileSize(download.movieSize)}
                                                        </p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Re-download
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <Download className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground">No downloads yet</p>
                                                <Link to="/movies">
                                                    <Button className="mt-4">Browse Movies</Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Settings className="h-5 w-5 mr-2" />
                                        Security Settings
                                    </CardTitle>
                                    <CardDescription>Manage your password and device settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-4">Change Password</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">Current Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="currentPassword"
                                                        type={showPasswords.current ? "text" : "password"}
                                                        value={formData.currentPassword}
                                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                        placeholder="Enter current password"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                    >
                                                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="newPassword"
                                                        type={showPasswords.new ? "text" : "password"}
                                                        value={formData.newPassword}
                                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                        placeholder="Enter new password"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                    >
                                                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showPasswords.confirm ? "text" : "password"}
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                        placeholder="Confirm new password"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                    >
                                                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button onClick={handleChangePassword}>Update Password</Button>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-medium mb-4">Device Management</h4>
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Smartphone className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">Current Device</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Device ID: {profileData?.deviceIDs && profileData.deviceIDs.length > 0
                                                            ? profileData.deviceIDs[0] // Display first device ID from fetched profile
                                                            : "N/A"
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="default">Active</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            You can only be logged in on one device at a time. Logging in from another device will automatically log you out here.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
};

export default Profile;
