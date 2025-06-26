'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchGadgets } from '@/app/dashboard/_actions';
import Sidebar from './components/Sidebar';
import Layout from './components/Layout';
import Head from 'next/head';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [allGadgets, setAllGadgets] = useState<Gadget[]>([]); // Store all loaded gadgets

  useEffect(() => {
    console.log('Current latest gadgets:', latestGadgets);
  }, [latestGadgets]);

  const loadGadgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const gadgets = await fetchGadgets();
      console.log('Fetched gadgets:', gadgets);
      
      if (!Array.isArray(gadgets)) {
        throw new Error('Invalid data format received from API');
      }
      
      setAllGadgets(gadgets);
      setLatestGadgets(gadgets.slice(0, itemsPerPage));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load gadgets';
      console.error('Error loading gadgets:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const totalPages = Math.ceil(allGadgets.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setLatestGadgets(allGadgets.slice(startIndex, endIndex));
  };

  useEffect(() => {
    loadGadgets();
  }, [loadGadgets]);

  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Phone Model Name", // Replace with dynamic data
      "image": "URL to image", // Replace with dynamic data
      "description": "A brief description of the phone.", // Replace with dynamic data
      "brand": {
        "@type": "Brand",
        "name": "Brand Name" // Replace with dynamic data
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5", // Replace with dynamic data
        "reviewCount": "100" // Replace with dynamic data
      },
      "review": {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Reviewer Name" // Replace with dynamic data
        },
        "datePublished": "2023-01-01", // Replace with dynamic data
        "reviewBody": "This phone is amazing because...", // Replace with dynamic data
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "4.5", // Replace with dynamic data
          "bestRating": "5"
        }
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(script);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
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
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
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
    <>
      <Head>
        <title>Trove Bits - Discover the Latest Tech Gadgets</title>
        <meta name="description" content="Explore the latest and greatest in tech gadgets and gear. Stay updated with the newest releases and reviews." />
        <meta name="keywords" content="gadgets, tech, technology, reviews, electronics, latest gadgets" />
        <meta name="robots" content="index, follow" />
      </Head>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-80 space-y-6">
              <Sidebar />
            </div>
            
            {/* Main content */}
            <div className="flex-1">
              {/* Hero Section */}
              <div className="bg-teal-600 text-cyan-50 py-12 rounded-xl mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h1 className="text-4xl font-bold tracking-tight">Welcome to Trove Bits</h1>
                  <p className="mt-4 text-xl text-teal-100">
                    Discover the latest and greatest in tech gadgets and gear
                  </p>
                </div>
              </div>
              
              {/* Latest Gadgets Summary */}
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Gadgets</h2>
              <div className="space-y-8">
                {latestGadgets.map((gadget) => {
                  const features = getSummaryFeatures(gadget);
                  const imageData = getFirstImage(gadget);
                  
                  return (
                    <div key={gadget.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row h-full">
                      {/* Image Section */}
                      <div className="relative w-full md:w-1/3 h-64 md:h-auto bg-gray-50 flex items-center justify-center p-6">
                        {!imageData ? (
                          <div className="flex flex-col items-center justify-center text-center p-6">
                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="mt-2 text-sm text-gray-500">No image available</span>
                          </div>
                        ) : (
                          <div className="relative w-full h-full">
                            <Image
                              className="object-contain"
                              src={imageData.url}
                              alt={gadget.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.style.display = 'none';
                                target.parentElement!.querySelector('.no-image-fallback')?.classList.remove('hidden');
                              }}
                              unoptimized={imageData.isExternal}
                            />
                            <div className="hidden no-image-fallback absolute inset-0 flex-col items-center justify-center p-4 text-center">
                              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info Section */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <Link href={`/products/${gadget.id}`} className="hover:underline">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {gadget.title}
                            </h3>
                          </Link>
                          {features.price && (
                            <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
                              {features.price}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          {/* Short Review */}
                          {gadget.short_review && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg my-3">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <h4 className="text-sm font-medium text-blue-800">
                                    Our Expert Review
                                  </h4>
                                  <div className="mt-1 text-sm text-gray-700">
                                    <p className="italic">&quot;{gadget.short_review}&quot;</p>
                                    <div className="mt-2 flex items-center">
                                      <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <svg key={star} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                        <span className="ml-1 text-xs text-gray-500">5.0</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Key Specs */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 mt-4">
                            {features.screen && (
                              <div className="flex items-start">
                                <span className="font-medium text-gray-900 w-20">Display:</span>
                                <span>{features.screen}</span>
                              </div>
                            )}
                            {features.cpu && (
                              <div className="flex items-start">
                                <span className="font-medium text-gray-900 w-20">Processor:</span>
                                <span>{features.cpu}</span>
                              </div>
                            )}
                            {features.cameras && (
                              <div className="flex items-start">
                                <span className="font-medium text-gray-900 w-20">Camera:</span>
                                <span>{features.cameras}</span>
                              </div>
                            )}
                            {features.battery && (
                              <div className="flex items-start">
                                <span className="font-medium text-gray-900 w-20">Battery:</span>
                                <span>{features.battery}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link 
                            href={`/products/${gadget.id}`}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                          >
                            View Full Specs
                          </Link>
                          {gadget.buy_link_1 && (
                            <a 
                              href={gadget.buy_link_1} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                              Buy Now
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-center mt-8">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button key={index} onClick={() => handlePageChange(index + 1)} className={`px-4 py-2 ${currentPage === index + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'} rounded`}>{index + 1}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
