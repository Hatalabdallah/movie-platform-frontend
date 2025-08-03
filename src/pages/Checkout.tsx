// movie-platform-frontend/src/pages/Checkout.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import { nodeBackendService, SubscriptionPlan, InitiatePaymentRequest, VerifyPaymentResponse, UserProfileResponse } from '@/services/nodeBackendService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Check, Loader2, DollarSign, Clock, FileText, User, Mail, Phone, MapPin, Building, Home, Globe, Sun, Moon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Wallet, Banknote } from 'lucide-react';

// NEW: Thank you page component for a better user experience
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
  const [paymentMethod, setPaymentMethod] = useState<string>('mobile_money');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const [company, setCompany] = useState<string>('');
  const [streetAddress1, setStreetAddress1] = useState<string>('');
  const [streetAddress2, setStreetAddress2] = useState<string>('');
  const [city, setCity] = useState<string>('Kampala');
  const [region, setRegion] = useState<string>('Central');
  const [postcode, setPostcode] = useState<string>('0000');
  const [country, setCountry] = useState<string>('Uganda');

  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  // NEW: State for showing the "Thank You" page
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const userProfileQueryOptions: UseQueryOptions<UserProfileResponse, Error, UserProfileResponse, ['userProfile']> = {
    queryKey: ['userProfile'],
    queryFn: nodeBackendService.getUserProfile,
    enabled: !!user,
  };

  const { data: userProfile, isLoading: isLoadingProfile, error: profileError } = useQuery(userProfileQueryOptions);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setEmail(userProfile.email || '');
      if (userProfile.phone) {
        setPhone(userProfile.phone);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      toast({
        title: "Profile Load Error",
        description: `Failed to load profile details: ${profileError.message}`,
        variant: "destructive",
      });
    }
  }, [profileError, toast]);

  const { data: plans, isLoading: isLoadingPlans, error: plansError } = useQuery<SubscriptionPlan[], Error>({
    queryKey: ['subscriptionPlans'],
    queryFn: nodeBackendService.getSubscriptionPlans,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const selectedPlan = plans?.find(p => p.id === planId);

  useEffect(() => {
    if (plansError) {
      console.error("Error fetching subscription plans:", plansError);
      toast({
        title: "Error",
        description: `Failed to load subscription plans: ${plansError.message}`,
        variant: "destructive",
      });
      navigate('/subscription', { replace: true });
    }
  }, [plansError, toast, navigate]);

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

  // NEW: useEffect to handle successful payment and redirect to thank you page
  useEffect(() => {
    if (isSubscriptionActive) {
        // Redirect to a Thank You page or movies page after a delay
        const timer = setTimeout(() => {
            navigate('/dashboard', { replace: true });
        }, 5000); // Redirect after 5 seconds
        return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [isSubscriptionActive, navigate]);

  useEffect(() => {
    const dpoToken = searchParams.get('Ptrid');
    const paymentStatus = searchParams.get('payment_status');
    const redirectedPlanId = searchParams.get('planId');

    if (dpoToken && user && !isPaymentProcessing) {
      setIsPaymentProcessing(true);

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
            await checkUserProfile();
            // NEW: Set state to show the thank you page instead of immediate redirect
            setIsSubscriptionActive(true);
            setIsPaymentProcessing(false);
          } else {
            toast({
              title: "Payment Failed",
              description: "Your payment could not be verified. Please try again or contact support.",
              variant: "destructive",
            });
            setIsPaymentProcessing(false);
            navigate(`/checkout/${redirectedPlanId || planId}`, { replace: true });
          }
        } catch (err) {
          console.error("Error during payment verification:", err);
          toast({
            title: "Verification Error",
            description: `An error occurred during payment verification: ${(err as Error).message}. Please contact support.`,
            variant: "destructive",
          });
          setIsPaymentProcessing(false);
          navigate(`/checkout/${redirectedPlanId || planId}`, { replace: true });
        }
      };
      verifyPayment();
    } else if (paymentStatus === 'cancelled') {
        toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment. You can try again or choose another plan.",
            variant: "default",
        });
        setIsPaymentProcessing(false);
        navigate(`/checkout/${redirectedPlanId || planId}`, { replace: true });
    }
  }, [searchParams, user, navigate, toast, isPaymentProcessing, checkUserProfile, planId]);


  const handleProceedToPayment = () => {
    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Selected plan not found. Please go back and choose a plan.",
        variant: "destructive",
      });
      navigate('/subscription');
      return;
    }

    if (!fullName || !email || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required personal information.",
        variant: "destructive",
      });
      return;
    }

    console.log("Customer Details for Checkout:", {
      fullName, email, phone,
      company, streetAddress1, streetAddress2, city, region, postcode, country,
      paymentMethod, additionalNotes
    });


    const paymentPayload: InitiatePaymentRequest = {
      subscription_plan_id: selectedPlan.id,
      amount: parseFloat(selectedPlan.price_ugx),
      currency: "UGX",
      description: `Subscription for ${selectedPlan.plan_name}`,
      selected_payment_method: paymentMethod,
      client_redirect_url: `${nodeBackendService.FRONTEND_BASE_URL}/checkout/${selectedPlan.id}?payment_status=success&planId=${selectedPlan.id}`,
      client_back_url: `${nodeBackendService.FRONTEND_BASE_URL}/checkout/${selectedPlan.id}?payment_status=cancelled&planId=${selectedPlan.id}`,
    };

    console.log(`Initiating payment with: ${paymentMethod}`);
    initiatePaymentMutation.mutate(paymentPayload);
  };

  if (isLoadingPlans || isLoadingProfile || !user || !selectedPlan || initiatePaymentMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-lg">
          {isPaymentProcessing ? "Processing your payment..." : "Loading details..."}
        </span>
      </div>
    );
  }

  // NEW: Render the ThankYouPage component if subscription is active
  if (isSubscriptionActive && selectedPlan) {
    const priceDisplay = `UGX ${parseFloat(selectedPlan.price_ugx).toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    const periodDisplay = selectedPlan.duration_unit;
    return <ThankYouPage fullName={fullName} planName={selectedPlan.plan_name} priceDisplay={priceDisplay} periodDisplay={periodDisplay} />;
  }

  if (plansError || profileError || !selectedPlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted text-red-500">
        <p className="text-xl mb-4">Error: Plan or profile not found or failed to load.</p>
        <p className="text-muted-foreground">{plansError?.message || profileError?.message || "Please go back to choose a plan."}</p>
        <Button onClick={() => navigate('/subscription')} className="mt-4">
          Go to Subscription Plans
        </Button>
      </div>
    );
  }

  const priceDisplay = `UGX ${parseFloat(selectedPlan.price_ugx).toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8 justify-center items-start">
        <div className="flex-1 w-full max-w-2xl">
          <h2 className="text-3xl font-bold mb-8 text-center lg:text-left">Checkout</h2>

          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="fullName" className="flex items-center mb-1">
                  <User className="mr-2 h-4 w-4" /> Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center mb-1">
                  <Mail className="mr-2 h-4 w-4" /> Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center mb-1">
                  <Phone className="mr-2 h-4 w-4" /> Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+256 7XX XXX XXX"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card className="mb-6">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-semibold">Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="company" className="flex items-center mb-1">
                  <Building className="mr-2 h-4 w-4" /> Company Name (Optional)
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <Label htmlFor="street1" className="flex items-center mb-1">
                  <Home className="mr-2 h-4 w-4" /> Street Address 1 *
                </Label>
                <Input
                  id="street1"
                  value={streetAddress1}
                  onChange={(e) => setStreetAddress1(e.target.value)}
                  placeholder="Kyabakabi Group"
                  required
                />
              </div>
              <div>
                <Label htmlFor="street2" className="flex items-center mb-1">
                  <MapPin className="mr-2 h-4 w-4" /> Street Address 2 (Optional)
                </Label>
                <Input
                  id="street2"
                  value={streetAddress2}
                  onChange={(e) => setStreetAddress2(e.target.value)}
                  placeholder="Old Kira Rd"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="flex items-center mb-1">
                    <MapPin className="mr-2 h-4 w-4" /> City *
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kampala"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="region" className="flex items-center mb-1">
                    <MapPin className="mr-2 h-4 w-4" /> Region *
                  </Label>
                  <Input
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Central"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postcode" className="flex items-center mb-1">
                    <MapPin className="mr-2 h-4 w-4" /> Postcode *
                  </Label>
                  <Input
                    id="postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="0000"
                  required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="country" className="flex items-center mb-1">
                  <Globe className="mr-2 h-4 w-4" /> Country *
                </Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Uganda"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          {/* <Card className="mb-6">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-semibold">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="mobile_money" id="mobile_money" />
                  <Label htmlFor="mobile_money" className="text-base font-medium flex items-center">
                    <Phone className="mr-2 h-5 w-5" /> Mobile Money
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer" className="text-base font-medium flex items-center">
                    <Banknote className="mr-2 h-5 w-5" /> Bank Transfer
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="visa_card" id="visa_card" />
                  <Label htmlFor="visa_card" className="text-base font-medium flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" /> Visa Card
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card> */}

          {/* Additional Notes */}
          <Card className="mb-6">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-semibold">Additional Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Enter any additional notes or information you want included with your order here..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary (Right Column) */}
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
          </Card>

          {/* Confirm Your Plan / Proceed to Payment (below order summary) */}
          <Card className="w-full max-w-lg shadow-lg mt-6">
          <CardHeader className="text-center bg-primary/10 rounded-t-lg py-6">
            <CardTitle className="text-2xl font-bold text-primary mb-2">{selectedPlan.plan_name}</CardTitle>
            <div className="text-4xl font-extrabold text-primary">
              {priceDisplay}
              <span className="text-lg text-muted-foreground font-normal">/{periodDisplay}</span>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold mb-4">What's Included:</h3>
            <ul className="space-y-3 mb-8">
              {selectedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-4 mb-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-yellow-500" />
                <span>You will be charged `UGX ${parseFloat(selectedPlan.price_ugx).toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` for this plan.</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                <span>Your subscription will be active for {selectedPlan.duration_days} days.</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                <span>By proceeding, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.</span>
              </div>
            </div>

            <Button
              className="w-full py-3 text-lg"
              onClick={handleProceedToPayment}
              disabled={initiatePaymentMutation.isPending || isPaymentProcessing}
            >
              {initiatePaymentMutation.isPending || isPaymentProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : "Complete Order"}
            </Button>
            <Button
              variant="outline"
              className="w-full mt-4 py-3 text-lg"
              onClick={() => navigate(-1)}
              disabled={initiatePaymentMutation.isPending || isPaymentProcessing}
            >
              Cancel and Go Back
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
