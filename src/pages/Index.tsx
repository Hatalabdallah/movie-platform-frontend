
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Download, Shield, Users, TrendingUp, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Play className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">MovieFlix Pro</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard">
                  <Button variant="default">Dashboard</Button>
                </Link>
                {user.isAdmin && (
                  <Link to="/admin">
                    <Button variant="secondary">Admin</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Premium Movie Downloads
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Access thousands of high-quality movies with unlimited downloads. 
              No streaming, no buffering - own your content forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                user.isSubscribed ? (
                  <Link to="/movies">
                    <Button size="lg" className="px-8 py-6 text-lg">
                      Browse Movies
                      <Play className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/subscription">
                    <Button size="lg" className="px-8 py-6 text-lg">
                      Subscribe Now
                      <TrendingUp className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="px-8 py-6 text-lg">
                      Start Free Trial
                      <Play className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose MovieFlix Pro?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Download className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Unlimited Downloads</CardTitle>
                <CardDescription>
                  Download movies in full HD quality and watch offline anytime, anywhere.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Secure Platform</CardTitle>
                <CardDescription>
                  Advanced security with single-device login and protected downloads.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Premium Content</CardTitle>
                <CardDescription>
                  Curated collection of movies with trailers, multiple languages, and quality metadata.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Movies Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Happy Subscribers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-muted-foreground">Downloads Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Play className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">MovieFlix Pro</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 MovieFlix Pro. All rights reserved. Premium movie downloads platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
