'use client';

import Layout from '../../components/Layout';
import ProductViewTracker from './ProductViewTracker';
import { Gadget } from '@/types';

export default function ProductDisplay({ gadget }: { gadget: Gadget }) {
  return (
    <Layout>
      <ProductViewTracker productId={gadget.id} />
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {gadget.title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {gadget.category}
          </p>
        </div>
        {/* Rest of the product display JSX */}
      </div>
    </Layout>
  );
}
