import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Inventory from "@/pages/inventory";
import VehicleDetails from "@/pages/vehicle-details";
import Services from "@/pages/services";
import Gallery from "@/pages/gallery";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Sitemap from "@/pages/sitemap";
import PrivacyPolicy from "@/pages/privacy-policy";
import Terms from "@/pages/terms";
import AdminDashboard from "@/pages/admin";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminMarketing from "@/pages/admin/marketing";
import AdminInventory from "@/pages/admin/inventory";
// Employee portal pages
import EmployeeDashboard from "@/pages/employee";
import EmployeeInventory from "@/pages/employee/inventory";
import EmployeeInquiries from "@/pages/employee/inquiries";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BackToTop from "@/components/ui/back-to-top";
import CookieConsent from "@/components/ui/cookie-consent";
import { 
  trackPageView, 
  trackUtmParameters,
  hasConsentedToCookies 
} from "@/lib/cookieUtils";

function Router() {
  const [location] = useLocation();
  
  // Track page views for analytics
  useEffect(() => {
    // Track UTM parameters when user first lands on the site
    trackUtmParameters();
    
    // Track page view for this path
    if (hasConsentedToCookies()) {
      trackPageView(location);
    }
  }, [location]);
  
  // Check if we're on an admin or employee page
  const isAdminPage = location.startsWith('/admin');
  const isEmployeePage = location.startsWith('/employee');
  const isPortalPage = isAdminPage || isEmployeePage;
  
  return (
    <>
      {/* Only show header and footer on regular customer pages */}
      {!isPortalPage && <Header />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/inventory/:id" component={VehicleDetails} />
        <Route path="/services" component={Services} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/sitemap" component={Sitemap} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms" component={Terms} />
        
        {/* Admin routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/inventory" component={AdminInventory} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/marketing" component={AdminMarketing} />
        
        {/* Employee portal routes */}
        <Route path="/employee" component={EmployeeDashboard} />
        <Route path="/employee/inventory" component={EmployeeInventory} />
        <Route path="/employee/inquiries" component={EmployeeInquiries} />
        
        <Route component={NotFound} />
      </Switch>
      {!isPortalPage && <Footer />}
      {!isPortalPage && <BackToTop />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <CookieConsent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
