
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Check, Crown, Zap, Star, LogOut } from "lucide-react";

const Subscription = () => {
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

  const plans = [
    {
      name: "Basic",
      price: "$9.99",
      period: "month",
      features: [
        "10 movie downloads per month",
        "HD quality downloads",
        "Single device access",
        "Basic customer support",
        "Download history tracking"
      ],
      popular: false,
      icon: Play
    },
    {
      name: "Premium", 
      price: "$19.99",
      period: "month",
      features: [
        "Unlimited movie downloads",
        "4K quality downloads",
        "Single device access",
        "Priority customer support",
        "Download history tracking",
        "Early access to new releases",
        "Multiple language options"
      ],
      popular: true,
      icon: Crown
    },
    {
      name: "Enterprise",
      price: "$39.99", 
      period: "month",
      features: [
        "Unlimited movie downloads",
        "4K quality downloads",
        "Up to 3 device access",
        "24/7 premium support",
        "Download history tracking",
        "Early access to new releases",
        "Multiple language options",
        "Bulk download tools",
        "Custom playlists"
      ],
      popular: false,
      icon: Star
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
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
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Unlock unlimited movie downloads with our premium subscriptions
          </p>
          {user.isSubscribed && (
            <Badge variant="default" className="text-lg px-4 py-2">
              Currently subscribed to {user.subscriptionTier}
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrentPlan = user.isSubscribed && user.subscriptionTier?.toLowerCase() === plan.name.toLowerCase();
            
            return (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary border-2 scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
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
                    <div className={`p-3 rounded-full ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary">
                    {plan.price}
                    <span className="text-lg text-muted-foreground font-normal">/{plan.period}</span>
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
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? "Current Plan" : `Choose ${plan.name}`}
                    {plan.popular && <Zap className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-8">Why Choose MovieFlix Pro?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Play className="h-8 w-8 text-primary" />
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
                  Basic plan allows 10 downloads per month, while Premium and Enterprise offer unlimited downloads.
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
