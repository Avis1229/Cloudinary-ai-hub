"use client";

import React, { useState } from 'react';

const faqs = [
  {
    question: "How long does shipping typically take?",
    answer: "We typically process orders within 24–48 hours. Once shipped, orders are usually delivered within 3–7 business days across India, depending on your location and courier availability."
  },
  {
    question: "What makes your ingredients special?",
    answer: "We carefully select ingredients that have been trusted in traditional skincare for generations. Reetha and Multani Mitti were chosen for their natural cleansing and purifying properties, helping us create formulations that are simple, effective, and rooted in nature."
  },
  {
    question: "Need help selecting a product?",
    answer: "We're here to help. Contact us through email or WhatsApp, and our team will assist you in choosing the product that best fits your skincare needs."
  },
  {
    question: "Can I return my AETHRAVIA products?",
    answer: "For hygiene and safety reasons, AETHRAVIA accepts returns only on unopened and unused products within 14 days of delivery. In case of a damaged or incorrect item, our concierge team will be happy to assist you."
  }
];

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="group cursor-pointer" onClick={() => toggle(idx)}>
            <div className={`flex justify-between items-center pb-4 border-b transition-colors ${isOpen ? 'border-primary' : 'border-outline-variant/50 group-hover:border-primary'}`}>
              <h4 className={`text-lg font-headline transition-colors ${isOpen ? 'text-primary' : 'text-on-surface'}`}>
                {faq.question}
              </h4>
              <span 
                className="material-symbols-outlined text-secondary transition-all duration-300"
                style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
              >
                add
              </span>
            </div>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-4 mb-6' : 'max-h-0 opacity-0 m-0'}`}
            >
              <p className="text-secondary font-body leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
