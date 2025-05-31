"use client"

import { useState, useEffect } from 'react';
import { fetchGadgets, deleteGadget, updateGadget } from '@/app/dashboard/_actions';
import Image from 'next/image';
import { Gadget } from '@/types';

export default function ManageGadgets() {
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGadget, setSelectedGadget] = useState<Gadget | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleEdit = (gadget: Gadget) => {
    setSelectedGadget({ ...gadget });
    setIsEditModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedGadget?.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (selectedGadget?.price && isNaN(Number(selectedGadget.price))) {
      newErrors.price = 'Must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateImageUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    const urls = value.split('\n').filter(url => url.trim());
    
    const newErrors = {...errors};
    urls.forEach((url, index) => {
      if (!validateImageUrl(url)) {
        newErrors[`image_url_${index}`] = 'Please enter a valid URL';
      }
    });
    
    setErrors(newErrors);
    setSelectedGadget((prev: Gadget | null) => prev ? ({
      ...prev,
      image_urls: urls
    }) : null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      if (selectedGadget) {
        await updateGadget(selectedGadget.id, selectedGadget);
        setGadgets(prev => 
          prev.map(g => g.id === selectedGadget.id ? selectedGadget : g)
        );
      }
      setSuccessMessage('Gadget updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating gadget:', error);
      setErrors({
        ...errors,
        form: 'Failed to update gadget. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedGadget((prev: Gadget | null) => {
      if (!prev) return null;
      
      // Handle price specifically to ensure it's a number or empty string
      if (name === 'price') {
        return {
          ...prev,
          [name]: value === '' ? '' : parseFloat(value) || 0
        };
      }
      
      return {
        ...prev,
        [name]: value
      };
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
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
                  alt={gadget.title}
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
                      onChange={handleFieldChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${errors.title ? 'border-red-500' : ''}`}
                    />
                    {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Short Review</label>
                    <textarea
                      name="short_review"
                      value={selectedGadget?.short_review || ''}
                      onChange={handleFieldChange}
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
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="text"
                        name="price"
                        value={selectedGadget?.price !== undefined && selectedGadget.price !== null ? String(selectedGadget.price) : ''}
                        onChange={handleFieldChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${errors.price ? 'border-red-500' : ''}`}
                      />
                      {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Buy Link 1</label>
                      <input
                        type="text"
                        name="buy_link_1"
                        value={selectedGadget?.buy_link_1 || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Buy Link 2</label>
                      <input
                        type="text"
                        name="buy_link_2"
                        value={selectedGadget?.buy_link_2 || ''}
                        onChange={handleFieldChange}
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
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Launch Announced</label>
                      <input
                        type="text"
                        name="launch_announced"
                        value={selectedGadget?.launch_announced || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Body Dimensions</label>
                      <input
                        type="text"
                        name="body_dimensions"
                        value={selectedGadget?.body_dimensions || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Display Type</label>
                      <input
                        type="text"
                        name="display_type"
                        value={selectedGadget?.display_type || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Platform OS</label>
                      <input
                        type="text"
                        name="platform_os"
                        value={selectedGadget?.platform_os || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Memory Internal</label>
                      <input
                        type="text"
                        name="memory_internal"
                        value={selectedGadget?.memory_internal || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Main Camera</label>
                      <input
                        type="text"
                        name="main_camera"
                        value={selectedGadget?.main_camera || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Main Camera Features</label>
                      <input
                        type="text"
                        name="main_camera_features"
                        value={selectedGadget?.main_camera_features || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Selfie Camera</label>
                      <input
                        type="text"
                        name="selfie_camera"
                        value={selectedGadget?.selfie_camera || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sound Loudspeaker</label>
                      <input
                        type="text"
                        name="sound_loudspeaker"
                        value={selectedGadget?.sound_loudspeaker || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Comms NFC</label>
                      <input
                        type="text"
                        name="comms_nfc"
                        value={selectedGadget?.comms_nfc || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Battery Charging</label>
                      <input
                        type="text"
                        name="battery_charging"
                        value={selectedGadget?.battery_charging || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Misc Models</label>
                      <input
                        type="text"
                        name="misc_models"
                        value={selectedGadget?.misc_models || ''}
                        onChange={handleFieldChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Image URLs (one per line)</label>
                      <textarea
                        name="image_urls"
                        value={selectedGadget?.image_urls?.join('\n') || ''}
                        onChange={handleImageUrlsChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                      {errors.image_url_0 && <p className="text-red-500 text-sm">{errors.image_url_0}</p>}
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
                            onChange={handleFieldChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Comms Bluetooth</label>
                          <input
                            type="text"
                            name="comms_bluetooth"
                            value={selectedGadget?.comms_bluetooth || ''}
                            onChange={handleFieldChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Comms Positioning</label>
                          <input
                            type="text"
                            name="comms_positioning"
                            value={selectedGadget?.comms_positioning || ''}
                            onChange={handleFieldChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Comms Radio</label>
                          <input
                            type="text"
                            name="comms_radio"
                            value={selectedGadget?.comms_radio || ''}
                            onChange={handleFieldChange}
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
                            onChange={handleFieldChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Features Sensors</label>
                          <input
                            type="text"
                            name="features_sensors"
                            value={selectedGadget?.features_sensors || ''}
                            onChange={handleFieldChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Misc Colors</label>
                          <input
                            type="text"
                            name="misc_colors"
                            value={selectedGadget?.misc_colors || ''}
                            onChange={handleFieldChange}
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
                    disabled={isSaving}
                    className={`px-4 py-2 ${isSaving ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white'} rounded hover:bg-blue-600 transition-colors`}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
              {errors.form && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md mb-4">
                  {errors.form}
                </div>
              )}
              {successMessage && (
                <div className="p-4 bg-green-50 text-green-600 rounded-md mb-4">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}