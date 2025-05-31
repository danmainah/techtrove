"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-teal-600 text-cyan-50 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <Link href="/" className="text-2xl font-bold hover:text-teal-200 transition-colors">
          Tech Trove
        </Link>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 px-4 rounded-lg text-white-500 font-medium placeholder:text-gray-500 placeholder:font-medium border-2 border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </nav>
  );
}
