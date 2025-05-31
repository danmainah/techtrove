"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '../../components/Layout';
import ProductViewTracker from './ProductViewTracker';
import { useState, useEffect } from 'react';
import { Gadget } from '@/types';

// Helper function to get the first image URL
const getFirstImage = (gadget: Gadget): string | null => {
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
    
    const validUrl = urls.find((url: string) => url && url.trim() !== '');
    
    if (!validUrl) return null;
    
    if (!validUrl.startsWith('http') && !validUrl.startsWith('//')) {
      return `https://${validUrl}`;
    } else if (validUrl.startsWith('//')) {
      return `https:${validUrl}`;
    }
    
    return validUrl;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return null;
  }
};

// Helper function to format specifications
const formatSpecs = (specs: { [key: string]: string | undefined }) => {
  return Object.entries(specs)
    .filter(([, value]) => value)
    .map(([key, value]) => ({
      name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value
    }));
};

// Client component that receives the gadget data as a prop
export default function ProductClient({ gadgetData, productId }: { gadgetData: Gadget, productId: string }) {
  const [gadget, setGadget] = useState<Gadget | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    if (gadgetData) {
      setGadget(gadgetData as Gadget);
    }
  }, [gadgetData]);

  if (!gadget) {
    return (
      <Layout>
        <ProductViewTracker productId={productId} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-8">
            <p className="text-center">Product not found</p>
            <div className="mt-4 text-center">
              <button 
                onClick={() => router.back()} 
                className="text-blue-600 hover:text-blue-800"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const imageUrl = getFirstImage(gadget);
  
  const specs = {
    'Network': gadget.network_technology,
    'Announced': gadget.launch_announced,
    'Status': gadget.launch_status,
    'Dimensions': gadget.body_dimensions,
    'Weight': gadget.body_weight,
    'Build': gadget.body_build,
    'SIM': gadget.body_sim,
    'Display Type': gadget.display_type,
    'Size': gadget.display_size,
    'Resolution': gadget.display_resolution,
    'Protection': gadget.display_protection,
    'OS': gadget.platform_os,
    'Chipset': gadget.platform_chipset,
    'CPU': gadget.platform_cpu,
    'GPU': gadget.platform_gpu,
    'Internal Memory': gadget.memory_internal,
    'Main Camera': gadget.main_camera,
    'Features': gadget.main_camera_features,
    'Video': gadget.main_camera_video,
    'Selfie Camera': gadget.selfie_camera,
    'Selfie Video': gadget.selfie_camera_video,
    'Loudspeaker': gadget.sound_loudspeaker,
    '3.5mm Jack': gadget.sound_3_5mm_jack,
    'WLAN': gadget.comms_wlan,
    'Bluetooth': gadget.comms_bluetooth,
    'Positioning': gadget.comms_positioning,
    'NFC': gadget.comms_nfc,
    'Radio': gadget.comms_radio,
    'USB': gadget.comms_usb,
    'Sensors': gadget.features_sensors,
    'Battery Type': gadget.battery_type,
    'Charging': gadget.battery_charging,
    'Colors': gadget.misc_colors,
    'Models': gadget.misc_models,
    'Price': gadget.misc_price
  };

  const formattedSpecs = formatSpecs(specs);

  return (
    <Layout>
      <ProductViewTracker productId={productId} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">{gadget.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{gadget.category}</p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Overview</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {gadget.short_review || 'No description available.'}
                </dd>
              </div>
              
              {imageUrl && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Image</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="relative h-64 w-full bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={gadget.title}
                        fill
                        className="object-contain p-4"
                        unoptimized={typeof imageUrl === 'string' && imageUrl.includes('supabase.co')}
                      />
                    </div>
                  </dd>
                </div>
              )}
              
              {formattedSpecs.map(({ name, value }) => (
                <div key={name} className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">{name}</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {value || 'N/A'}
                  </dd>
                </div>
              ))}
              
              {gadget.buy_link_1 && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Buy Now</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <a 
                      href={gadget.buy_link_1} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Purchase Link
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
}
