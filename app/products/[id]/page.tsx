'use client';

import Image from 'next/image';
import Layout from '../../components/Layout';
import ProductViewTracker from './ProductViewTracker';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchGadgetById } from '@/app/dashboard/_actions';

type Gadget = {
  id: string;
  title: string;
  short_review?: string;
  image_url?: string;
  category?: string;
  buy_link_1?: string;
  buy_link_2?: string;
  // Technical specs
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
  brand?: string;
  model?: string;
  release_date?: string;
  price?: string | number;
  description?: string;
};

export default function ProductPage() {
  // Get the id from the URL using useParams
  const params = useParams();
  const id = params?.id as string;
  
  const [gadget, setGadget] = useState<Gadget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if we have an ID
    if (id) {
      const loadGadget = async () => {
        try {
          const data = await fetchGadgetById(id);
          setGadget(data);
        } catch (error) {
          console.error('Error loading gadget:', error);
        } finally {
          setLoading(false);
        }
      };

      loadGadget();
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </Layout>
    );
  }

  if (!gadget) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-teal-600">Product Not Found</h2>
          <p className="mt-2">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>

        </div>
      </Layout>
    );
  }

  // Process image URL
  let imageUrl = gadget.image_url || '';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
    imageUrl = `https://${imageUrl}`;
  } else if (imageUrl && imageUrl.startsWith('//')) {
    imageUrl = `https:${imageUrl}`;
  }

  return (
    <Layout>
      {/* Track product view */}
      <ProductViewTracker productId={gadget.id} />
      
      {/* Product header */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">{gadget.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{gadget.category}</p>
        </div>

        {/* Product image and short details */}
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <div className="sm:grid sm:grid-cols-3 sm:gap-4">
            {/* Product image */}
            {imageUrl && (
              <div className="col-span-1 p-4">
                <Image 
                  src={imageUrl} 
                  alt={gadget.title} 
                  width={300} 
                  height={300} 
                  className="rounded-lg object-contain"
                />
              </div>
            )}

            {/* Short details and buy links */}
            <div className={`col-span-${imageUrl ? '2' : '3'} p-4`}>
              {gadget.short_review && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Overview</h3>
                  <p className="mt-1 text-gray-600">{gadget.short_review}</p>
                </div>
              )}

              {/* Price */}
              {gadget.price && (
                <div className="mb-4">
                  <span className="text-2xl font-bold text-teal-600">
                    ${typeof gadget.price === 'string' ? parseFloat(gadget.price).toLocaleString() : gadget.price.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Buy links */}
              <div className="flex flex-wrap gap-3 mt-4">
                {gadget.buy_link_1 && (
                  <a 
                    href={gadget.buy_link_1} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Buy Now
                  </a>
                )}
                {gadget.buy_link_2 && (
                  <a 
                    href={gadget.buy_link_2} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Compare Price
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical specifications */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Technical Specifications</h2>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {/* Display section */}
            {(gadget.display_type || gadget.display_size || gadget.display_resolution) && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Display</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <ul className="list-disc pl-5 space-y-1">
                    {gadget.display_type && <li>{gadget.display_type}</li>}
                    {gadget.display_size && <li>{gadget.display_size}</li>}
                    {gadget.display_resolution && <li>{gadget.display_resolution}</li>}
                    {gadget.display_protection && <li>Protection: {gadget.display_protection}</li>}
                  </ul>
                </dd>
              </div>
            )}

            {/* Platform section */}
            {(gadget.platform_os || gadget.platform_chipset || gadget.platform_cpu || gadget.platform_gpu) && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Platform</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <ul className="list-disc pl-5 space-y-1">
                    {gadget.platform_os && <li>OS: {gadget.platform_os}</li>}
                    {gadget.platform_chipset && <li>Chipset: {gadget.platform_chipset}</li>}
                    {gadget.platform_cpu && <li>CPU: {gadget.platform_cpu}</li>}
                    {gadget.platform_gpu && <li>GPU: {gadget.platform_gpu}</li>}
                  </ul>
                </dd>
              </div>
            )}

            {/* Memory section */}
            {gadget.memory_internal && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Memory</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {gadget.memory_internal}
                </dd>
              </div>
            )}

            {/* Camera section */}
            {(gadget.main_camera || gadget.selfie_camera) && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Camera</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <ul className="list-disc pl-5 space-y-1">
                    {gadget.main_camera && <li>Main: {gadget.main_camera}</li>}
                    {gadget.main_camera_features && <li>Features: {gadget.main_camera_features}</li>}
                    {gadget.main_camera_video && <li>Video: {gadget.main_camera_video}</li>}
                    {gadget.selfie_camera && <li>Selfie: {gadget.selfie_camera}</li>}
                    {gadget.selfie_camera_video && <li>Selfie Video: {gadget.selfie_camera_video}</li>}
                  </ul>
                </dd>
              </div>
            )}

            {/* Battery section */}
            {(gadget.battery_type || gadget.battery_charging) && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Battery</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <ul className="list-disc pl-5 space-y-1">
                    {gadget.battery_type && <li>{gadget.battery_type}</li>}
                    {gadget.battery_charging && <li>Charging: {gadget.battery_charging}</li>}
                  </ul>
                </dd>
              </div>
            )}

            {/* Connectivity section */}
            {(gadget.comms_wlan || gadget.comms_bluetooth || gadget.comms_nfc || gadget.comms_usb) && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Connectivity</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <ul className="list-disc pl-5 space-y-1">
                    {gadget.comms_wlan && <li>WLAN: {gadget.comms_wlan}</li>}
                    {gadget.comms_bluetooth && <li>Bluetooth: {gadget.comms_bluetooth}</li>}
                    {gadget.comms_nfc && <li>NFC: {gadget.comms_nfc}</li>}
                    {gadget.comms_positioning && <li>GPS: {gadget.comms_positioning}</li>}
                    {gadget.comms_radio && <li>Radio: {gadget.comms_radio}</li>}
                    {gadget.comms_usb && <li>USB: {gadget.comms_usb}</li>}
                  </ul>
                </dd>
              </div>
            )}

            {/* Body section */}
            {(gadget.body_dimensions || gadget.body_weight || gadget.body_build || gadget.body_sim) && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Body</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <ul className="list-disc pl-5 space-y-1">
                    {gadget.body_dimensions && <li>Dimensions: {gadget.body_dimensions}</li>}
                    {gadget.body_weight && <li>Weight: {gadget.body_weight}</li>}
                    {gadget.body_build && <li>Build: {gadget.body_build}</li>}
                    {gadget.body_sim && <li>SIM: {gadget.body_sim}</li>}
                  </ul>
                </dd>
              </div>
            )}

            {/* Misc section */}
            {(gadget.misc_colors || gadget.misc_models || gadget.misc_price) && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Miscellaneous</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <ul className="list-disc pl-5 space-y-1">
                    {gadget.misc_colors && <li>Colors: {gadget.misc_colors}</li>}
                    {gadget.misc_models && <li>Models: {gadget.misc_models}</li>}
                    {gadget.misc_price && <li>Price: {gadget.misc_price}</li>}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </Layout>
  );
}