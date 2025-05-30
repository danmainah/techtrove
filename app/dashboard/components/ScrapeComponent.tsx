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
      
      // Log the full response for debugging
      console.log('Scraped data:', data);
      
      // Check if we have at least some valid data
      if (!data.title && !data.category && !data.short_review) {
        console.error('Incomplete data received:', data);
        throw new Error('Incomplete data received from scraper');
      }
      
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
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Title</h4>
                <p className="mt-1 text-sm text-gray-900">{result.title || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Category</h4>
                <p className="mt-1 text-sm text-gray-900">{result.category || 'N/A'}</p>
              </div>
            </div>
            {result.short_review && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500">Short Review</h4>
                <p className="mt-1 text-sm text-gray-900">{result.short_review}</p>
              </div>
            )}
          </div>

          {/* Images */}
          {result.image_urls?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.image_urls.slice(0, 4).map((img: string, i: number) => (
                  <div key={i} className="border border-gray-200 rounded p-2">
                    <img 
                      src={img} 
                      alt={`Product ${i + 1}`} 
                      className="h-32 w-full object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
            
            {/* Network & Launch */}
            {(result.network_technology || result.launch_announced || result.launch_status) && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Network & Launch</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.network_technology && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Network</h5>
                      <p className="text-sm text-gray-900">{result.network_technology}</p>
                    </div>
                  )}
                  {result.launch_announced && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Announced</h5>
                      <p className="text-sm text-gray-900">{result.launch_announced}</p>
                    </div>
                  )}
                  {result.launch_status && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Status</h5>
                      <p className="text-sm text-gray-900">{result.launch_status}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Body */}
            {(result.body_dimensions || result.body_weight || result.body_build || result.body_sim) && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Body</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {result.body_dimensions && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Dimensions</h5>
                      <p className="text-sm text-gray-900">{result.body_dimensions}</p>
                    </div>
                  )}
                  {result.body_weight && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Weight</h5>
                      <p className="text-sm text-gray-900">{result.body_weight}</p>
                    </div>
                  )}
                  {result.body_build && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Build</h5>
                      <p className="text-sm text-gray-900">{result.body_build}</p>
                    </div>
                  )}
                  {result.body_sim && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">SIM</h5>
                      <p className="text-sm text-gray-900">{result.body_sim}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Display */}
            {(result.display_type || result.display_size || result.display_resolution || result.display_protection) && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Display</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {result.display_type && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Type</h5>
                      <p className="text-sm text-gray-900">{result.display_type}</p>
                    </div>
                  )}
                  {result.display_size && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Size</h5>
                      <p className="text-sm text-gray-900">{result.display_size}</p>
                    </div>
                  )}
                  {result.display_resolution && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Resolution</h5>
                      <p className="text-sm text-gray-900">{result.display_resolution}</p>
                    </div>
                  )}
                  {result.display_protection && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Protection</h5>
                      <p className="text-sm text-gray-900">{result.display_protection}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Platform */}
            {(result.platform_os || result.platform_chipset || result.platform_cpu || result.platform_gpu) && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Platform</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {result.platform_os && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">OS</h5>
                      <p className="text-sm text-gray-900">{result.platform_os}</p>
                    </div>
                  )}
                  {result.platform_chipset && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Chipset</h5>
                      <p className="text-sm text-gray-900">{result.platform_chipset}</p>
                    </div>
                  )}
                  {result.platform_cpu && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">CPU</h5>
                      <p className="text-sm text-gray-900">{result.platform_cpu}</p>
                    </div>
                  )}
                  {result.platform_gpu && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">GPU</h5>
                      <p className="text-sm text-gray-900">{result.platform_gpu}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Memory */}
            {result.memory_internal && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Memory</h4>
                <div>
                  <h5 className="text-sm font-medium text-gray-500">Internal</h5>
                  <p className="text-sm text-gray-900">{result.memory_internal}</p>
                </div>
              </div>
            )}

            {/* Main Camera */}
            {(result.main_camera || result.main_camera_features || result.main_camera_video) && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Main Camera</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.main_camera && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Specs</h5>
                      <p className="text-sm text-gray-900">{result.main_camera}</p>
                    </div>
                  )}
                  {result.main_camera_features && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Features</h5>
                      <p className="text-sm text-gray-900">{result.main_camera_features}</p>
                    </div>
                  )}
                  {result.main_camera_video && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Video</h5>
                      <p className="text-sm text-gray-900">{result.main_camera_video}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selfie Camera */}
            {(result.selfie_camera || result.selfie_camera_video) && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Selfie Camera</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.selfie_camera && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Specs</h5>
                      <p className="text-sm text-gray-900">{result.selfie_camera}</p>
                    </div>
                  )}
                  {result.selfie_camera_video && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Video</h5>
                      <p className="text-sm text-gray-900">{result.selfie_camera_video}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sound */}
            {(result.sound_loudspeaker || result.sound_3_5mm_jack) && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Sound</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.sound_loudspeaker && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Loudspeaker</h5>
                      <p className="text-sm text-gray-900">{result.sound_loudspeaker}</p>
                    </div>
                  )}
                  {result.sound_3_5mm_jack && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">3.5mm Jack</h5>
                      <p className="text-sm text-gray-900">{result.sound_3_5mm_jack}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Communications */}
            {(result.comms_wlan || result.comms_bluetooth || result.comms_positioning || 
              result.comms_nfc || result.comms_radio || result.comms_usb) && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Communications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.comms_wlan && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">WLAN</h5>
                      <p className="text-sm text-gray-900">{result.comms_wlan}</p>
                    </div>
                  )}
                  {result.comms_bluetooth && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Bluetooth</h5>
                      <p className="text-sm text-gray-900">{result.comms_bluetooth}</p>
                    </div>
                  )}
                  {result.comms_positioning && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Positioning</h5>
                      <p className="text-sm text-gray-900">{result.comms_positioning}</p>
                    </div>
                  )}
                  {result.comms_nfc && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">NFC</h5>
                      <p className="text-sm text-gray-900">{result.comms_nfc}</p>
                    </div>
                  )}
                  {result.comms_radio && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Radio</h5>
                      <p className="text-sm text-gray-900">{result.comms_radio}</p>
                    </div>
                  )}
                  {result.comms_usb && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">USB</h5>
                      <p className="text-sm text-gray-900">{result.comms_usb}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Features */}
            {result.features_sensors && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Features</h4>
                <div>
                  <h5 className="text-sm font-medium text-gray-500">Sensors</h5>
                  <p className="text-sm text-gray-900">{result.features_sensors}</p>
                </div>
              </div>
            )}

            {/* Battery */}
            {(result.battery_type || result.battery_charging) && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Battery</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.battery_type && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Type</h5>
                      <p className="text-sm text-gray-900">{result.battery_type}</p>
                    </div>
                  )}
                  {result.battery_charging && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Charging</h5>
                      <p className="text-sm text-gray-900">{result.battery_charging}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Miscellaneous */}
            {(result.misc_colors || result.misc_models) && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Miscellaneous</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.misc_colors && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Colors</h5>
                      <p className="text-sm text-gray-900">{result.misc_colors}</p>
                    </div>
                  )}
                  {result.misc_models && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Models</h5>
                      <p className="text-sm text-gray-900">{result.misc_models}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
