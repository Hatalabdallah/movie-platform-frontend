// movie-platform-frontend/src/pages/DMCAPolicy.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Film, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const DMCAPolicy: React.FC = () => {
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
        <h1 className="text-4xl font-bold text-center mb-8">Digital Millennium Copyright Act (DMCA) Policy</h1>

        <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-6">
          <p className="text-center text-sm">Last updated: July 24, 2025</p>

          <p>
            We take claims of copyright infringement seriously. We will respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (the “DMCA”) and/or any other applicable intellectual property legislation or laws. Responses may include removing, blocking or disabling access to material claimed to be the subject of infringing activity and/or terminating the user’s access to Ronnie's Entertainment.
          </p>
          <p>
            If you believe any material accessible on Ronnie's Entertainment infringes your copyright, you may submit a copyright infringement notification (see below, “Filing a DMCA Notice of Copyright Infringement” for instructions on filing such a notice). These requests should only be submitted by the copyright owner or an agent authorized to act on the owner’s behalf.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Filing a DMCA Notice of Copyright Infringement</h2>
            <p>
              If you choose to request removal of content by submitting an infringement notification, please remember that you are initiating a legal process. Do not make false claims. Misuse of this process may result in the suspension of your account or other legal consequences.
            </p>
            <p>
              We will only accept free-form copyright infringement notifications submitted by email. In that case, in accordance with the DMCA, the written notice (the “DMCA Notice”) must include substantially the following:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Identification of the copyrighted work you believe to have been infringed or, if the claim involves multiple works, a representative list of such works.</li>
              <li>Identification of the material you believe to be infringing in a sufficiently precise manner to allow us to locate that material. If your complaint does not contain the specific URL of the video you believe infringes your rights, we may be unable to locate and remove it. General information about the video, such as a channel URL or username, typically is not adequate. Please include the URL(s) of the exact video(s).</li>
              <li>Adequate information by which we, and the uploader(s) of any video(s) you remove, can contact you (including your name, postal address, telephone number and, if available, e-mail address).</li>
              <li>A statement that you have a good faith belief that use of the copyrighted material is not authorized by the copyright owner, its agent or the law.</li>
              <li>A statement that the information in the written notice is accurate, and under penalty of perjury, that you are the owner, or an agent authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed.</li>
            </ul>
            <p>
              Complete complaints require the physical or electronic signature of the copyright owner or a representative authorized to act on their behalf. To satisfy this requirement, you may type your full legal name to act as your signature at the bottom of your complaint.
            </p>
            <p>
              If you fail to comply with all of the requirements of Section 512(c)(3) of the DMCA, your DMCA Notice may not be effective.
            </p>
            <p>
              <strong>Email Us:</strong> <a href="mailto:dmca@ronniesent.com" className="text-blue-500 hover:underline">dmca@ronniesent.com</a>
            </p>
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

export default DMCAPolicy;
