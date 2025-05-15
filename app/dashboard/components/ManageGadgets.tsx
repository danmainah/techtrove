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
                  width={50}
                  height={120}
                  className="object-cover rounded-lg"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Edit Gadget</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={selectedGadget?.title || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Short Review</label>
                <textarea
                  name="short_review"
                  value={selectedGadget?.short_review || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  name="category"
                  value={selectedGadget?.category || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Buy Link 1</label>
                <input
                  type="text"
                  name="buy_link_1"
                  value={selectedGadget?.buy_link_1 || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Buy Link 2</label>
                <input
                  type="text"
                  name="buy_link_2"
                  value={selectedGadget?.buy_link_2 || ''}
                  onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Specifications</label>
                <textarea
                  name="specifications"
                  value={JSON.stringify(selectedGadget?.specifications || {}, null, 2)}
                  onChange={(e) => {
                    const parsedValue = JSON.parse(e.target.value);
                    (e.target as HTMLTextAreaElement).value = JSON.stringify(parsedValue);
                    handleEditChange(e);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}