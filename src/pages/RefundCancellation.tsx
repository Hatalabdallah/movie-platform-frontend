// movie-platform-frontend/src/pages/RefundCancellation.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Film, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const RefundCancellation: React.FC = () => {
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
        <h1 className="text-4xl font-bold text-center mb-8">Refund and Cancellation Policy</h1>

        <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
          <p className="text-center text-sm">Last updated: July 24, 2025</p>

          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p>
              This Refund and Cancellation Policy outlines the terms and conditions under which Ronnie's Entertainment (referred to as "we," "us," or "our") manages subscription cancellations and refund requests for our movie <strong>download</strong> services. Our aim is to provide clear guidelines while ensuring fairness to all our valued users (referred to as "you" or "your").
            </p>
            <p>
              By subscribing to our service, you agree to the terms set forth in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Definitions</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Service:</strong> Refers to the Ronnie's Entertainment movie download platform, providing access to our movie library for download based on a subscription.</li>
              <li><strong>Subscription:</strong> A recurring payment plan (e.g., Weekly, Monthly, Annual) that grants you access to the Service for a specified duration.</li>
              <li><strong>Subscription Period:</strong> The active duration of your paid subscription (e.g., 7 days for Weekly, 30 days for Monthly, 365 days for Annual).</li>
              <li><strong>Active Subscription:</strong> A subscription that is currently valid and provides access to the Service.</li>
              <li><strong>Refund:</strong> The return of funds to a user for a payment made.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Cancellation Policy</h2>
            <p>
              You may cancel your Ronnie's Entertainment subscription at any time.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>How to Cancel:</strong>
                <ul className="list-circle list-inside ml-4">
                  <li>Cancellation requests can typically be initiated through your "Profile" or "Subscription Management" section within the Ronnie's Entertainment web application.</li>
                  <li>Alternatively, you may contact our customer support team directly at <a href="mailto:support@ronniesent.com" className="text-blue-500 hover:underline">support@ronniesent.com</a> with your account details and cancellation request.</li>
                </ul>
              </li>
              <li>
                <strong>Effective Date of Cancellation:</strong>
                <ul className="list-circle list-inside ml-4">
                  <li>When you cancel your subscription, your access to the Service will continue until the end of your current paid Subscription Period.</li>
                  <li>No further charges will be applied to your payment method after the current Subscription Period ends.</li>
                  <li>You will not be charged for the next billing cycle.</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Refund Policy</h2>
            <p>
              Ronnie's Entertainment operates on a strict <strong>no-refund policy</strong> for all subscription purchases, with specific exceptions as outlined below.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>General Policy (No Refunds for Used Service):</strong>
                <p>
                  Due to the immediate access granted to our extensive movie library for <strong>download</strong> upon subscription activation, we generally do not offer refunds for any portion of a Subscription Period that has already commenced or been utilized. This includes, but is not limited to, cases where:
                </p>
                <ul className="list-circle list-inside ml-4">
                  <li>You have accessed or downloaded any movies during the Subscription Period.</li>
                  <li>You have simply changed your mind after subscribing.</li>
                  <li>You no longer wish to use the Service before your current Subscription Period ends.</li>
                  <li>Your account is terminated due to a violation of our Terms of Service.</li>
                </ul>
              </li>
              <li>
                <strong>Exceptions (Eligible for Full Refund):</strong>
                <ul className="list-circle list-inside ml-4">
                  <li>
                    <strong>Technical Issues Preventing Access:</strong> If you experience persistent technical issues directly attributable to Ronnie's Entertainment that prevent you from accessing the core Service for <strong>downloading movies</strong> for a significant portion (e.g., more than 72 consecutive hours) of your Subscription Period, and our support team is unable to resolve these issues within a reasonable timeframe, you may be eligible for a full refund. Such cases will be reviewed on a case-by-case basis and require documented evidence of the issue and communication with our support team.
                  </li>
                  <li>
                    <strong>Billing Errors:</strong> In the event of an accidental duplicate charge or an incorrect billing amount directly caused by Ronnie's Entertainment's system, a full refund for the erroneous charge will be issued.
                  </li>
                </ul>
              </li>
              <li>
                <strong>No Partial Refunds:</strong>
                <p>
                  Ronnie's Entertainment does not offer partial refunds for any unused portion of a Subscription Period. Once a Subscription Period begins, it is considered fully utilized for billing purposes.
                </p>
              </li>
              <li>
                <strong>Processing Refunds (If Applicable):</strong>
                <p>
                  Approved refunds will be processed to the original payment method within 7-10 business days of approval. The actual time for the refund to appear in your account may vary depending on your bank or payment provider.
                </p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Changes to This Policy</h2>
            <p>
              Ronnie's Entertainment reserves the right to modify this Refund and Cancellation Policy at any time. Any changes will be effective immediately upon posting the updated policy on our website. We encourage you to review this policy periodically. Your continued use of the Service after any modifications constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about this Refund and Cancellation Policy, please contact us at:
            </p>
            <p>Email: <a href="mailto:support@ronniesent.com" className="text-blue-500 hover:underline">support@ronniesent.com</a></p>
            <p>Website: <a href="https://www.ronniesent.com/contact" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://www.ronniesent.com/contact</a></p>
          </section>
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

export default RefundCancellation;
