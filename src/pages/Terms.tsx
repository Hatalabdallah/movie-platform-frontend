// movie-platform-frontend/src/pages/Terms.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Button } from '@/components/ui/button';
import { Film, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Terms: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate(); // Initialize useNavigate
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

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
            {/* Use handleGoBack here */}
            <Button variant="ghost" onClick={handleGoBack}>Go Back</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Terms of Service</h1>

        <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
          <p className="text-center text-sm">Last updated: July 22, 2025</p>

          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              Welcome to Ronnie's Ent! By accessing or using our website and services, you agree to be bound by these Terms of Service ("Terms"), all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Service Description</h2>
            <p>
              Ronnie's Ent provides a platform for users to stream and download movies and other digital content. Our services may include free and paid (subscription-based) content, personalized recommendations, and community features. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
            <p>
              To access certain features of the service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide accurate, current, and complete information during the registration process.</li>
              <li>Maintain the security of your password and identification.</li>
              <li>Maintain and promptly update your registration data, and any other information you provide to Ronnie's Ent, to keep it accurate, current, and complete.</li>
              <li>Be responsible for all activities that occur under your account.</li>
            </ul>
            <p>
              Ronnie's Ent reserves the right to suspend or terminate your account if any information provided during the registration process or thereafter proves to be inaccurate, not current, or incomplete.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Subscriptions and Payments</h2>
            <p>
              Our subscription plans offer various levels of access to content. By purchasing a subscription, you agree to pay the specified fees. All payments are processed through third-party payment gateways (e.g., DPO Group), and you agree to their terms and conditions. Subscriptions are typically billed periodically (e.g., weekly, monthly, annually) as per your chosen plan.
            </p>
            <p>
              **Automatic Renewal:** Unless you cancel your subscription before the end of the current billing period, your subscription will automatically renew, and you authorize us (or our third-party payment processor) to charge your payment method for the next billing cycle.
            </p>
            <p>
              **Cancellations and Refunds:** You may cancel your subscription at any time. Cancellations will take effect at the end of your current billing period. We do not offer refunds for partial subscription periods or unused content, except where required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Intellectual Property</h2>
            <p>
              All content available on Ronnie's Ent, including but not limited to movies, series, images, text, graphics, logos, and software, is the property of Ronnie's Ent or its content suppliers and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our service, except as generally permitted by the service functionality.
            </p>
            <p>
              Downloading content grants you a license for personal, non-commercial viewing only. Any commercial use, redistribution, or public performance of downloaded content is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use the service for any illegal purpose or in violation of any local, national, or international law.</li>
              <li>Engage in any activity that interferes with or disrupts the service or the servers and networks connected to the service.</li>
              <li>Attempt to gain unauthorized access to any portion of the service, other accounts, computer systems, or networks connected to the service.</li>
              <li>Use any robot, spider, scraper, or other automated means to access the service for any purpose without our express written permission.</li>
              <li>Transmit any material that is defamatory, obscene, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
            <p>
              The service is provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement. Ronnie's Ent does not warrant that the service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p>
              In no event will Ronnie's Ent, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the service, any content on the service, or any services or items obtained through the service, including any direct, indirect, special, incidental, consequential, or punitive damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Ronnie's Ent, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms of Service or your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Uganda, without regard to its conflict of law provisions. Any legal suit, action, or proceeding arising out of or related to these Terms or the service shall be instituted exclusively in the courts located in Kampala, Uganda.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Changes to Terms of Service</h2>
            <p>
              We may revise and update these Terms from time to time in our sole discretion. All changes are effective immediately when we post them and apply to all access to and use of the service thereafter. Your continued use of the service following the posting of revised Terms means that you accept and agree to the changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            {/* Make Email Clickable */}
            <p>Email: <a href="mailto:support@ronniesent.com" className="text-blue-500 hover:underline">support@ronniesent.com</a></p>
            {/* Make Phone Clickable */}
            <p>Phone: <a href="tel:+256742555553" className="text-blue-500 hover:underline">+256 742 555553</a></p>
            {/* Make Address Clickable with Google Maps */}
            <p>Address: <a
              href="https://www.google.com/maps/search/?api=1&query=Easy+View+Hotel%2C+Najjanankumbi%2C+Entebbe+Road%2C+Uganda"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Easy View Hotel , Najjanankumbi, Entebbe Road, Uganda
            </a></p>
          </section>
        </div>
        <div className="flex justify-center mt-10">
          {/* Use handleGoBack here */}
          <Button onClick={handleGoBack}>Back to Previous Page</Button>
        </div>
      </div>

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

export default Terms;
