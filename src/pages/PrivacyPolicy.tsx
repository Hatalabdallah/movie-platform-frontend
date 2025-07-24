// movie-platform-frontend/src/pages/PrivacyPolicy.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Film, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const PrivacyPolicy: React.FC = () => {
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
        <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>

        <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
          <p className="text-center text-sm">Last updated: July 24, 2025</p>

          <p>
            This privacy policy ("Privacy Policy") of Ronnie's Entertainment discloses the privacy policy for the Service and is hereby incorporated by reference into the Terms of Use.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Information Collected</h2>
            <p>
              We may collect information about you that is provided by you via the Service to us, such as your name, address, telephone number, e-mail address and other information that can identify you as a specific individual ("Personally Identifiable Information"). We do not knowingly collect information from children under 13 years old.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Use of Your Personally Identifiable Information</h2>
            <p>
              Personally Identifiable Information collected on the Service may be used to: (i) send notifications; (ii) promote the Service and other available services and products to you; (iii) respond to your questions or suggestions; and/or (iv) improve the quality of the Service. We may use your e-mail address, telephone number, SMS address or other contact information to send you notifications about new features, products, services, specials, promotions or other opportunities available through the Service, or to confirm or improve customer service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Opt-In and Opt-Out Policy</h2>
            <p>
              We will not share your Personally Identifiable Information in ways different from what is disclosed in this Privacy Policy unless you specifically elect to make your Personally Identifiable Information available to third parties by selecting to "opt-in" in various places on the Service. Your "opt-in" elections will not, however, require us to share your Personally Identifiable Information with any third parties. Further, you may "opt-out" of any prior elections and of receiving certain types of communications at any time by contacting Customer Service as indicated elsewhere in this Privacy Policy. You agree that such actions, including the deletion of your Personally Identifiable Information and/or your election to opt-out of receiving certain communications, may impact your ability to fully use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Deletion</h2>
            <p>
              An individual can request the deletion or removal of personal data where there is no compelling reason for its continued processing.
            </p>
            <p>
              <strong>When does the data deletion request apply?</strong>
              <br />
              Individuals can request to have personal data erased and to prevent processing in specific circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Where the personal data is no longer necessary in relation to the purpose for which it was originally collected/processed.</li>
              <li>When the individual withdraws consent.</li>
              <li>When the individual objects to the processing and there is no other legal ground for the relevant processing activity.</li>
              <li>When the personal data was unlawfully processed.</li>
              <li>Where the personal data has to be erased in order to comply with a legal obligation.</li>
            </ul>
            <p>
              <strong>How can data be deleted?</strong>
              <br />
              We will delete the personal user data from our database upon request (via email to <a href="mailto:support@ronniesent.com" className="text-blue-500 hover:underline">support@ronniesent.com</a>) or via care lines on <a href="tel:+256783650857" className="text-blue-500 hover:underline">+256783650857</a> or <a href="tel:+256742555553" className="text-blue-500 hover:underline">+256742555553</a>.
            </p>
            <p>
              We undertake to perform the deletion within 24 hours from the time of request receipt and will send you a confirmation via email once the information has been deleted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Cookies</h2>
            <p>
              We may collect certain technical information about your device while you are using the Service. This information may include your IP address, operating system, web browser software and your unique device information. We may automatically assign you a "cookie" (i.e., a tiny packet of identifying information stored on your device) each time you visit the Service. This cookie does not contain any Personally Identifiable Information about you. You may be able to choose to not receive a cookie by enabling your device to refuse cookies or prompt you before accepting a cookie. You agree that by refusing to accept a cookie you will not be able to make optimal use of the Service. We may use third-party advertising technology and cookies to serve ads when you visit web sites upon which we advertise. In addition, we may use web beacons, provided by our ad serving partner, to help manage our online advertising.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Improving the Quality of Our Sites</h2>
            <p>
              We may collect information about your device for the purpose of assessing the effectiveness of the content and traffic of the Service. This data allows us to improve the quality of your visit by streamlining your ability to navigate the Service. We do not track your IP address or collect information about your visits to other Internet sites. Information about you and your use of the Service may be aggregated with other information collected on the Service or other sites or otherwise used in ways that do not personally identify you or constitute Personally Identifiable Information. This type of aggregated or statistical information may be used by us to improve the quality of the Service or for other purposes that we may deem appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Notifications of Changes</h2>
            <p>
              We reserve the right to modify or amend this Privacy Policy at any time and for any reason. If we elect to use your Personally Identifiable Information in a manner materially different from that stated at the time of collection, we will notify you via e-mail or other available means and provide you with the ability to "opt-out" of such use. In addition, if we make any material changes in our privacy practices, we will post a prominent notice on the Service notifying users of the change, even if it does not affect Personally Identifiable Information already stored in our database. In some cases, when we post such a notice we may also e-mail certain users to notify them of the changes in our privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Customer Service</h2>
            <p>
              If you need help using the Service or have a question regarding the Terms, this Privacy Policy or the products or services offered by any of our service providers, please contact Customer Service at:
            </p>
            <p>Email: <a href="mailto:support@ronniesent.com" className="text-blue-500 hover:underline">support@ronniesent.com</a></p>
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

export default PrivacyPolicy;
