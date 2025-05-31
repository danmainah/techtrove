"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMostViewedGadgets } from '@/app/dashboard/_actions';
import { GadgetWithViewCount } from '@/types';

export default function Sidebar() {
  const [mostViewed, setMostViewed] = useState<GadgetWithViewCount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Helper function to get the first valid image URL
  const getFirstImage = (gadget: GadgetWithViewCount): string | null => {
    if (!gadget.image_url) return null;
    
    try {
      // Handle both string and string[] types
      let urls: string[] = [];
      
      if (Array.isArray(gadget.image_url)) {
        urls = gadget.image_url;
      } else if (typeof gadget.image_url === 'string') {
        urls = gadget.image_url
          .split(',')
          .map((url: string) => url.trim())
          .filter((url: string) => url.length > 0);
      }
      
      const validUrl = urls.find((url: string) => url && url.trim() !== '');
      
      if (!validUrl) return null;
      
      let finalUrl = validUrl;
      
      // Ensure the URL has a protocol
      if (!validUrl.startsWith('http') && !validUrl.startsWith('//')) {
        finalUrl = `https://${validUrl}`;
      } else if (validUrl.startsWith('//')) {
        finalUrl = `https:${validUrl}`;
      }
      
      return finalUrl;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchMostViewed = async () => {
      try {
        const gadgets = await getMostViewedGadgets();
        setMostViewed(gadgets);
      } catch (error) {
        console.error('Failed to load most viewed gadgets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostViewed();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4 pb-2 border-b">Most Viewed Gadgets</h3>
      <div className="space-y-4">
        {mostViewed.map((gadget) => (
          <Link 
            key={gadget.id} 
            href={`/products/${gadget.id}`}
            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors"
          >
            <div className="relative w-16 h-16 flex-shrink-0">
              {getFirstImage(gadget) ? (
                <Image 
                  src={getFirstImage(gadget) || ''} 
                  alt={gadget.title}
                  fill
                  className="object-cover rounded"
                  unoptimized={true}
                />
              ) : (
                <div className="bg-gray-200 w-full h-full rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 line-clamp-1">{gadget.title}</h4>
              <div className="flex justify-between items-center">
                {gadget.misc_price && (
                  <p className="text-sm text-indigo-600">{gadget.misc_price}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
