import { fetchGadgetById } from '@/app/dashboard/_actions';
import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';

// Using a type that Next.js will recognize for dynamic route params
type ProductPageParams = {
  id: string;
};

// The page component with proper typing
export default async function Page({ params }: { params: ProductPageParams }) {
  const gadgetData = await fetchGadgetById(params.id);
  
  if (!gadgetData) {
    notFound();
  }
  
  return <ProductClient gadgetData={gadgetData} productId={params.id} />;
}