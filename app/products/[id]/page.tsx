import Image from 'next/image';
import Link from 'next/link';
import { fetchGadgetById } from '@/app/dashboard/_actions';
import { notFound } from 'next/navigation';

type Gadget = {
  id: string;
  created_at: string;
  title: string;
  category: string;
  image_url: string | string[];
  status?: 'pending' | 'approved';
  short_review?: string;
  buy_link_1?: string;
  buy_link_2?: string;
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

const getGadget = async (id: string): Promise<Gadget | null> => {
  try {
    const data = await fetchGadgetById(id);
    return data as Gadget | null;
  } catch (error) {
    console.error('Error fetching gadget:', error);
    return null;
  }
};

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

const formatSpecs = (specs: { [key: string]: string | undefined }) => {
  return Object.entries(specs)
    .filter(([_, value]) => value)
    .map(([key, value]) => ({
      name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value
    }));
};

export default async function ProductPage({ params }: { params: { id: string } }) {
  const gadget = await getGadget(params.id);

  if (!gadget) {
    notFound();
  }

  const imageUrl = gadget ? getFirstImage(gadget) : null;
  
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
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
                        unoptimized={imageUrl.includes('supabase.co')}
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
              
              {(gadget.buy_link_1 || gadget.buy_link_2) && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Buy Now</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-2">
                    {gadget.buy_link_1 && (
                      <div>
                        <a 
                          href={gadget.buy_link_1} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 underline"
                        >
                          Purchase Option 1
                        </a>
                      </div>
                    )}
                    {gadget.buy_link_2 && (
                      <div>
                        <a 
                          href={gadget.buy_link_2} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 underline"
                        >
                          Purchase Option 2
                        </a>
                      </div>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
