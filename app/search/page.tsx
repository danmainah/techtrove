"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { Gadget } from '@/types';
import { useSearchParams } from 'next/navigation';
import Layout from '../components/Layout';
import { fetchGadgets } from '@/app/dashboard/_actions';
import Link from 'next/link';
import Image from 'next/image';

// SearchResults component that uses useSearchParams
function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchGadgets = async () => {
      try {
        setLoading(true);
        const allGadgets = await fetchGadgets();
        
        if (!query) {
          setResults([]);
          return;
        }
        
        const filtered = allGadgets.filter(gadget => 
          gadget.title.toLowerCase().includes(query.toLowerCase()) ||
          gadget.category.toLowerCase().includes(query.toLowerCase())
        );
        
        setResults(filtered);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    searchGadgets();
  }, [query]);

  const getFirstImage = (gadget: Gadget) => {
    if (!gadget.image_url) return null;
    
    try {
      let urls: string[] = [];
      
      if (Array.isArray(gadget.image_url)) {
        urls = gadget.image_url;
      } else if (typeof gadget.image_url === 'string') {
        urls = gadget.image_url
          .split(',')
          .map((url: string) => url.trim())
          .filter((url: string) => url.length > 0);
      }
      
      return urls[0] || null;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Search Results for &quot;{query}&quot;
      </h1>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(gadget => {
            const imageUrl = getFirstImage(gadget);
            
            return (
              <div key={gadget.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {imageUrl && (
                  <div className="relative h-48 w-full bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={gadget.title}
                      fill
                      className="object-contain p-4"
                      unoptimized={imageUrl.includes('http')}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900">{gadget.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{gadget.category}</p>
                  {gadget.short_review && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{gadget.short_review}</p>
                  )}
                  <Link 
                    href={`/products/${gadget.id}`}
                    className="mt-4 inline-block text-sm font-medium text-teal-600 hover:text-teal-800"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No results found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}

// Main SearchPage component with Suspense boundary
export default function SearchPage() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </Layout>
  );
}
