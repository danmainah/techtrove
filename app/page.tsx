'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchGadgets } from '@/app/dashboard/_actions';

type Gadget = {
  id: string;
  created_at: string;
  title: string;
  category: string;
  image_url: string | string[]; // Can be either string or array of strings
  status?: 'pending' | 'approved';
  short_review?: string;
  buy_link_1?: string;
  network_technology?: string;
  launch_announced?: string;
  launch_status?: string;
  body_dimensions?: string;
  body_weight?: string;
  body_build?: string;
  body_sim?: string;
  display_type?: string;
  display_size?: string;
  display_resolution?: string;
  display_protection?: string;
  platform_os?: string;
  platform_chipset?: string;
  platform_cpu?: string;
  platform_gpu?: string;
  memory_internal?: string;
  main_camera?: string;
  main_camera_features?: string;
  main_camera_video?: string;
  selfie_camera?: string;
  selfie_camera_video?: string;
  sound_loudspeaker?: string;
  sound_3_5mm_jack?: string;
  comms_wlan?: string;
  comms_bluetooth?: string;
  comms_positioning?: string;
  comms_nfc?: string;
  comms_radio?: string;
  comms_usb?: string;
  features_sensors?: string;
  battery_type?: string;
  battery_charging?: string;
  misc_colors?: string;
  misc_models?: string;
  misc_price?: string;
};

export default function Home() {
  const [latestGadgets, setLatestGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Current latest gadgets:', latestGadgets);
  }, [latestGadgets]);

  const loadGadgets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const latest = await fetchGadgets();
      console.log('Fetched latest gadgets:', latest);
      
      if (!Array.isArray(latest)) {
        throw new Error('Invalid data format received from API');
      }
      
      setLatestGadgets(latest.slice(0, 5));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load gadgets';
      console.error('Error loading gadgets:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGadgets();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-md">
          <h2 className="font-bold text-lg mb-2">Error loading gadgets</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={loadGadgets}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (latestGadgets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No gadgets found</h2>
          <button 
            onClick={loadGadgets}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Helper to get summary features
  const getSummaryFeatures = (gadget: Gadget) => {
    return {
      screen: gadget.display_size,
      cpu: gadget.platform_cpu,
      cameras: gadget.main_camera,
      battery: gadget.battery_type,
      price: gadget.misc_price,
      android: gadget.platform_os
    };
  };

  // Helper to get the first valid image URL
  const getFirstImage = (gadget: Gadget): { url: string; isExternal: boolean } | null => {
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
      
      // Check if this is a Supabase URL
      const isSupabaseUrl = finalUrl.includes('supabase.co');
      
      return {
        url: finalUrl,
        isExternal: isSupabaseUrl
      };
    } catch (error) {
      console.error('Error processing image URL:', error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Tech Trove</h1>
          <p className="mt-4 text-xl text-indigo-100">
            Discover the latest and greatest in tech gadgets and gear
          </p>
        </div>
      </div>

      {/* Latest Gadgets Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Gadgets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestGadgets.map((gadget) => {
            const features = getSummaryFeatures(gadget);
            return (
              <div key={gadget.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <div className="relative h-60 w-full bg-gray-100 flex items-center justify-center">
                  {(() => {
                    const imageData = getFirstImage(gadget);
                    
                    if (!imageData) {
                      return (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="mt-2 text-sm text-gray-500">No image available</span>
                        </div>
                      );
                    }
                    
                    return (
                      <Image
                        className="object-contain p-4"
                        src={imageData.url}
                        alt={gadget.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        onError={(e) => {
                          // Fallback to placeholder on error
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                          target.parentElement!.querySelector('.no-image-fallback')?.classList.remove('hidden');
                        }}
                        unoptimized={imageData.isExternal}
                      />
                    );
                  })()}
                  <div className="hidden no-image-fallback absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-500">Image not available</span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <Link href={`/products/${gadget.id}`} className="hover:underline">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
                      {gadget.title}
                    </h3>
                  </Link>
                  <div className="text-sm text-gray-700 space-y-1 mb-2">
                    {features.screen && <div><span className="font-medium">Screen:</span> {features.screen}</div>}
                    {features.cpu && <div><span className="font-medium">CPU:</span> {features.cpu}</div>}
                    {features.cameras && <div><span className="font-medium">Cameras:</span> {features.cameras}</div>}
                    {features.battery && <div><span className="font-medium">Battery:</span> {features.battery}</div>}
                    {features.price && <div><span className="font-medium">Price:</span> {features.price}</div>}
                    {features.android && <div><span className="font-medium">Android:</span> {features.android}</div>}
                  </div>
                  {gadget.short_review && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{gadget.short_review}</p>}
                  {gadget.buy_link_1 && (
                    <a href={gadget.buy_link_1} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs mb-2">Buy Now</a>
                  )}
                  <a href={`/products/${gadget.id}`} className="mt-auto inline-block px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-semibold">View Details</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
