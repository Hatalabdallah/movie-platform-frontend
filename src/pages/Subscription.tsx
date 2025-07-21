// movie-platform-frontend/src/pages/Subscription.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom"; // Added useSearchParams
import { useEffect, useState } from "react"; // Added useState
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Check, Crown, Zap, Star, LogOut, Loader2 } from "lucide-react"; // Changed Play to Film, Added Loader2 for loading state
import { useQuery, useMutation } from "@tanstack/react-query"; // Import useQuery, useMutation
import { nodeBackendService, SubscriptionPlan, InitiatePaymentRequest, VerifyPaymentResponse } from "@/services/nodeBackendService"; // Import nodeBackendService, SubscriptionPlan, and new DPO payment interfaces
import { useToast } from "@/components/ui/use-toast"; // For displaying errors

const Subscription = () => {
  const { user, logout, checkUserProfile } = useAuth(); // Added checkUserProfile to refresh user data
  const navigate = useNavigate();
  const { toast } = useToast(); // Initialize useToast
  const [searchParams] = useSearchParams(); // To read DPO redirect parameters
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false); // New state for payment processing

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Use react-query to fetch subscription plans
  const { data: plans, isLoading, error } = useQuery<SubscriptionPlan[], Error>({
    queryKey: ['subscriptionPlans'], // Unique key for this query
    queryFn: nodeBackendService.getSubscriptionPlans, // Function to fetch data
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Data stays in cache for 10 minutes (was cacheTime)
    // Removed onError from here as it's not a direct option in recent React Query versions for useQuery
  });

  // Handle errors for subscription plans using useEffect
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

  // Mutation for DPO payment initiation
  const initiatePaymentMutation = useMutation({
    mutationFn: (payload: InitiatePaymentRequest) =>
      nodeBackendService.initiateDPOPayment(payload),
    onMutate: () => {
      setIsPaymentProcessing(true);
      toast({
        title: "Initiating Payment",
        description: "Redirecting to DPO payment page...",
        duration: 5000,
      });
    },
    onSuccess: (data) => {
      // Redirect user to DPO's payment page
      window.location.href = data.redirect_url;
    },
    onError: (err: Error) => {
      setIsPaymentProcessing(false);
      console.error("Error initiating payment:", err);
      toast({
        title: "Payment Error",
        description: `Failed to initiate payment: ${err.message}`,
        variant: "destructive",
      });
    },
  });

  // Effect to handle DPO redirect callback
  useEffect(() => {
    const dpoToken = searchParams.get('Ptrid'); // DPO's transaction token
    const paymentStatus = searchParams.get('payment_status'); // Our custom status from redirect URL

    // Only process if dpoToken exists AND we haven't already processed it in this session
    // Also, ensure user is logged in before attempting verification
    if (dpoToken && user && !isPaymentProcessing) {
      setIsPaymentProcessing(true); // Set processing state to prevent re-triggering

      const verifyPayment = async () => {
        try {
          toast({
            title: "Verifying Payment",
            description: "Please wait while we confirm your subscription...",
            duration: 10000,
          });

          const verificationResponse: VerifyPaymentResponse = await nodeBackendService.verifyDPOPayment(dpoToken);

          if (verificationResponse.status === 'successful') {
            toast({
              title: "Subscription Activated!",
              description: "Your payment was successful and your subscription is now active. Enjoy!",
              variant: "default",
            });
            // Crucial: Refresh user profile in AuthContext to get updated subscription status
            await checkUserProfile();
            navigate("/dashboard", { replace: true }); // Redirect to dashboard and remove query params from URL
          } else {
            toast({
              title: "Payment Failed",
              description: "Your payment could not be verified. Please try again or contact support.",
              variant: "destructive",
            });
            setIsPaymentProcessing(false);
            navigate("/subscription", { replace: true }); // Remove query params from URL
          }
        } catch (err) {
          console.error("Error during payment verification:", err);
          toast({
            title: "Verification Error",
            description: `An error occurred during payment verification: ${(err as Error).message}. Please contact support.`,
            variant: "destructive",
          });
          setIsPaymentProcessing(false);
          navigate("/subscription", { replace: true }); // Remove query params from URL
        }
      };
      verifyPayment();
    } else if (paymentStatus === 'cancelled') {
        // Handle cases where DPO redirects back with a 'cancelled' status (from client_back_url)
        toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment. You can try again or choose another plan.",
            variant: "default", // Changed from 'info' to 'default'
        });
        // Clear the URL parameters without triggering another verification attempt
        navigate("/subscription", { replace: true });
    }
  }, [searchParams, user, navigate, toast, isPaymentProcessing, checkUserProfile]);


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

    // Prepare DPO payment request payload
    const paymentPayload: InitiatePaymentRequest = {
      subscription_plan_id: plan.id,
      amount: parseFloat(plan.price_ugx), // Ensure amount is a number
      currency: "UGX", // Hardcode currency as per DPO requirements for Uganda
      description: `Subscription for ${plan.plan_name}`, // Corrected to plan.plan_name
      // Construct redirect URLs using FRONTEND_BASE_URL. The backend will use these.
      // Make sure these URLs are publicly accessible.
      client_redirect_url: `${nodeBackendService.FRONTEND_BASE_URL}/subscription?payment_status=success`, // On success, redirect back here
      client_back_url: `${nodeBackendService.FRONTEND_BASE_URL}/subscription?payment_status=cancelled`, // On cancel/failure, redirect back here
    };

    initiatePaymentMutation.mutate(paymentPayload);
  };

  if (!user) return null; // Or show a loading spinner/message

  // Show loading state for initial plan fetch or payment processing
  if (isLoading || isPaymentProcessing || initiatePaymentMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-lg">
          {isPaymentProcessing ? "Processing your payment..." : "Loading plans..."}
        </span>
      </div>
    );
  }

  // Show error state for initial plan fetch
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

  // Ensure plans is an array, even if empty or undefined for safety
  const displayPlans: SubscriptionPlan[] = plans ?? []; // Explicitly type and use nullish coalescing

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic': return Film; // Changed from Play to Film
      case 'premium': return Crown;
      case 'enterprise': return Star;
      default: return Zap; // Default icon if no match
    }
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
            const periodDisplay = plan.duration_unit; // e.g., 'week', 'month', 'year'

            // Determine if this plan should be marked as "Most Popular"
            // Changed from 'premium' to 'basic'
            const isMostPopular = plan.plan_name.toLowerCase() === 'basic'; 

            return (
              <Card
                key={plan.id} // Use plan.id as key
                // Apply border and scale if it's the "Most Popular" plan
                className={`relative ${isMostPopular ? 'border-primary border-2 scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {isMostPopular && ( // Show "Most Popular" badge if isMostPopular is true
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
                    className={`w-full ${isMostPopular ? 'bg-primary hover:bg-primary/90' : ''}`} // Apply primary button style if Most Popular
                    variant={isMostPopular ? "default" : "outline"}
                    disabled={isCurrentPlan || initiatePaymentMutation.isPending || isPaymentProcessing}
                    onClick={() => handleChoosePlan(plan)}
                  >
                    {isCurrentPlan ? "Current Plan" : `Choose ${plan.plan_name}`}
                    {isMostPopular && <Zap className="ml-2 h-4 w-4" />} {/* Show Zap icon if Most Popular */}
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
                <Film className="h-8 w-8 text-primary" /> {/* Changed Play to Film */}
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
    </div>
  );
};

export default Subscription;
