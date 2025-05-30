"use client"

import { useState, useEffect } from 'react';
import { fetchGadgets, deleteGadget, approveGadget } from '@/app/dashboard/_actions';
import Image from 'next/image';

export default function ManageGadgets() {
  const [gadgets, setGadgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGadget, setSelectedGadget] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchGadgets().then(data => {
      setGadgets(data);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching gadgets:', error);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this gadget?')) {
      try {
        await deleteGadget(id);
        setGadgets(prev => prev.filter(gadget => gadget.id !== id));
      } catch (error) {
        console.error('Error deleting gadget:', error);
      }
    }
  };

  const handleEdit = (gadget: any) => {
    setSelectedGadget({ ...gadget });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await approveGadget(selectedGadget.id);
      // Update the gadget in the list
      setGadgets(prev => 
        prev.map(g => g.id === selectedGadget.id ? selectedGadget : g)
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating gadget:', error);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedGadget((prev: any) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Gadgets</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gadgets.map((gadget) => (
          <div key={gadget.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="relative h-fit w-full mb-4">
              {gadget.image_urls && gadget.image_urls[0] && (
                <Image
                  src={gadget.image_urls[0]}
                  alt={gadget.name}
                  width={300}
                  height={200}
                  className="object-cover rounded-lg w-full h-48"
                />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{gadget.title}</h3>
            <p className="text-gray-600 mb-2">{gadget.short_review}</p>
            <div className="space-y-2">
              <div className="flex space-x-4">
                <a href={gadget.buy_link_1} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Buy Link 1</a>
                {gadget.buy_link_2 && (
                  <a href={gadget.buy_link_2} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Buy Link 2</a>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => handleEdit(gadget)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(gadget.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8 max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white pb-4 border-b z-10">
              <h2 className="text-2xl font-bold">Edit Gadget</h2>
              <p className="text-sm text-gray-500">Edit the gadget details below</p>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-6 mt-4 overflow-y-auto pr-2 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={selectedGadget?.title || ''}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Short Review</label>
                    <textarea
                      name="short_review"
                      value={selectedGadget?.short_review || ''}
                      onChange={handleEditChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={selectedGadget?.category || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="text"
                        name="price"
                        value={selectedGadget?.price || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Buy Link 1</label>
                      <input
                        type="text"
                        name="buy_link_1"
                        value={selectedGadget?.buy_link_1 || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Buy Link 2</label>
                      <input
                        type="text"
                        name="buy_link_2"
                        value={selectedGadget?.buy_link_2 || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Network Technology</label>
                      <input
                        type="text"
                        name="network_technology"
                        value={selectedGadget?.network_technology || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Launch Announced</label>
                      <input
                        type="text"
                        name="launch_announced"
                        value={selectedGadget?.launch_announced || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Body Dimensions</label>
                      <input
                        type="text"
                        name="body_dimensions"
                        value={selectedGadget?.body_dimensions || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Display Type</label>
                      <input
                        type="text"
                        name="display_type"
                        value={selectedGadget?.display_type || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Platform OS</label>
                      <input
                        type="text"
                        name="platform_os"
                        value={selectedGadget?.platform_os || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Memory Internal</label>
                      <input
                        type="text"
                        name="memory_internal"
                        value={selectedGadget?.memory_internal || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Main Camera</label>
                      <input
                        type="text"
                        name="main_camera"
                        value={selectedGadget?.main_camera || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Main Camera Features</label>
                      <input
                        type="text"
                        name="main_camera_features"
                        value={selectedGadget?.main_camera_features || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Selfie Camera</label>
                      <input
                        type="text"
                        name="selfie_camera"
                        value={selectedGadget?.selfie_camera || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sound Loudspeaker</label>
                      <input
                        type="text"
                        name="sound_loudspeaker"
                        value={selectedGadget?.sound_loudspeaker || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Comms NFC</label>
                      <input
                        type="text"
                        name="comms_nfc"
                        value={selectedGadget?.comms_nfc || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Battery Charging</label>
                      <input
                        type="text"
                        name="battery_charging"
                        value={selectedGadget?.battery_charging || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Misc Models</label>
                      <input
                        type="text"
                        name="misc_models"
                        value={selectedGadget?.misc_models || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Image URLs (comma separated)</label>
                      <textarea
                        name="image_urls"
                        value={selectedGadget?.image_urls?.join(', ') || ''}
                        onChange={(e) => {
                          const urls = e.target.value.split(',').map(url => url.trim()).filter(url => url);
                          setSelectedGadget((prev: any) => ({
                            ...prev,
                            image_urls: urls
                          }));
                        }}
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Specifications</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Comms WLAN</label>
                          <input
                            type="text"
                            name="comms_wlan"
                            value={selectedGadget?.comms_wlan || ''}
                            onChange={handleEditChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Comms Bluetooth</label>
                          <input
                            type="text"
                            name="comms_bluetooth"
                            value={selectedGadget?.comms_bluetooth || ''}
                            onChange={handleEditChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Comms Positioning</label>
                          <input
                            type="text"
                            name="comms_positioning"
                            value={selectedGadget?.comms_positioning || ''}
                            onChange={handleEditChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Comms Radio</label>
                          <input
                            type="text"
                            name="comms_radio"
                            value={selectedGadget?.comms_radio || ''}
                            onChange={handleEditChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Comms USB</label>
                          <input
                            type="text"
                            name="comms_usb"
                            value={selectedGadget?.comms_usb || ''}
                            onChange={handleEditChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Features Sensors</label>
                          <input
                            type="text"
                            name="features_sensors"
                            value={selectedGadget?.features_sensors || ''}
                            onChange={handleEditChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Misc Colors</label>
                          <input
                            type="text"
                            name="misc_colors"
                            value={selectedGadget?.misc_colors || ''}
                            onChange={handleEditChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            <div className="sticky bottom-0 bg-white pt-4 border-t -mx-6 px-6 -mb-6">
              <form onSubmit={handleEditSubmit} className="w-full">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}