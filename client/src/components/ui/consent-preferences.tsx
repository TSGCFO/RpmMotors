import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ConsentPreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (preferences: ConsentPreferences) => void;
}

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export default function ConsentPreferences({
  open,
  onOpenChange,
  onSave
}: ConsentPreferencesProps) {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    personalization: false
  });
  
  // Load saved preferences when dialog opens
  useEffect(() => {
    if (open) {
      const savedPreferences = localStorage.getItem('cookie_preferences');
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences);
          setPreferences({
            ...parsed,
            necessary: true // Always true
          });
        } catch (e) {
          console.error('Error parsing saved cookie preferences', e);
        }
      }
    }
  }, [open]);
  
  const handleToggle = (category: keyof ConsentPreferences) => {
    // Don't allow toggling necessary cookies
    if (category === 'necessary') return;
    
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  const handleSavePreferences = () => {
    onSave(preferences);
    onOpenChange(false);
  };
  
  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    
    setPreferences(allAccepted);
    onSave(allAccepted);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Customize your cookie preferences for different categories. Necessary cookies are always enabled as they are essential for the website to function properly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Necessary Cookies */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Necessary Cookies</Label>
              <p className="text-sm text-gray-500">
                These are essential for the website to function properly and cannot be disabled.
              </p>
            </div>
            <Switch checked={preferences.necessary} disabled />
          </div>
          
          {/* Analytics Cookies */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Analytics Cookies</Label>
              <p className="text-sm text-gray-500">
                Help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>
            </div>
            <Switch 
              checked={preferences.analytics} 
              onCheckedChange={() => handleToggle('analytics')} 
            />
          </div>
          
          {/* Marketing Cookies */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Marketing Cookies</Label>
              <p className="text-sm text-gray-500">
                Track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad.
              </p>
            </div>
            <Switch 
              checked={preferences.marketing} 
              onCheckedChange={() => handleToggle('marketing')} 
            />
          </div>
          
          {/* Personalization Cookies */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Personalization Cookies</Label>
              <p className="text-sm text-gray-500">
                Remember your preferences to provide you with personalized content and features.
              </p>
            </div>
            <Switch 
              checked={preferences.personalization} 
              onCheckedChange={() => handleToggle('personalization')} 
            />
          </div>
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button type="button" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
            <Button type="button" variant="default" onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}