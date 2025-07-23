// movie-platform-frontend/src/pages/Subscription.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Check, Crown, Zap, Star, LogOut, Loader2, Sun, Moon } from "lucide-react"; // Added Sun and Moon
import { useQuery } from "@tanstack/react-query";
import { nodeBackendService, SubscriptionPlan } from "@/services/nodeBackendService";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from '@/contexts/ThemeContext'; // Import useTheme

const Subscription = () => {
  const { user, logout, checkUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const { theme, toggleTheme } = useTheme(); // Initialize useTheme
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const { data: plans, isLoading, error } = useQuery<SubscriptionPlan[], Error>({
    queryKey: ['subscriptionPlans'],
    queryFn: nodeBackendService.getSubscriptionPlans,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (error) {
      console.error("Error fetching subscription plans:", error);
      toast({
        title: "Error",
        description: `Failed to load subscription plans: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    const dpoToken = searchParams.get('Ptrid');
    const paymentStatus = searchParams.get('payment_status');

    if (dpoToken || paymentStatus) {
      const redirectUrl = `/checkout/${searchParams.get('planId') || ''}?${searchParams.toString()}`;
      navigate(redirectUrl, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleChoosePlan = (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to choose a subscription plan.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    navigate(`/checkout/${plan.id}`);
  };

  if (!user) return null;

  if (isLoading || isPaymentProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-lg">
          {isLoading ? "Loading plans..." : "Redirecting to checkout..."}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted text-red-500">
        <p className="text-xl mb-4">Error: Failed to load subscription plans.</p>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const displayPlans: SubscriptionPlan[] = plans ?? [];

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic': return Film;
      case 'premium': return Crown;
      case 'enterprise': return Star;
      default: return Zap;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
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
            <Badge variant={user.isSubscribed ? "default" : "secondary"}>
              {user.isSubscribed ? `${user.subscriptionPlan} Member` : "Free Trial"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Unlock unlimited movie downloads with our premium subscriptions
          </p>
          {user.isSubscribed && (
            <Badge variant="default" className="text-lg px-4 py-2">
              Currently subscribed to {user.subscriptionPlan}
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayPlans.map((plan) => {
            const IconComponent = getPlanIcon(plan.plan_name);
            const isCurrentPlan = user.isSubscribed && user.subscriptionPlan?.toLowerCase() === plan.plan_name.toLowerCase();
            const priceDisplay = `UGX ${parseFloat(plan.price_ugx).toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            const periodDisplay = plan.duration_unit;

            const isMostPopular = plan.plan_name.toLowerCase() === 'basic';

            return (
              <Card
                key={plan.id}
                className={`relative ${isMostPopular ? 'border-primary border-2 scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {isMostPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge variant="outline" className="bg-green-500 text-white border-green-500">
                      Current Plan
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${isMostPopular ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.plan_name}</CardTitle>
                  <div className="text-4xl font-bold text-primary">
                    {priceDisplay}
                    <span className="text-lg text-muted-foreground font-normal">/{periodDisplay}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${isMostPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={isMostPopular ? "default" : "outline"}
                    disabled={isCurrentPlan}
                    onClick={() => handleChoosePlan(plan)}
                  >
                    {isCurrentPlan ? "Current Plan" : `Choose ${plan.plan_name}`}
                    {isMostPopular && <Zap className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-8">Why Choose Ronnie's Ent?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Film className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">High Quality</h4>
              <p className="text-sm text-muted-foreground">HD and 4K downloads available</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Premium Content</h4>
              <p className="text-sm text-muted-foreground">Exclusive movies and early releases</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Fast Downloads</h4>
              <p className="text-sm text-muted-foreground">Optimized servers for quick downloads</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">24/7 Support</h4>
              <p className="text-sm text-muted-foreground">Always here to help you</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I download movies offline?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! All downloaded movies are stored locally on your device and can be watched offline anytime.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a limit to downloads?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Basic plan allows 10 downloads per week, while Premium and Enterprise offer unlimited downloads.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time. Your access continues until the end of your billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="border-t bg-background py-12 px-4">
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

export default Subscription;
