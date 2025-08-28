// movie-platform-frontend/src/pages/Checkout.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import { nodeBackendService, SubscriptionPlan, InitiatePaymentRequest, VerifyPaymentResponse, UserProfileResponse } from '@/services/nodeBackendService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Check, Loader2, DollarSign, Clock, FileText } from 'lucide-react';

// Thank You Page
const ThankYouPage = ({ fullName, planName, priceDisplay, periodDisplay }: { fullName: string, planName: string, priceDisplay: string, periodDisplay: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-muted text-center p-4">
    <Check className="h-20 w-20 text-green-500 mb-6 animate-scale-in" />
    <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">Thank You, {fullName}!</h1>
    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">For choosing Ronnie's Entertainment.</h2>
    <p className="text-lg text-muted-foreground max-w-2xl">
      Your subscription for the <span className="font-bold text-primary">{planName}</span> plan has been successfully activated.
    </p>
    <p className="text-lg text-muted-foreground">
      You will be redirected to the movies page in a moment.
    </p>
    <Button asChild className="mt-8">
      <Link to="/dashboard">Go to Movies</Link>
    </Button>
  </div>
);

const Checkout: React.FC = () => {
  const { user, logout, checkUserProfile } = useAuth();
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  const [fullName, setFullName] = useState<string>('');

  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const userProfileQueryOptions: UseQueryOptions<UserProfileResponse, Error, UserProfileResponse, ['userProfile']> = {
    queryKey: ['userProfile'],
    queryFn: nodeBackendService.getUserProfile,
    enabled: !!user,
  };

  const { data: userProfile } = useQuery(userProfileQueryOptions);

  useEffect(() => {
    if (userProfile) setFullName(userProfile.fullName || '');
  }, [userProfile]);

  const { data: plans, isLoading: isLoadingPlans, error: plansError } = useQuery<SubscriptionPlan[], Error>({
    queryKey: ['subscriptionPlans'],
    queryFn: nodeBackendService.getSubscriptionPlans,
  });

  const selectedPlan = plans?.find(p => p.id === planId);

  const initiatePaymentMutation = useMutation({
    mutationFn: (payload: InitiatePaymentRequest) => nodeBackendService.initiateDPOPayment(payload),
    onMutate: () => setIsPaymentProcessing(true),
    onError: (err: Error) => {
      setIsPaymentProcessing(false);
      toast({
        title: "Payment Error",
        description: `Failed to initiate payment: ${err.message}`,
        variant: "destructive",
      });
    },
  });

  const handleProceedToPayment = async () => {
    if (!selectedPlan) {
      toast({ title: "Error", description: "Selected plan not found.", variant: "destructive" });
      navigate('/subscription');
      return;
    }

    setIsPaymentProcessing(true);

    const paymentPayload: InitiatePaymentRequest = {
      subscription_plan_id: selectedPlan.id,
      amount: parseFloat(selectedPlan.price_ugx),
      currency: "UGX",
      description: `Subscription for ${selectedPlan.plan_name}`,
      selected_payment_method: 'credit_card', // default
      client_redirect_url: `${window.location.origin}/checkout/${selectedPlan.id}?payment_status=success&planId=${selectedPlan.id}`,
      client_back_url: `${window.location.origin}/checkout/${selectedPlan.id}?payment_status=cancelled&planId=${selectedPlan.id}`,
    };

    try {
      const response = await initiatePaymentMutation.mutateAsync(paymentPayload);
      if (response.redirect_url) window.location.href = response.redirect_url;
    } catch (error) {
      setIsPaymentProcessing(false);
    }
  };

  if (isLoadingPlans || !user || !selectedPlan || isPaymentProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-lg">Processing...</span>
      </div>
    );
  }

  if (isSubscriptionActive && selectedPlan) {
    const priceDisplay = `UGX ${parseFloat(selectedPlan.price_ugx).toLocaleString('en-UG')}`;
    const periodDisplay = selectedPlan.duration_unit;
    return <ThankYouPage fullName={fullName} planName={selectedPlan.plan_name} priceDisplay={priceDisplay} periodDisplay={periodDisplay} />;
  }

  const priceDisplay = `UGX ${parseFloat(selectedPlan.price_ugx).toLocaleString('en-UG')}`;
  const periodDisplay = selectedPlan.duration_unit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/subscription" className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Ronnie's Ent</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? "🌞" : "🌙"}
            </Button>
            <Button variant="ghost" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 flex justify-center">
        {/* Order Summary & Proceed */}
        <div className="w-full lg:w-96">
          <Card className="sticky top-28 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-semibold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">{priceDisplay}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t pt-4 mt-4">
                <span>Total Due Today:</span>
                <span className="text-primary">{priceDisplay}</span>
              </div>
              <p className="text-sm text-muted-foreground text-right mt-1">
                ({priceDisplay} {periodDisplay}ly)
              </p>
            </CardContent>

            <CardContent className="p-8">
              <h3 className="text-lg font-semibold mb-4">{selectedPlan.plan_name}</h3>
              <div className="text-4xl font-extrabold text-primary mb-6">
                {priceDisplay} <span className="text-lg text-muted-foreground font-normal">/{periodDisplay}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {selectedPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-4 mb-8 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-yellow-500" />
                  <span>You'll be charged {priceDisplay} for this plan.</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  <span>Subscription active for {selectedPlan.duration_days} days.</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-gray-500" />
                  <span>By proceeding, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleProceedToPayment}
                disabled={isPaymentProcessing}
              >
                {isPaymentProcessing ? "Processing Payment..." : "Proceed to Payment"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
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

export default Checkout;
