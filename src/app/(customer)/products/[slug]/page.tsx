import React from 'react';
import { notFound } from 'next/navigation';
import { db } from 'src/lib/db';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate dynamic SEO metadata for the product page
export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return {
      title: 'Product Not Found | Mala Phenyle Chemical Works',
    };
  }

  return {
    title: `${product.name} | Mala Phenyle Chemical Works`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Retrieve single product with categories, images, and variants
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: true,
      variants: {
        orderBy: { retailPrice: 'asc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <ProductDetailClient product={product} />
      </main>
      <Footer />
    </>
  );
}
