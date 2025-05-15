"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { User }from "@/lib/interface";

export default function ScrapeComponent() {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const { data: session, status } = useSession()
  const userId = status === "authenticated" ? (session?.user as User)?.id : null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    try {
      setIsScraping(true);
      setError('');
      
      if (!url.includes('gsmarena.com')) {
        throw new Error('Please enter a valid GSM Arena URL');
      }
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, user: userId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scraping failed');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape data');
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            GSM Arena Product URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.gsmarena.com/product_page"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isScraping}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScraping ? 'Scraping...' : 'Scrape Product Data'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scraped Data Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Title</h4>
              <p className="mt-1 text-sm text-gray-900">{result.title}</p>
            </div>
            {result.category && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Category</h4>
                <p className="mt-1 text-sm text-gray-900">{result.category}</p>
              </div>
            )}
            {result.short_review && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Short Review</h4>
                <p className="mt-1 text-sm text-gray-900">{result.short_review}</p>
              </div>
            )}
          </div>
          
          {result.image_urls?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.image_urls.slice(0, 4).map((img: string, i: number) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt={`Product ${i + 1}`} 
                    className="h-32 w-full object-contain border border-gray-200 rounded"
                  />
                ))}
              </div>
            </div>
          )}
          
          {result.specifications && Object.keys(result.specifications).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Specifications</h4>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(result.specifications).map(([key, value], i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{value as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
