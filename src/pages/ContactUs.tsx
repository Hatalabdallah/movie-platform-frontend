// movie-platform-frontend/src/pages/ContactUs.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Film, Sun, Moon, Mail, Phone, MapPin } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ContactUs: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleGoBack = () => {
    navigate(-1); // Go back one step in history
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
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
            <Button variant="ghost" onClick={handleGoBack}>Go Back</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>

        <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6 text-center">

          <p className="text-lg">
            We're here to help! If you have any questions, feedback, or need support, please don't hesitate to reach out to us using the contact information below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-lg">
              <Mail className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Email Support</h2>
              <p className="text-muted-foreground">For general inquiries and support:</p>
              <a href="mailto:support@ronniesent.com" className="text-blue-500 hover:underline text-lg font-medium mt-2">support@ronniesent.com</a>
              <p className="text-muted-foreground mt-2">For DMCA notices:</p>
              <a href="mailto:dmca@ronniesent.com" className="text-blue-500 hover:underline text-lg font-medium">dmca@ronniesent.com</a>
            </div>

            <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-lg">
              <Phone className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Phone Support</h2>
              <p className="text-muted-foreground">Reach us during business hours:</p>
              <a href="tel:+256783650857" className="text-blue-500 hover:underline text-lg font-medium mt-2">+256 783 650857</a>
              <a href="tel:+256742555553" className="text-blue-500 hover:underline text-lg font-medium">+256 742 555553</a>
            </div>

            <div className="md:col-span-2 flex flex-col items-center p-6 bg-card rounded-lg shadow-lg">
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Our Location</h2>
              <p className="text-muted-foreground">Ronnie's Entertainment Headquarters:</p>
              <address className="not-italic text-lg font-medium mt-2">
                Easy View Hotel, Najjanankumbi, Entebbe Road, Uganda
              </address>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Easy+View+Hotel%2C+Najjanankumbi%2C+Entebbe+Road%2C+Uganda"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-md mt-2"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-10">
          <Button onClick={handleGoBack}>Back to Previous Page</Button>
        </div>
      </div>

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

export default ContactUs;
