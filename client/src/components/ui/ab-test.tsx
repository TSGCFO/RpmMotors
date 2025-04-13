import { useState, useEffect, ReactNode } from 'react';
import { getABTestVariant, trackABTestConversion } from '@/lib/cookieUtils';

interface ABTestProps {
  testName: string;
  variants: {
    A: ReactNode;
    B: ReactNode;
  };
  onConversion?: (action: string, variant: string) => void;
}

/**
 * A/B Test component for testing different UI variations
 * 
 * This component allows you to implement A/B testing throughout the application
 * by showing different variants to different users and tracking their interactions.
 * 
 * @param {string} testName - Unique name for this test to track results
 * @param {Object} variants - Object with variants A and B as React nodes
 * @param {function} onConversion - Optional callback when a conversion is tracked
 */
export default function ABTest({ testName, variants, onConversion }: ABTestProps) {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Get or assign A/B test variant
    const testVariant = getABTestVariant(testName);
    setVariant(testVariant as 'A' | 'B');
    setIsLoaded(true);
    
    // Track impression
    trackABTestConversion(testName, 'impression');
  }, [testName]);
  
  // Don't render anything until we know which variant to show
  // This prevents content flashing
  if (!isLoaded) return null;
  
  // Helper function to track conversions for this test
  const trackConversion = (action: string) => {
    trackABTestConversion(testName, action);
    if (onConversion) {
      onConversion(action, variant);
    }
  };
  
  // Wrap the chosen variant with an event handler
  const content = variant === 'A' ? variants.A : variants.B;
  
  // Recursively add onClick to all interactive elements
  const addClickTracking = (node: ReactNode): ReactNode => {
    if (!node || typeof node !== 'object' || !('type' in node)) {
      return node;
    }
    
    // If it's a component, just return it as is
    if (typeof node.type === 'function') {
      return node;
    }
    
    // If it's an interactive element, add onClick handler
    if (
      node.type === 'button' || 
      node.type === 'a' || 
      node.type === 'input' ||
      node.props?.role === 'button'
    ) {
      const originalOnClick = node.props?.onClick;
      
      return {
        ...node,
        props: {
          ...node.props,
          onClick: (e: React.MouseEvent) => {
            trackConversion('click');
            if (originalOnClick) {
              originalOnClick(e);
            }
          }
        }
      };
    }
    
    // If it has children, process them recursively
    if (node.props?.children) {
      return {
        ...node,
        props: {
          ...node.props,
          children: Array.isArray(node.props.children) 
            ? node.props.children.map(addClickTracking) 
            : addClickTracking(node.props.children)
        }
      };
    }
    
    return node;
  };
  
  return content;
}