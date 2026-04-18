import { Suspense } from 'react';
import CartClient from './CartClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CartPage() {
  return (
    <Suspense fallback={<CartLoading />}>
      <CartClient />
    </Suspense>
  );
}

function CartLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      <Footer />
    </div>
  );
}
