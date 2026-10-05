import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Aethravia',
  description: 'Terms and Conditions of Heuk Care Private Limited for Aethravia',
};

export default function TermsPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto prose prose-stone text-secondary font-body font-light leading-loose">
          <h1 className="text-4xl md:text-5xl font-headline tracking-tight text-primary mb-2">Terms and Conditions</h1>
          <p className="font-bold text-sm uppercase tracking-widest text-primary/60 mb-12">Heuk Care Private Limited</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">1. Introduction and Acceptance of Terms</h2>
          <p>Welcome to Aethravia, an e-commerce platform operated by Heuk Care Private Limited ("we," "us," "our," or the "Company"). These Terms and Conditions ("Terms," "Agreement") constitute a legally binding agreement between you ("you," "your," or "User") and Heuk Care Private Limited governing your access to and use of the Aethravia web platform ("Platform," "Service," "Website").</p>
          <p>By accessing, browsing, or using the Aethravia Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and all applicable laws and regulations. If you do not agree with these Terms in their entirety, you must immediately discontinue use of the Platform and refrain from accessing our Service.</p>
          <p>These Terms apply to all users of the Platform, including but not limited to browsers, vendors, customers, merchants, and contributors of content. You acknowledge that these Terms may be modified from time to time, and your continued use of the Platform following any such modifications constitutes your acceptance of the revised Terms.</p>
          <p>We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders at our sole discretion, particularly in cases where we believe there has been a violation of these Terms, fraudulent activity, or any conduct that we deem harmful to other users, our business operations, or third parties.</p>

          <h2 className="text-2xl font-headline text-primary mt-12 mb-6">2. Eligibility and Account Registration</h2>
          
          <h3 className="text-xl font-headline text-primary mt-8 mb-4">2.1 Age Requirements</h3>
          <p>The Aethravia Platform is intended for use by individuals who are at least eighteen (18) years of age or the age of majority in their jurisdiction, whichever is greater. By using the Platform, you represent and warrant that you meet these age requirements. If you are under the required age, you may only use the Platform under the supervision of a parent or legal guardian who agrees to be bound by these Terms.</p>
          <p>Parents and legal guardians who permit minors to use the Platform are fully responsible for the minor's use of the Platform, including all financial charges and legal liability incurred through such use. We reserve the right to request proof of age at any time, and failure to provide such proof may result in immediate suspension or termination of your account.</p>

          <h3 className="text-xl font-headline text-primary mt-8 mb-4">2.2 Account Creation and Security</h3>
          <p>To access certain features of the Platform, including making purchases, you must create an account by providing accurate, current, and complete information as prompted by the registration form. You agree to maintain and promptly update your account information to keep it accurate, current, and complete at all times.</p>
        </div>
      </main>
    </div>
  );
}
