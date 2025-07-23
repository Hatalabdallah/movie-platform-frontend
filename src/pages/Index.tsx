// movie-platform-frontend/src/pages/Index.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Changed Play to Film for branding, and kept Download for download-related actions
import { Download, Shield, Users, TrendingUp, Moon, Sun, ArrowLeft, ArrowRight, Film } from "lucide-react";
import { Link } from "react-router-dom";
import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useState } from "react";
import Autoplay from 'embla-carousel-autoplay';
import { cn } from "@/lib/utils";

// Updated IMAGES array with unique headings and paragraphs
const IMAGES = [
  {
    src: "/wallpaper-1.jpg",
    alt: "Thor Love and Thunder",
    heading: "Unleash the Power of Download",
    paragraph: "Experience blockbusters like never before. Download and own the latest hits in stunning quality."
  },
  {
    src: "/wallpaper-2.jpg",
    alt: "Uncharted Movie Scene",
    heading: "Adventure Awaits, Offline",
    paragraph: "Embark on epic journeys with unlimited downloads. Your cinematic quest starts here."
  },
  {
    src: "/wallpaper-3.jpg",
    alt: "1917 Movie Poster",
    heading: "History, Drama, Your Library",
    paragraph: "From gripping historical narratives to timeless dramas, download your favorites and watch anytime."
  },
  {
    src: "/wallpaper-4.jpg",
    alt: "Aquaman Movie Scene",
    heading: "Dive into Digital Entertainment",
    paragraph: "Explore a vast ocean of movies. Secure, high-quality downloads delivered straight to your device."
  },
];

const Index = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  // Cast Autoplay to 'any' to bypass TypeScript type conflict
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false }) as any]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Changed Play icon to Film icon for brand consistency with downloads */}
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Ronnie's Ent</h1>
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

      {/* Hero Section with Carousel */}
      <section className="relative w-full h-[600px] overflow-hidden">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container flex h-full">
            {IMAGES.map((image, index) => (
              <div key={index} className="embla__slide flex-shrink-0 flex-grow-0 basis-full h-full relative">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
                  {/* Dynamic Heading and Paragraph */}
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                    {image.heading}
                  </h2>
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed drop-shadow-md">
                    {image.paragraph}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {user ? (
                      user.isSubscribed ? (
                        <Link to="/movies">
                          <Button size="lg" className="px-8 py-6 text-lg">
                            Browse Movies
                            {/* Changed Play icon to Film icon for browsing movies */}
                            <Film className="ml-2 h-5 w-5" />
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
                            {/* Changed Play icon to Download icon for starting a trial for downloads */}
                            <Download className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                        <Link to="/login">
                          <Button
                            variant="outline"
                            size="lg"
                            className={cn(
                              "px-8 py-6 text-lg",
                              theme === 'dark'
                                ? "text-white border-white hover:bg-white hover:text-black"
                                : "text-foreground border-foreground hover:bg-foreground hover:text-background"
                            )}
                          >
                            Sign In
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white hover:text-black"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white hover:text-black"
        >
          <ArrowRight className="h-6 w-6" />
        </Button>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {IMAGES.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 w-2 rounded-full bg-white transition-all",
                selectedIndex === index ? "w-6 bg-primary" : "opacity-50"
              )}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Ronnie's Ent?</h3>
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
                  Curated collection of movies with multiple languages, and quality metadata.
                  {/* Removed "trailers" as per clarification */}
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
            {/* Changed Play icon to Film icon for brand consistency */}
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

export default Index;
