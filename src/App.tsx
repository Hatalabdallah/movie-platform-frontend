// movie-platform-frontend/src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Import your new ProtectedRoute component
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import Checkout from "./pages/Checkout";
import Terms from "./pages/Terms";
import RefundCancellation from "./pages/RefundCancellation"; // New Import
import PrivacyPolicy from "./pages/PrivacyPolicy";           // New Import
import DMCAPolicy from "./pages/DMCAPolicy";                 // New Import
import ContactUs from "./pages/ContactUs";                   // New Import
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="movieflix-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes - Accessible to everyone */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refund-cancellation" element={<RefundCancellation />} /> {/* New Route */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />       {/* New Route */}
              <Route path="/dmca-policy" element={<DMCAPolicy />} />             {/* New Route */}
              <Route path="/contact-us" element={<ContactUs />} />               {/* New Route */}
              <Route path="*" element={<NotFound />} /> {/* Catch-all for undefined routes */}

              {/* Authenticated Routes - Requires user to be logged in */}
              <Route element={<ProtectedRoute requiredAuth={true} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movies/:id" element={<MovieDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/checkout/:planId" element={<Checkout />} />
              </Route>

              {/* Admin Routes - Requires user to be logged in AND an admin */}
              <Route element={<ProtectedRoute requiredAuth={true} requiredAdmin={true} redirectPath="/dashboard" />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Example of a route requiring subscription (e.g., specific movie content) */}
              {/* <Route element={<ProtectedRoute requiredAuth={true} requiredSubscription={true} redirectPath="/subscription" />}>
                <Route path="/movies/:id/watch" element={<MoviePlayer />} />
              </Route> */}

            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
