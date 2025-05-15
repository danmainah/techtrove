"use client"

import { useEffect, useState } from 'react';    
import { useSession } from 'next-auth/react';
import { fetchScrapedData, approveScrapedData, deleteScrapedData } from '../_actions';

type Gadget = {
  id: string;
  created_at: string;
  title: string;
  category: string;
  specifications: Record<string, string>;
  image_urls: string[];
  status: 'pending' | 'approved';
  source_url: string;
  short_review?: string;
  buy_link_1?: string;
  buy_link_2?: string;
};

export default function ReviewScrapped() {
  const { data: session } = useSession();
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const [editableGadgets, setEditableGadgets] = useState<Gadget[]>([]);

  useEffect(() => {
    const fetched = async () => {
      try {
        const gadgets = await fetchScrapedData();
        setGadgets(gadgets);
        setEditableGadgets(gadgets);
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
      await approveScrapedData(id, editableGadgets.find(g => g.id === id));
      setGadgets(gadgets.map(g => g.id === id ? {...g, status: 'approved'} : g));
      setEditableGadgets(editableGadgets.map(g => g.id === id ? {...g, status: 'approved'} : g));
    } catch (error) {
      console.error('Error approving gadget: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const updateSpecKey = (id: string, oldKey: string, newKey: string) => {
    setEditableGadgets(editableGadgets.map(g => 
      g.id === id ? {
        ...g,
        specifications: Object.fromEntries(
          Object.entries(g.specifications).map(([k, v]) => 
            k === oldKey ? [newKey, v] : [k, v]
          )
        )
      } : g
    ));
  };

  const updateSpecValue = (id: string, key: string, newValue: string) => {
    setEditableGadgets(editableGadgets.map(g => 
      g.id === id ? {
        ...g,
        specifications: { ...g.specifications, [key]: newValue }
      } : g
    ));
  };

  const updateField = (id: string, field: keyof Gadget, value: string) => {
    setEditableGadgets(editableGadgets.map(g =>
      g.id === id ? { ...g, [field]: value } : g
    ));
  };

  if (loading) return <div>Loading gadgets...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Reviews ({gadgets.filter(g => g.status === 'pending').length})</h3>
      
      {editableGadgets.map(gadget => (
        <div key={gadget.id} className="border p-4 rounded-lg">
          <div className="flex gap-4 mb-4">
            {gadget.image_urls.map((url, i) => (
              <img 
                key={i}
                src={url} 
                alt={gadget.title}
                className="w-24 h-24 object-cover rounded"
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
            {Object.entries(gadget.specifications).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <div className="w-full">
                  <label htmlFor={`spec-key-${key}`} className="block text-xs text-gray-500 mb-1">Spec Key</label>
                  <input
                    id={`spec-key-${key}`}
                    value={key}
                    onChange={(e) => updateSpecKey(gadget.id, key, e.target.value)}
                    className="border p-1 rounded w-full"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor={`spec-value-${key}`} className="block text-xs text-gray-500 mb-1">Spec Value</label>
                  <input
                    id={`spec-value-${key}`}
                    value={value}
                    onChange={(e) => updateSpecValue(gadget.id, key, e.target.value)}
                    className="border p-1 rounded w-full"
                  />
                </div>
              </div>
            ))}
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
