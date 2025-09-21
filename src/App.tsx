import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatus } from "@/components/NetworkStatus";
import Index from "./pages/Index";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessSetup from "./pages/BusinessSetup";
import CreateDeal from "./pages/CreateDeal";
import Favorites from "./pages/Favorites";
import ProductionDashboard from "./pages/ProductionDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Retry network errors up to 2 times
        if (failureCount < 2 && (error as any)?.message?.includes('fetch')) {
          return true;
        }
        return false;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes default
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NetworkStatus />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<BusinessDashboard />} />
            <Route path="/business-setup" element={<BusinessSetup />} />
            <Route path="/create-deal" element={<CreateDeal />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/production" element={<ProductionDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
