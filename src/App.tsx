import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatus } from "@/components/NetworkStatus";
import Index from "./pages/Index";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessSetup from "./pages/BusinessSetup";
import CreateDeal from "./pages/CreateDeal";
import Favorites from "./pages/Favorites";
import ProductionDashboard from "./pages/ProductionDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCanceled from "./pages/SubscriptionCanceled";
import NotFound from "./pages/NotFound";

const App = () => (
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
      </TooltipProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;
