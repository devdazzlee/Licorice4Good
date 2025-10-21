"use client"
import React from "react";
const Page = () => {
  return (
    <section className="bg-white">
      <div className="py-12 text-gray-800 layout">
        <div className="text-center mb-10">
          <h1 className="md:text-5xl text-3xl font-bold">
            Terms <span className="text-secondary">Conditions</span>
          </h1>
          <p className="mt-4 text-left">
            Welcome to www.licorice4good.com (“Website”), owned and operated by
            Landmark Foods LLC, doing business as Southern Sweet & Sour Licorice
            Ropes, a South Carolina limited liability company with its principal
            place of business at 4363 Ocean Farm Dr, Summerville, SC 29485
            (“Company,” “we,” “us,” or “our”). These Terms and Conditions
            (“Terms”) govern your access to and use of the Website,
            participation in our virtual fundraising campaigns, and purchase of
            Licorice Ropes Candy products (“Products”). By accessing the
            Website, registering as a fundraising organization, or placing an
            order, you agree to be bound by these Terms, our Privacy Policy, and
            any applicable Affiliate Agreement. If you do not agree, please
            refrain from using the Website or our services.
          </p>
        </div>

        {sections.map(({ title, content }, i) => (
          <div key={i} className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            {content.map((para, j) => (
              <p key={j} className="text-sm mb-2">
                {para}
              </p>
            ))}
          </div>
        ))}

        <div className="text-sm">
          <p className="font-semibold">15. Contact Us</p>
          <p>
            If You Have Questions, Concerns, Or Requests Related To This Policy,
            Please Contact:
            <br />
            Landmark Foods LLC
            <br />
            4383 Gadsden Farm Dr, Summerville, SC 29485
            <br />
            Phone: 910-701-9321
          </p>
        </div>
      </div>
    </section>
  );
};

const sections = [
  {
    title: "1. Description of Services",
    content: [
      "1.1 The Company provides a virtual fundraising platform that enables registered 501(c)(3) charitable organizations (“Organizations”) to raise funds through the sale of Licorice Ropes Candy in 3, 4, 7, or 12 packs (no mixing or matching of flavors).",
      "1.2 For Organizations, we provide a digital media kit with promotional materials and best practice guidelines to support fundraising campaigns. At the Organization’s request, we may provide a box of individually packaged Product samples, based on the number of expected participants, if the campaign is scheduled at least one (1) month in advance. Campaigns scheduled with at least three (3) days’ notice will not include samples.",
      "1.3 Consumers may purchase Products directly through the Website to support fundraising campaigns or for personal use.",
      "1.4 The Company reserves the right to modify, suspend, or discontinue any aspect of the Website or services at any time, with or without notice, at its sole discretion",
    ],
  },
  {
    title: "2. Eligibility Requirementst",
    content: [
        "2.1 Organizations: To participate in a fundraising campaign, an Organization must:",
        "(a) Be a registered 501(c)(3) charitable organization under the Internal Revenue Code, in good standing;",
        "(b) Provide its legal name, federal tax identification number, contact person’s name, phone number, and mailing address; and",
        "(c) Agree to use funds raised for lawful purposes aligned with its charitable mission.",
        "2.2 Consumers: To place an order, a consumer must:",
        "(a) Be at least 18 years of age;",
        "(b) Provide accurate contact and payment information; and",
        "(c) Comply with these Terms and applicable laws.",
        "2.3 The Company may verify an Organization’s 501(c)(3) status through IRS records or other reliable sources. We reserve the right to refuse service to any user who fails to meet eligibility requirements or provides false information.",
    ],
  },
  {
    title: "3. Payment, Refunds, and Delivery",
    content: [
        "3.1 Payment: All transactions are processed through Shopify’s secure payment platform. We accept major credit cards, including Visa, Mastercard, American Express, and Discover. Payment is required at the time of order placement.",
        "3.2 Refunds and Exchanges: We offer a one-time exchange policy. If you are unsatisfied with your order, you may exchange it for a similar Product of the same quantity within fourteen (14) days of delivery, subject to availability. Contact us at 919-701-9321 to initiate an exchange. No cash refunds will be provided.",
        "3.3 Delivery: Shipping costs are calculated at checkout and excluded from fundraising commissions. Tracking information will be provided for all orders. Delivery times vary based on location and carrier. The Company is not liable for delays caused by carriers, incorrect shipping information, or events beyond our control.",
        "3.4 Taxes: Applicable sales taxes are added to orders as required by law and are the responsibility of the consumer.",
    ],
  },
  {
    title: "4. Fundraising Campaigns",
    content: [
      "4.1 Organizations participating in fundraising campaigns will receive 50% of gross sales (excluding shipping and taxes) as a commission, paid by check mailed to the Organization’s registered address within fourteen (14) days of campaign completion.",
      "4.2 The Company provides tracking information for commission payments. We are not responsible for lost or stolen checks, provided delivery is confirmed.",
      "4.3 Fundraising success depends on the Organization’s marketing efforts and consumer engagement. The Company makes no representations or warranties regarding the amount of funds raised.",
      "4.4 Organizations are solely responsible for complying with IRS regulations and state laws governing charitable fundraising, including maintaining accurate records of funds received and their use.",
    ],
  },
  {
    title: "5. User Responsibilities",
    content: [
      "5.1 Organizations: You agree to:",
      "(a) Provide accurate and verifiable eligibility information;",
      "(b) Use Company-provided media kits and adhere to marketing guidelines;",
      "(c) Conduct fundraising activities in a lawful, ethical, and professional manner; and",
      "(d) Maintain compliance with all applicable laws, including IRS 501(c)(3) requirements.",
      "5.2 Consumers: You agree to:",
      "(a) Provide accurate contact and payment information;",
      "(b) Review Product nutrition facts and ingredient information before consumption; and",
      "(c) Use the Website in accordance with these Terms.",
      "5.3 All users agree not to:",
      "(a) Engage in fraudulent, deceptive, or unlawful activities;",
      "(b) Attempt to disrupt, hack, or interfere with the Website’s functionality or security; or",
      "(c) Misuse the Company’s intellectual property or services",
      ],
  },
  {
    title: "6. Intellectual Property",
    content: [
      "6.1 All content on the Website, including text, graphics, logos, media kits, and promotional materials, is owned by the Company or its licensors and protected by copyright, trademark, and other intellectual property laws.",
      "6.2 Organizations are granted a limited, non-exclusive, non-transferable license to use the Company’s media kit solely for promoting their fundraising campaign. Unauthorized use, reproduction, or modification is prohibited.",
      "6.3 Users may not use the Company’s trademarks, including “Southern Sweet & Sour Licorice Ropes,” without prior written consent.",
      "6.4 Feedback, reviews, or testimonials provided by users may be used by the Company for promotional purposes, provided no personally identifiable information is disclosed without consent."
    ],
  },
  {
    title: "7. Third-Party Services",
    content: [
      "7.1 The Website integrates with third-party services, such as Shopify for payment processing and affiliate marketing software for tracking sales. These services are governed by their own terms and privacy policies, which users should review.",
      "7.2 The Company is not responsible for the performance, availability, or practices of third-party services, including delays or errors in payment processing or affiliate tracking"
    ],
  },
  {
    title: "8. Warranty Disclaimers",
    content: [
      "8.1 The Website and services are provided “as is” and “as available” without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.",
      "8.2 The Company does not warrant that the Website will be uninterrupted, error-free, or free from viruses or other harmful components.",
      "8.3 No warranty is provided regarding the amount of funds an Organization will raise or the suitability of Products for specific dietary needs. Consumers are responsible for reviewing nutrition and ingredient information."
    ],
  },
  {
    title: "9. Limitation of Liability",
    content: [
      "9.1 Product Liability: The Company’s liability for Product-related issues (e.g., quality, safety) is limited to the purchase price of the Product. Consumers assume responsibility for reviewing nutrition facts and ingredient information. The Company is not liable for allergic reactions or health-related issues, except as required by law.",
      "9.2 Fundraising Liability: The Company is not liable for fundraising shortfalls or the Organization’s use of funds. Organizations are responsible for ensuring compliance with IRS and state regulations.",
      "9.3 Website Liability: The Company is not liable for any direct, indirect, incidental, consequential, or punitive damages arising from Website use, including but not limited to lost profits, data loss, or business interruption.",
      "9.4 The Company’s total liability under these Terms shall not exceed the amount paid by a consumer for Products or the commissions earned by an Organization."
    ],
  },
  {
    title: "10. Indemnification",
    content: [
      "10.1 Users agree to indemnify, defend, and hold harmless the Company, its officers, directors,	 employees, and agents from any claims, liabilities, damages, or expenses (including reasonable attorneys’ fees) arising from:",
      "(a) Violation of these Terms;",
      "(b) Misuse of the Website, services, or intellectual property;",
      "(c) Misrepresentation of eligibility or charitable status; or",
      "(d) Violation of applicable laws, including IRS regulations.",
      "10.2 The Company reserves the right to assume control of the defense of any claim for which it is entitled to indemnification, at the user’s expense."
    ],
  },
  {
    title: "11. Governing Law and Jurisdiction",
    content: [
      "11.1 These Terms are governed by and construed in accordance with the laws of the State of South Carolina, without regard to conflict of law principles.",
      "11.2 Any legal action arising from these Terms shall be brought exclusively in the state or federal courts located in Dorchester County, South Carolina, and users consent to the jurisdiction of such courts.",
    ],
  },
  {
    title: "12. Termination and Suspension",
    content: [
      "12.1 The Company may suspend or terminate a user’s access to the Website or services at its sole discretion, with or without notice, for reasons including violation of these Terms, suspected fraud, or non-compliance with eligibility requirements.",
      "12.2 Upon termination, users must cease all use of the Website and services. Provisions related to intellectual property, limitation of liability, indemnification, and governing law shall survive termination",
    ],
  },
  {
    title: "13. Modifications to Terms",
    content: [
      "13.1 The Company may update these Terms at any time. Changes will be posted on this page with an updated “Last Updated” date. Continued use of the Website or services after changes constitutes acceptance of the revised Terms.",
      "13.2 Users are responsible for reviewing these Terms periodically to stay informed of updates.",
    ],
  },
  {
    title: "14. Force Majeure",
    content: [
      "The Company is not liable for failure to perform its obligations due to events beyond its reasonable control, including but not limited to natural disasters, technical failures, or disruptions in third-party services (e.g., Shopify, shipping carriers)."
      ],
  },
  {
    title: "15. Miscellaneous",
    content: [
      "15.1 Severability: If any provision of these Terms is found invalid or unenforceable, the remaining provisions remain in full force and effect.",
      "15.2 No Waiver: The Company’s failure to enforce any provision does not constitute a waiver of such provision.",
      "15.3 Entire Agreement: These Terms, together with the Privacy Policy and any applicable Affiliate Agreement, constitute the entire agreement between the user and the Company regarding the Website and services."
    ],
  },
  {
    title: "16. Contact Information",
    content:[
      "For questions, concerns, or requests related to these Terms, contact:",
      "Landmark Foods LLC",
      "4363 Ocean Farm Dr, Summerville, SC 29485",
      "Phone: 919-701-9321"
    ]
  }
];

export default Page;
