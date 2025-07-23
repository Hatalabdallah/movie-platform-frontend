// movie-platform-frontend/src/pages/NotFound.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Film, Sun, Moon, Frown } from 'lucide-react'; // Import Frown icon for 404
import { useTheme } from '@/contexts/ThemeContext'; // Your custom ThemeContext

const NotFound: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted">
      {/* Header - Consistent with other pages */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Ronnie's Ent</h1>
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {/* You can add a home button or other relevant navigation here if needed */}
            <Link to="/">
              <Button variant="ghost">Go Home</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <Frown className="h-24 w-24 text-primary mb-6 animate-bounce-slow" /> {/* Animated icon */}
        <h1 className="text-6xl font-extrabold text-foreground mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-muted-foreground mb-4">Page Not Found</h2>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg">Take Me Home</Button>
        </Link>
      </main>

      {/* Footer - Consistent with other pages */}
      <footer className="border-t bg-background py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
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

export default NotFound;
