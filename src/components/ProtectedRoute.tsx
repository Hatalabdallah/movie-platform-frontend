// movie-platform-frontend/src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Import your AuthContext hook

interface ProtectedRouteProps {
    children?: ReactNode; // Optional children prop for wrapping components directly
    requiredAuth?: boolean; // True if any logged-in user is required
    requiredAdmin?: boolean; // True if an admin user is required
    requiredSubscription?: boolean; // True if a subscribed user is required
    redirectPath?: string; // Path to redirect to if conditions are not met
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredAuth = true,
    requiredAdmin = false,
    requiredSubscription = false,
    redirectPath = '/login' // Default redirect to login page
}) => {
    const { user, isAuthenticated, isAdmin, isSubscribed, loading } = useAuth();

    // While loading, you might want to render a spinner or null
    if (loading) {
        return null; // Or a loading spinner component
    }

    // 1. Check General Authentication
    if (requiredAuth && !isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    // 2. Check Admin Role (if required)
    if (requiredAdmin && (!isAuthenticated || !isAdmin)) {
        // If an admin is required and user is not authenticated or not an admin
        // Redirect them, maybe to a specific unauthorized page or home
        return <Navigate to="/" replace />; // Or '/unauthorized'
    }

    // 3. Check Subscription Status (if required)
    // This logic handles a common case: user is authenticated but not subscribed,
    // and is trying to access a subscription-required page.
    if (requiredSubscription && isAuthenticated && !isSubscribed) {
        // If a subscription is required and user is logged in but not subscribed
        // Redirect them to the subscription page.
        return <Navigate to="/subscription" replace />;
    }

    // If all conditions are met, render the children or the Outlet
    // Outlet is used when this component acts as a parent for nested routes
    // Children is used when this component wraps a single route element
    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;