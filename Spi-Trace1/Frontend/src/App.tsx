import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScanProvider } from "@/contexts/ScanContext";
import { AuthGuard } from "@/components/guards/AuthGuard";

// Pages
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import AdminSignIn from "./pages/admin/AdminSignIn";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLinks from "./pages/admin/AdminLinks";
import AdminHistory from "./pages/admin/AdminHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ScanProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Landing page */}
              <Route path="/" element={<Landing />} />
              
              {/* Public Auth Routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Admin Sign In - No guard, public route but admin only */}
              <Route path="/admin/signin" element={<AdminSignIn />} />
              
              {/* Client protected routes */}
              <Route
                path="/home"
                element={
                  <AuthGuard allowedRoles={['client']}>
                    <Home />
                  </AuthGuard>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <AuthGuard allowedRoles={['client']}>
                    <Dashboard />
                  </AuthGuard>
                }
              />
              <Route
                path="/history"
                element={
                  <AuthGuard allowedRoles={['client']}>
                    <History />
                  </AuthGuard>
                }
              />
              
              {/* Admin protected routes */}
              <Route
                path="/admin"
                element={
                  <AuthGuard allowedRoles={['admin']}>
                    <AdminDashboard />
                  </AuthGuard>
                }
              />
              <Route
                path="/admin/links"
                element={
                  <AuthGuard allowedRoles={['admin']}>
                    <AdminLinks />
                  </AuthGuard>
                }
              />
              <Route
                path="/admin/history"
                element={
                  <AuthGuard allowedRoles={['admin']}>
                    <AdminHistory />
                  </AuthGuard>
                }
              />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ScanProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
