import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not logged in, redirect to auth page
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If specific roles are required, check if user has one of those roles
  if (allowedRoles && !allowedRoles.includes(user.role || "user")) {
    return <Redirect to="/" />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
}