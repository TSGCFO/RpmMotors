import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Inventory from "@/pages/inventory";
import VehicleDetails from "@/pages/vehicle-details";
import Services from "@/pages/services";
import Financing from "@/pages/financing";
import Gallery from "@/pages/gallery";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Sitemap from "@/pages/sitemap";
import PrivacyPolicy from "@/pages/privacy-policy";
import Terms from "@/pages/terms";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BackToTop from "@/components/ui/back-to-top";
import CookieConsent from "@/components/ui/cookie-consent";

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/inventory/:id" component={VehicleDetails} />
        <Route path="/services" component={Services} />
        <Route path="/financing" component={Financing} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/sitemap" component={Sitemap} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms" component={Terms} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
      <BackToTop />
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
