import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  hasConsentedToCookies, 
  saveConsentPreference,
  ConsentPreferences 
} from '@/lib/cookieUtils';
import ConsentPreferencesDialog from './consent-preferences';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Only show banner if consent hasn't been given yet
    const hasConsented = hasConsentedToCookies();
    if (hasConsented === null || hasConsented === false) {
      // Small delay to prevent banner from flashing on page load
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    saveConsentPreference(true);
    
    // Save all preferences as true
    const allConsent: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    
    localStorage.setItem('cookie_preferences', JSON.stringify(allConsent));
    setShowBanner(false);
  };

  const handleDecline = () => {
    saveConsentPreference(false);
    
    // Save all preferences as false except necessary
    const minimalConsent: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    
    localStorage.setItem('cookie_preferences', JSON.stringify(minimalConsent));
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowPreferences(true);
  };

  const handleSavePreferences = (preferences: ConsentPreferences) => {
    // If any preferences are enabled, consider it as consenting to cookies
    const hasAnyConsent = preferences.analytics || 
                         preferences.marketing || 
                         preferences.personalization;
    
    saveConsentPreference(hasAnyConsent);
    localStorage.setItem('cookie_preferences', JSON.stringify(preferences));
    setShowBanner(false);
  };

  if (!showBanner) {
    return (
      <ConsentPreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
        onSave={handleSavePreferences}
      />
    );
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200 p-4 md:p-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-4 md:mb-0 pr-0 md:pr-8">
              <h2 className="text-lg font-['Poppins'] font-bold mb-2">Cookie Consent</h2>
              <p className="text-gray-600 text-sm">
                This website uses cookies to enhance your browsing experience, personalize content and ads, 
                and analyze our traffic. By clicking "Accept All", you consent to our use of cookies as described 
                in our <a href="/privacy-policy" className="text-[#E31837] hover:underline">Privacy Policy</a>.
              </p>
            </div>
            <div className="flex flex-col xs:flex-row gap-2 mt-2 md:mt-0">
              <Button
                variant="outline"
                className="whitespace-nowrap"
                onClick={handleDecline}
              >
                Decline
              </Button>
              <Button
                variant="outline"
                className="whitespace-nowrap"
                onClick={handleCustomize}
              >
                Customize
              </Button>
              <Button
                className="whitespace-nowrap bg-[#E31837] hover:bg-[#c01230]"
                onClick={handleAcceptAll}
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <ConsentPreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
        onSave={handleSavePreferences}
      />
    </>
  );
}