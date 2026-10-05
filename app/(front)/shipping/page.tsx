import { Metadata } from 'next';
import React from 'react';
import Form from './Form';

export const metadata: Metadata = {
  title: 'Shipping | Checkout | Aethravia',
  description: 'Enter your shipping address',
};

export default function ShippingPage() {
  return (
    <div>
      <Form />
    </div>
  );
}
