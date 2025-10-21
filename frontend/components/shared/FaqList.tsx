"use client";
import { ArrowRight } from "lucide-react";
import React, { useState } from "react";

const faqs = [
  {
    question: "What Is Fundraising?",
    answer:
      "Fundraising is the process of seeking and gathering voluntary financial contributions.",
  },
  {
    question: "How can I get service ?",
    answer:
      "You can get service by contacting our support team or signing up on our website.",
  },
  {
    question: "What kind of service will I get?",
    answer:
      "We offer a variety of services tailored to your needs. Please check our services page for more details.",
  },
];

const FaqList = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-transparent p-6 rounded-lg w-full max-w-md">
      {faqs.map((faq, i) => (
        <div key={faq.question} className="relative">
          <button
            className="flex items-center justify-between w-full py-6 focus:outline-none"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
            aria-controls={`faq-answer-${i}`}
          >
            <span className="text-white text-lg md:text-xl font-inter text-left">
              {faq.question}
            </span>
            <ArrowRight
              className={`text-white text-2xl transition-transform ${
                openIndex === i ? "rotate-90" : ""
              }`}
            />
          </button>
          {openIndex === i && (
            <div
              id={`faq-answer-${i}`}
              className="text-white/90 text-base md:text-lg font-inter mt-2 mb-4 px-2 animate-fade-in"
            >
              {faq.answer}
            </div>
          )}
          {i < faqs.length - 1 && (
            <hr className="absolute left-0 right-0 border-t border-white/50 mt-0" />
          )}
        </div>
      ))}
    </div>
  );
};

export default FaqList;
