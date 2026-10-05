import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Shipping Policy | Aethravia',
  description: 'Shipping Policy for Aethravia',
};

export default function ShippingPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto prose prose-stone text-secondary font-body font-light leading-loose">
          <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-primary mb-12 uppercase underline underline-offset-8 decoration-1">Shipping Policy</h1>

          <p>This Shipping Policy outlines the shipping terms and conditions applicable to orders placed through <a href="https://aethravia.com/" className="text-primary hover:underline">https://aethravia.com/</a>. By placing an order with us, you agree to the terms outlined below.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">1. SHIPPING CHARGES</h2>
          <p>We offer:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Free shipping on all prepaid orders above ₹349 across India.</li>
            <li>A shipping fee of ₹49 will be charged on orders below ₹349.</li>
          </ul>
          <p className="mt-4">Shipping charges, if applicable, will be displayed at checkout before payment is completed.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">2. ORDER PROCESSING</h2>
          
          <h3 className="text-xl font-headline text-primary mt-8 mb-2">ORDER CUT-OFF TIME</h3>
          <p>Orders placed before 2:00 PM IST (GMT+05:30) on business days are processed on the same day. Orders placed after the cut-off time will be processed on the next business day.</p>

          <h3 className="text-xl font-headline text-primary mt-8 mb-2">HANDLING TIME</h3>
          <p>All orders are processed within 1–3 business days (Monday to Saturday, excluding public holidays).</p>

          <h3 className="text-xl font-headline text-primary mt-8 mb-2">TRANSIT TIME</h3>
          <p>Estimated transit time after dispatch is 3–7 business days, depending on the delivery location.</p>

          <h3 className="text-xl font-headline text-primary mt-8 mb-2">TOTAL DELIVERY TIME</h3>
          <p>Total Delivery Time = Handling Time + Transit Time</p>
          <p>Estimated delivery time for most orders is 4–10 business days.</p>
          <p className="mt-4 italic">Please note that delivery timelines are estimates and may vary due to courier delays, weather conditions, public holidays, remote locations, or other circumstances beyond our control.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">3. SHIPPING LOCATIONS</h2>
          <p>Currently, Aethravia ships only within India.</p>
          <p>We do not offer international shipping at this time.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">4. ORDER TRACKING</h2>
          <p>Once your order has been dispatched, tracking information will be shared via email, SMS, or WhatsApp (where applicable). Customers can use the provided tracking details to monitor their shipment status.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">5. DELIVERY ISSUES</h2>
          <p>If you encounter any issues with your delivery, please contact our support team immediately for assistance.</p>
        </div>
      </main>
    </div>
  );
}
