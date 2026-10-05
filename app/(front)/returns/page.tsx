import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Returns & Refund Policy | Aethravia',
  description: 'Returns and Refund Policy for Aethravia',
};

export default function ReturnsPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto prose prose-stone text-secondary font-body font-light leading-loose">
          <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-primary mb-12 uppercase underline underline-offset-8 decoration-1">RETURN, REFUND & CANCELLATION</h1>

          <p>Thank you for shopping with Aethravia. We strive to provide high-quality skincare products and ensure customer satisfaction. Please read our Return & Refund Policy carefully before making a purchase.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">1. OVERVIEW</h2>
          <p>This Return & Refund Policy applies to all purchases made through <a href="https://aethravia.com/" className="text-primary hover:underline">https://aethravia.com</a>.</p>
          <p>By placing an order on our website, you agree to the terms outlined in this policy.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">2. ORDER CANCELLATION</h2>
          <p>Orders may be cancelled only before they are dispatched from our warehouse.</p>
          <p>Once an order has been shipped, it cannot be cancelled.</p>
          <p>To request a cancellation, please contact us as soon as possible at <strong>aethravia@gmail.com</strong> with your order details.</p>
          <p>If the order has not been dispatched, the full amount paid will be refunded to the original payment method.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">3. RETURNS</h2>
          <p>Due to the personal care and hygiene nature of our skincare products, we do not accept returns for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Opened products</li>
            <li>Used products</li>
            <li>Products with damaged or missing original packaging</li>
            <li>Products purchased during promotional sales, clearance sales, or special offers</li>
          </ul>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">4. DAMAGED, DEFECTIVE, OR INCORRECT PRODUCTS</h2>
          <p>We will gladly provide a replacement or refund if:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You receive a damaged product</li>
            <li>You receive a defective product</li>
            <li>You receive the wrong item</li>
          </ul>
          <p className="mt-4">To be eligible, you must contact us within 48 hours of delivery and provide:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Order number</li>
            <li>Clear photographs of the product</li>
            <li>Clear photographs of the outer packaging</li>
          </ul>
          <p className="mt-4">After verification, we may offer a replacement, store credit, or refund at our discretion.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">5. REFUNDS</h2>
          <p>Once a refund request is approved, the refund will be processed to the original payment method used during purchase.</p>
          <p>Refund processing times may vary depending on your payment provider, but generally take 5–10 business days after approval.</p>
          <p>Shipping charges, if any, are non-refundable unless the return is due to an error on our part.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">6. EXCHANGES</h2>
          <p>We currently do not offer exchanges.</p>
          <p>If you received a damaged, defective, or incorrect item, please contact us and we will assist you with a replacement where applicable.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">7. REFUSAL OF RETURNS</h2>
          <p>Aethravia reserves the right to refuse any return or refund request that does not comply with this policy.</p>
        </div>
      </main>
    </div>
  );
}
