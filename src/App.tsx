import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import {
  EmergencyContactsRoute,
  LocationSharingRoute,
  CommunityFeaturesRoute,
  ContactsManagerRoute,
  EmergencySOSRoute,
  AlertsRoute,
  SettingsPageRoute,
  WellnessRoute
} from "./components/RouteWrappers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/emergency" element={<EmergencyContactsRoute />} />
          <Route path="/location" element={<LocationSharingRoute />} />
          <Route path="/community" element={<CommunityFeaturesRoute />} />
          <Route path="/contacts" element={<ContactsManagerRoute />} />
          <Route path="/sos" element={<EmergencySOSRoute />} />
          <Route path="/alerts" element={<AlertsRoute />} />
          <Route path="/settings" element={<SettingsPageRoute />} />
          <Route path="/wellness" element={<WellnessRoute />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
