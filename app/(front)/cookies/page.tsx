import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Cookie Policy | Aethravia',
  description: 'Cookie Policy of Heuk Care Private Limited for Aethravia',
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto prose prose-stone text-secondary font-body font-light leading-loose">
          <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-primary mb-2">Cookie Policy</h1>
          <p className="font-bold text-sm uppercase tracking-widest text-primary/60 mb-12">Heuk Care Private Limited</p>

          <p>This Cookie Policy explains how Heuk Care Private Limited ("we," "us," or "our") uses cookies and similar tracking technologies on the Aethravia e-commerce platform ("Platform," "Service," or "Aethravia"). This policy provides you with clear and comprehensive information about the cookies we use, why we use them, and how you can control them.</p>
          <p>By accessing or using Aethravia, you acknowledge that you have read and understood this Cookie Policy. If you do not agree with our practices, please do not use our Platform.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">1. Contact Information</h2>
          <p>If you have any questions or concerns about our use of cookies or this Cookie Policy, please contact us at:</p>
          <p>
            <strong>Heuk Care Private Limited</strong><br/>
            Email: aethravia@gmail.com
          </p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">2. What Are Cookies</h2>
          <p>Cookies are small text files that are placed on your computer, smartphone, or other device when you visit a website. Cookies are widely used by website owners to make their websites function efficiently, improve user experience, and provide reporting information.</p>
          <p>Cookies set by the website owner (in this case, Heuk Care Private Limited) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website, such as analytics, advertising, and interactive content.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">3. Similar Technologies</h2>
          <p>In addition to cookies, we may use other similar technologies on our Platform, including:</p>
          <ul className="list-disc pl-6 space-y-4">
            <li><strong>Web Beacons:</strong> Small graphic images (also known as "pixel tags" or "clear GIFs") that may be included on our Platform and in our emails to track user behavior and measure the effectiveness of our communications.</li>
            <li><strong>Local Storage:</strong> Technologies such as HTML5 local storage and IndexedDB that allow data to be stored locally on your browser or device.</li>
            <li><strong>Session Storage:</strong> Similar to local storage but is cleared when you close your browser session.</li>
            <li><strong>Device Fingerprinting:</strong> The process of analyzing and combining sets of information elements from your device's configuration to identify or recognize your device.</li>
            <li><strong>Software Development Kits (SDKs):</strong> Code packages that enable data collection and analysis within our Platform.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
