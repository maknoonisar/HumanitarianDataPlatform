import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import DatasetPage from "@/pages/DatasetPage";
import OrganizationPage from "@/pages/OrganizationPage";
import DataCatalogPage from "@/pages/DataCatalogPage";
import UploadDatasetPage from "@/pages/UploadDatasetPage";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Header from "@/components/layout/Header";
import UserManagementPage from "@/pages/UserManagementPage";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/datasets/:id" component={DatasetPage} />
          <Route path="/organizations/:id" component={OrganizationPage} />
          <Route path="/data-catalog" component={DataCatalogPage} />
          <Route path="/auth" component={AuthPage} />
          
          {/* Protected routes - require authentication */}
          <Route path="/upload-dataset">
            <ProtectedRoute allowedRoles={["admin", "uploader"]}>
              <UploadDatasetPage />
            </ProtectedRoute>
          </Route>

          <Route path="/user-management">
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagementPage />
            </ProtectedRoute>
          </Route>
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
