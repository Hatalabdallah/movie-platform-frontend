// movie-platform-frontend/src/pages/Terms.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Film, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Terms: React.FC = () => {
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
        <h1 className="text-4xl font-bold text-center mb-8">Terms of Use</h1>

        <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
          <p className="text-center text-sm">Last updated: July 24, 2025</p>

          <p>
            These terms of use ("TERMS") set out the terms and conditions of use of the website "RONNIESENT.COM" (collectively, including all content and functionality available through the ronniesent.com website, the "WEBSITE"), published by Ronnie's Entertainment Company Limited ("RONNIE'S ENTERTAINMENT") by accessing/visiting or using the website (whether you are a registered user or unregistered user), either an individual or a single entity ("you" or "your" as applicable), you expressly and unconditionally agree to the terms and all other policies of RONNIE'S ENTERTAINMENT, (including but not limited to, Ronnie's Entertainment's privacy policy). If you are not an individual, you represent to Ronnie's Entertainment that you have all necessary corporate or equivalent authority and power to agree to the terms which you agree shall be binding on the corporation, partnership, association or other entity in whose name you are registering as a user and establishing an account. If you do not agree to any of these terms, you may not use the website.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-3">REGISTRATION AND ACCESS</h2>
            <p>
              In order to use many of the Website's features, you are advised to set up an account using the online registration platform. You may access your account by clicking login on the homepage and you can enter your username and password in the login fields on the login page. You alone are responsible for keeping your username and password secure. Registration entitles you to use the Website. We reserve the right to terminate your account at any time. Failure to comply with the Terms or any other policy of Ronnie's Entertainment may result in access to your personal page being temporarily or permanently suspended, immediately and without notice, or in the deactivation of your account, without prejudice to any other rights we may have.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">MEMBERSHIP</h2>
            <p>
              Your Ronnie's Entertainment membership will continue month-to-month until terminated. To use the Ronnie's Entertainment service you must have Internet access and provide us with one or more Payment Methods. "Payment Method" means a current, valid, accepted method of payment, as may be updated from time to time, and which may include payment through your account with a third party. Unless you cancel your membership before your next billing date, you authorize us to charge your next membership fee to your Payment Method.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">FREE TRIALS</h2>
            <p>
              Your Ronnie's Entertainment membership may start with a free trial. Free trial eligibility is determined by Ronnie's Entertainment at its sole discretion and we may limit eligibility or duration to prevent free trial abuse. We reserve the right to revoke the free trial and put your account on hold in the event that we determine that you are not eligible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">BILLING AND CANCELLATION</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Billing Cycle:</strong> The billing cycle for the Ronnie's Entertainment service is 30 days. For members that use PayPal, Visa or MasterCard as their Payment Method, your account will be automatically charged at the end of the billing cycle.
              </li>
              <li>
                <strong>Payment Methods:</strong> To use the Ronnie's Entertainment service you must provide one or more Payment Methods. Members can subscribe to the service through our payment portal using PayPal, Visa, MasterCard or Mobile Money through our online merchant PesaPal or any other designated methods that will be officially communicated by Ronnie's Entertainment. In case of direct mobile money payments, these will ONLY be sent to our official company line i.e. +256783650857 or +256742555553 both registered in the names of the RONNIE'S ENTERTAINMENT CO. LTD. Any deposits made to any other numbers will not be valid.
              </li>
              <li>
                <strong>Cancellation:</strong> For members that subscribe using PayPal, you can cancel your recurring payment profile by going to your PayPal account settings, selecting recurring payments and cancelling Ronnie's Entertainment. For mobile money payments, they are not recurring. As such, the subscription is only valid for the time period paid for.
              </li>
              <li>
                <strong>Changes to subscription prices and packages:</strong> We may change our subscription plans and the price of our service from time to time; however, any price changes or changes to our subscription plans will apply to you no earlier than 30 days following notice to you.
              </li>
              <li>
                <strong>Refund policy:</strong> Given the nature of digital items, we do not generally offer a refund on a purchase. A client will ONLY be eligible for a refund if their account has been billed more than once in a period of 30 days or if they have not used the service. The refund will be made via the client’s payment method and the client will have a maximum of 15 days to file a refund claim with our team. A client that makes a payment but does not access the service for the period paid for, qualifies for a full refund of the amount paid subject to review of the client user logs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">ABILITY TO ACCEPT TERMS & CONDITIONS</h2>
            <p>
              Children under the age of 13 are not permitted to register with Ronnie's Entertainment. It is Ronnie's Entertainment's policy not to collect any information from anyone under the age of 13. You warrant that you are either more than 18 years of age or have consent of your parent or legal guardian such that you are legally able to agree to be bound by the Terms. In any event, You warrant that you are over the age of 13, as the Website is not intended for children under 13. If you are under 13 years of age, do not use or access the Ronnie's Entertainment website at any time or in any manner. If you are the parent or legal guardian of a child under 13, and that child has somehow registered with Ronnie's Entertainment, please send an e-mail to <a href="mailto:support@ronniesent.com" className="text-blue-500 hover:underline">support@ronniesent.com</a> for instructions on how to cancel your child’s registration. In the e-mail, please include your full name and address, your child's full name and address, your relationship to the child, your daytime and evening telephone numbers, your e-mail address and a signed statement that you are the child's parent or legal guardian. Ronnie's Entertainment reserves the right to seek additional information to verify your identity and status in relation to the child. Ronnie's Entertainment will use this information only to verify that you are the child's parent or legal guardian and for no other purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">SERVICE QUALITY:</h2>
            <p>
              The quality of the display of the Ronnie's Entertainment content may vary from device to device, and may be affected by a variety of factors, such as your location, the bandwidth available through and/or speed of your Internet connection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">MATURITY RATINGS</h2>
            <p>
              All movies and series uploaded on ronniesent.com are assigned a maturity rating based on the frequency and impact of the mature content in the series or movie. The ratings are displayed below the content as All, PG, 13+ and 18+. Ronnie's Entertainment does not permit the <strong>downloading</strong> of adult content (pornography) on the platform. In the unlikely event that any content contrary to this is seen on the platform, kindly reach out on <a href="mailto:support@ronniesent.com" className="text-blue-500 hover:underline">support@ronniesent.com</a> and the content will be taken down immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">LINKS:</h2>
            <p>
              As a convenience to you, the Website may contain links to websites operated by other entities (a "Linked Site"). If you decide to visit any Linked Site, you do so at your own risk and it is your responsibility to take all protective measures to guard against viruses or other destructive elements. Ronnie's Entertainment has no responsibility to you with respect to any Linked Site and no Linked Site, regardless of the linking form (e.g. hotlinks, hypertext links, IMG links) is maintained, controlled, endorsed, monitored or otherwise governed by Ronnie's Entertainment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">ELECTRONIC SIGNATURES</h2>
            <p>
              You agree to be bound by any affirmation, assent, communication or agreement you transmit through the Website, including but not limited to any consent you give to receive communications from Ronnie's Entertainment solely through electronic transmission. You agree that, when in the future you click on "I agree", "I consent" or other similarly worded "button" or entry field with your mouse, keystroke or other computer device, your agreement or consent will be legally binding and enforceable and the legal equivalent of your handwritten signature.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">AMENDMENTS</h2>
            <p>
              Ronnie's Entertainment may amend or revise the Terms or any other policy of Ronnie's Entertainment at any time and you agree to be bound by such revised Terms or policy. Any such amendment or revisions will become effective upon the date it is first posted to this site. It is your responsibility to return to the Website from time to time to review the most current Terms and other Ronnie's Entertainment policies. Ronnie's Entertainment does not and will not assume any obligation to notify you of changes to the Terms or any other policy of Ronnie's Entertainment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">ENTIRE AGREEMENT</h2>
            <p>
              These Terms constitute the entire agreement between Ronnie's Entertainment Company Limited and you with respect the Website and it supersedes all prior or contemporaneous communications and proposals, whether electronic, oral, or written, between you and Ronnie's Entertainment with respect to the Website. A printed version of the Terms and of any notice given in electronic form shall be admissible in judicial or administrative proceedings based upon or relating to the Terms to the same extent and subject to the same conditions as other business documents and record originally generated and maintained in printed form. If for any reason a court of competent jurisdiction finds any provision of these Terms or portion thereof, to be unenforceable, that provision shall be enforced to the maximum extent permissible so as to affect the intent of these Terms, and the remainder of these Terms shall continue in full force and effect. No waiver by either party of any breach or default hereunder shall be deemed to be a waiver of any preceding or subsequent breach or default.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">CONTACT INFORMATION</h2>
            <p>
              If you have any questions about these Terms of Use, please contact us at:
            </p>
            <p>Email: <a href="mailto:support@ronniesent.com" className="text-blue-500 hover:underline">support@ronniesent.com</a></p>
            <p>Phone: <a href="tel:+256783650857" className="text-blue-500 hover:underline">+256 783 650857</a>, <a href="tel:+256742555553" className="text-blue-500 hover:underline">+256 742 555553</a></p>
            <p>Address: <a
              href="https://www.google.com/maps/search/?api=1&query=Easy+View+Hotel%2C+Najjanankumbi%2C+Entebbe+Road%2C+Uganda"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Easy View Hotel, Najjanankumbi, Entebbe Road, Uganda
            </a></p>
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

export default Terms;
