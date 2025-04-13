import { useEffect, useState, ReactNode } from 'react';
import { getABTestVariant, trackABTestConversion } from '@/lib/cookieUtils';

interface ABTestProps {
  testName: string;
  variants: {
    [key: string]: ReactNode;
  };
  defaultVariant: string;
  conversionAction?: string;
}

/**
 * ABTest component that renders different content variants based on A/B test assignment
 * 
 * This component will randomly assign users to different test variants and track
 * which variant they see. When combined with conversion tracking, this allows
 * measuring which design or content performs better.
 * 
 * @param {string} testName - Unique identifier for this test
 * @param {Object} variants - Object with variant keys and their corresponding React elements
 * @param {string} defaultVariant - Default variant to use if cookies are not available
 * @param {string} conversionAction - Optional action to track when user interacts with component
 */
export default function ABTest({
  testName,
  variants,
  defaultVariant,
  conversionAction
}: ABTestProps) {
  const [variant, setVariant] = useState<string>(defaultVariant);
  const [hasRendered, setHasRendered] = useState(false);
  
  useEffect(() => {
    // Get the assigned variant for this user (or assign one if it's their first visit)
    const assignedVariant = getABTestVariant(testName);
    
    // If we have a valid assigned variant that exists in our variants object, use it
    if (assignedVariant && variants[assignedVariant]) {
      setVariant(assignedVariant);
    } else {
      // Otherwise use the default
      setVariant(defaultVariant);
    }
    
    setHasRendered(true);
  }, [testName, variants, defaultVariant]);
  
  // Track conversion if conversionAction is provided
  const trackConversion = () => {
    if (conversionAction) {
      trackABTestConversion(testName, conversionAction);
    }
  };
  
  // Wrap the variant content in a div that tracks clicks if conversion tracking is enabled
  const content = hasRendered ? (
    <div onClick={conversionAction ? trackConversion : undefined}>
      {variants[variant]}
    </div>
  ) : null;
  
  return content;
}