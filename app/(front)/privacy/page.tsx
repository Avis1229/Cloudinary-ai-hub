import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Aethravia',
  description: 'Privacy Policy of Heuk Care Pvt. Ltd for Aethravia',
};

export default function PrivacyPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto prose prose-stone text-secondary font-body font-light leading-loose">
          <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-primary mb-2">Privacy Policy</h1>
          <p className="font-bold text-sm uppercase tracking-widest text-primary/60 mb-8">Heuk Care Pvt. Ltd</p>
          
          <p><strong>Effective Date:</strong> May 8, 2026<br/>
          <strong>Last Updated:</strong> May 8, 2026</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">1. Introduction</h2>
          <p>Welcome to Aethravia ("we," "our," "us," or the "Service"). This Privacy Policy is provided by Heuk Care Pvt. Ltd., operating the Aethravia e-commerce platform. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, store, and protect information that we receive from users of our web-based e-commerce platform.</p>
          <p>By accessing or using Aethravia, you acknowledge that you have read, understood, and agree to be bound by the terms of this Privacy Policy. If you do not agree with any part of this Privacy Policy, please do not use our Service. This Privacy Policy applies to all users worldwide and has been designed to comply with major international privacy regulations including the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), Personal Information Protection and Electronic Documents Act (PIPEDA), and other applicable privacy laws globally.</p>
          <p>We reserve the right to update or modify this Privacy Policy at any time. Any changes will be effective immediately upon posting the updated Privacy Policy on our platform. Your continued use of the Service after any such changes constitutes your acceptance of the new Privacy Policy.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">2. Information We Collect</h2>
          <p>We collect various types of information in connection with the services we provide, including:</p>
          
          <h3 className="text-xl font-headline text-primary mt-8 mb-4">2.1 Personal Information You Provide</h3>
          <p>When you register for an account, make a purchase, or interact with our Service, we may collect the following personal information that you voluntarily provide:</p>
          <ul className="list-disc pl-6 space-y-4">
            <li><strong>Name:</strong> Your full name or preferred name for account identification and order processing.</li>
            <li><strong>Email Address:</strong> Your email address for account creation, communication, order confirmations, and marketing purposes (with your consent).</li>
            <li><strong>Phone Number:</strong> Your telephone number for order updates, delivery coordination, customer support, and account security.</li>
            <li><strong>Purchase History:</strong> Records of products you have viewed, added to cart, purchased, returned, or reviewed, including transaction details, payment methods used (not including full payment card details), and order dates.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
