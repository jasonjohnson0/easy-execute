import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatus } from "@/components/NetworkStatus";
import { ThemeProvider } from "next-themes";
import { Loader2 } from "lucide-react";

// Lazy-loaded page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const BusinessSetup = lazy(() => import("./pages/BusinessSetup"));
const CreateDeal = lazy(() => import("./pages/CreateDeal"));
const Favorites = lazy(() => import("./pages/Favorites"));
const ProductionDashboard = lazy(() => import("./pages/ProductionDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const SubscriptionCanceled = lazy(() => import("./pages/SubscriptionCanceled"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NetworkStatus />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<BusinessDashboard />} />
              <Route path="/business-setup" element={<BusinessSetup />} />
              <Route path="/create-deal" element={<CreateDeal />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/subscription-canceled" element={<SubscriptionCanceled />} />
              <Route path="/production" element={<ProductionDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
