"use client"

import { useState } from 'react';
import ScrapeComponent from './components/ScrapeComponent';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('scrape');

  const tabs = [
    { id: 'scrape', label: 'Scrape Data' },
    { id: 'review', label: 'Review Scraped Data' },
    { id: 'gadgets', label: 'Manage Gadgets' },
    { id: 'users', label: 'Manage Users' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'scrape' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Scrape New Product Data</h2>
              <ScrapeComponent />
            </div>
          )}
          
          {activeTab === 'review' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Review Scraped Data</h2>
              {/* Will implement this component next */}
              <p className="text-gray-500">Review and approve scraped data here</p>
            </div>
          )}
          
          {activeTab === 'gadgets' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Manage Gadgets</h2>
              {/* Will implement this component next */}
              <p className="text-gray-500">View and manage existing gadgets here</p>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
              {/* Will implement this component next */}
              <p className="text-gray-500">View and manage user accounts here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}