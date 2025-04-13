import { useState, useEffect } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function ConsentPreferencesDialog({
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
  
  if (!open) return null;
  
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
        >
          {/* Header */}
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
              Cookie Preferences
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-gray-500">
              Customize your cookie preferences for different categories. Necessary cookies are always enabled as they are essential for the website to function properly.
            </DialogPrimitive.Description>
          </div>
          
          {/* Content */}
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
          
          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button type="button" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
              <Button type="button" onClick={handleAcceptAll}>
                Accept All
              </Button>
            </div>
          </div>
          
          {/* Close button */}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}