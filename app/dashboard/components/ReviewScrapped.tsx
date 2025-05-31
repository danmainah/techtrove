"use client"

import { useEffect, useState } from 'react';    
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { fetchScrapedData, approveScrapedData, deleteScrapedData } from '../_actions';
import { Gadget } from '@/types';

export default function ReviewScrapped() {
  const { data: session } = useSession();
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const [editableGadgets, setEditableGadgets] = useState<Gadget[]>([]);

  useEffect(() => {
    const fetched = async () => {
      try {
        const gadgets = await fetchScrapedData();
        // Update pending gadgets with latest data if similar
        const updatedGadgets = gadgets.map(gadget => {
          if (gadget.status === 'pending') {
            // Find latest data for similar gadget (same title, case-insensitive)
            const latest = gadgets.find(g =>
              g.id !== gadget.id &&
              g.title.trim().toLowerCase() === gadget.title.trim().toLowerCase()
            );
            if (latest) {
              // Merge latest data into pending gadget (keep id & status)
              return { ...latest, id: gadget.id, status: 'pending' };
            }
          }
          return gadget;
        });
        setGadgets(updatedGadgets);
        setEditableGadgets(updatedGadgets);
      } catch (error) {
        console.error('Error fetching gadgets: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        setLoading(false);
      }
    };
    fetched();
  }, [session]);

  const handleApprove = async (id: string) => {
    try {
      // Find the gadget to approve
      const gadgetToApprove = editableGadgets.find(g => g.id === id);
      
      if (!gadgetToApprove) {
        throw new Error('Gadget not found');
      }
      
      // Pass the gadget with flat fields to the approve function
      await approveScrapedData(id, gadgetToApprove);
      
      // Update local state
      setGadgets(gadgets.map(g => g.id === id ? {...g, status: 'approved'} : g));
      setEditableGadgets(editableGadgets.map(g => g.id === id ? {...g, status: 'approved'} : g));
    } catch (error) {
      console.error('Error approving gadget: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // No longer need updateSpecKey and updateSpecValue since we're using flat fields
  // All updates are handled by the updateField function

  const updateField = (id: string, field: keyof Gadget, value: string) => {
    setEditableGadgets(editableGadgets.map(g => {
      if (g.id === id) {
        // Create a new object with the updated field
        return { ...g, [field]: value };
      }
      return g;
    }));
  };

  if (loading) return <div>Loading gadgets...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Reviews ({gadgets.filter(g => g.status === 'pending').length})</h3>
      
      {editableGadgets.filter(g => g.status === 'pending').map(gadget => (
        <div key={gadget.id} className="border p-4 rounded-lg">
          <div className="flex gap-4 mb-4">
            {gadget.image_urls?.map((url, i) => (
              <Image 
                key={i}
                src={url} 
                alt={gadget.title || 'Gadget image'}
                width={96}
                height={96}
                className="object-cover rounded"
              />
            ))}
          </div>
          
          <h4 className="font-semibold mb-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
            <input
              id="title"
              value={gadget.title}
              onChange={(e) => updateField(gadget.id, 'title', e.target.value)}
              className="p-1 border rounded w-full"
            />
          </h4>
          <p className="text-sm mb-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              id="category"
              value={gadget.category}
              onChange={(e) => updateField(gadget.id, 'category', e.target.value)}
              className="p-1 border rounded w-full"
            />
          </p>
          <p className="text-sm mb-2">
            <label htmlFor="source_url" className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
            <input
              id="source_url"
              value={gadget.source_url}
              onChange={(e) => updateField(gadget.id, 'source_url', e.target.value)}
              className="p-1 border rounded w-full"
            />
          </p>
          <p className="text-sm mb-2">
            <label htmlFor="short_review" className="block text-sm font-medium text-gray-700 mb-1">Short Review</label>
            <textarea
              id="short_review"
              value={gadget.short_review || ''}
              onChange={(e) => updateField(gadget.id, 'short_review', e.target.value)}
              className="p-1 border rounded w-full h-20"
            />
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label htmlFor="buy_link_1" className="block text-sm font-medium text-gray-700 mb-1">Buy Link 1</label>
              <input
                id="buy_link_1"
                value={gadget.buy_link_1 || ''}
                onChange={(e) => updateField(gadget.id, 'buy_link_1', e.target.value)}
                className="p-1 border rounded w-full"
              />
            </div>
            <div>
              <label htmlFor="buy_link_2" className="block text-sm font-medium text-gray-700 mb-1">Buy Link 2</label>
              <input
                id="buy_link_2"
                value={gadget.buy_link_2 || ''}
                onChange={(e) => updateField(gadget.id, 'buy_link_2', e.target.value)}
                className="p-1 border rounded w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {/* Render each specification field as a direct property */}
            {[
              ['network_technology', 'Network Technology'],
              ['launch_announced', 'Launch Announced'],
              ['launch_status', 'Launch Status'],
              ['body_dimensions', 'Body Dimensions'],
              ['body_weight', 'Body Weight'],
              ['body_build', 'Body Build'],
              ['body_sim', 'Body SIM'],
              ['display_type', 'Display Type'],
              ['display_size', 'Display Size'],
              ['display_resolution', 'Display Resolution'],
              ['display_protection', 'Display Protection'],
              ['platform_os', 'Platform OS'],
              ['platform_chipset', 'Platform Chipset'],
              ['platform_cpu', 'Platform CPU'],
              ['platform_gpu', 'Platform GPU'],
              ['memory_internal', 'Memory Internal'],
              ['main_camera', 'Main Camera'],
              ['main_camera_features', 'Main Camera Features'],
              ['main_camera_video', 'Main Camera Video'],
              ['selfie_camera', 'Selfie Camera'],
              ['selfie_camera_video', 'Selfie Camera Video'],
              ['sound_loudspeaker', 'Sound Loudspeaker'],
              ['sound_3_5mm_jack', '3.5mm Jack'],
              ['comms_wlan', 'WLAN'],
              ['comms_bluetooth', 'Bluetooth'],
              ['comms_positioning', 'Positioning'],
              ['comms_nfc', 'NFC'],
              ['comms_radio', 'Radio'],
              ['comms_usb', 'USB'],
              ['features_sensors', 'Sensors'],
              ['battery_type', 'Battery Type'],
              ['battery_charging', 'Battery Charging'],
              ['misc_colors', 'Colors'],
              ['misc_models', 'Models'],
              ['misc_price', 'Price'],
            ].map((item) => {
              const field = item[0] as string;
              const label = item[1] as string;
              return (
              <div key={field as string} className="flex gap-2">
                <div className="w-full">
                  <label htmlFor={`${field}-${gadget.id}`} className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    id={`${field}-${gadget.id}`}
                    value={typeof gadget[field as keyof Gadget] === 'string' ? gadget[field as keyof Gadget] as string : ''}
                    onChange={e => updateField(gadget.id, field as keyof Gadget, e.target.value)}
                    className="border p-1 rounded w-full"
                  />
                </div>
              </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex gap-2">
            {gadget.status === 'pending' && (
              <button
                onClick={() => handleApprove(gadget.id)}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
            )}
            <button
              onClick={async () => {
                try {
                  await deleteScrapedData(gadget.id);
                  setGadgets(gadgets.filter(g => g.id !== gadget.id));
                  setEditableGadgets(editableGadgets.filter(g => g.id !== gadget.id));
                } catch (error) {
                  console.error('Error deleting gadget: ' + (error instanceof Error ? error.message : String(error)));
                }
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
