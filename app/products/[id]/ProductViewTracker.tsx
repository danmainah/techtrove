"use client";

import { useEffect } from 'react';
import { trackGadgetView } from '@/app/dashboard/_actions';

export default function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    // Wrap in a try/catch to handle any errors
    const trackView = async () => {
      try {
        console.log('Tracking view for product:', productId);
        const result = await trackGadgetView(productId, 'product');
        if (result.success) {
          console.log('View tracked successfully');
        } else {
          console.error('Failed to track view:', result.error);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };
    
    // Call the function
    trackView();
  }, [productId]);

  return null;
}
