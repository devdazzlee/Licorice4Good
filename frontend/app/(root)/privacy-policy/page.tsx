import React from "react";
const Page = () => {
  return (
    <section className="bg-white">
      <div className="py-12 text-gray-800 layout">
        <div className="text-center mb-10">
          <h1 className="md:text-5xl text-3xl font-bold">
            Privacy <span className="text-secondary">Policy</span>
          </h1>
          <p className="mt-4 text-left">
            Landmark Foods LLC, doing business as Southern Sweet & Sour Licorice
            Ropes, a South Carolina limited liability company with its principal
            place of business at 4363 Ocean Farm Dr, Summerville, SC 29485
            (“Company,” “we,” “us,” or “our”), is committed to protecting your
            privacy. This Privacy Policy (“Policy”) explains how we collect,
            use, store, share, and protect personal information obtained through
            our website, www.licorice4good.com (“Website”), and our virtual
            fundraising and candy sales services. By accessing or using the
            Website or our services, you consent to the practices described in
            this Policy. If you do not agree, please do not use the Website or
            our services.
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
    title: "1. Scope of this Policy",
    content: [
      "1.1 This Policy Applies To All Users Of The Website, Including:",
      "(a) Registered 501(c)(3) charitable organizations (“Organizations”) participating in virtual fundraising campaigns;",
      "(b) Consumers purchasing Licorice Ropes Candy (“Products”) through the Website; and",
      "(c) Visitors browsing the Website.",
      "1.2 This Policy covers personal information, defined as any information that identifies or can be used to identify an individual, collected through the Website or our services.",
      "1.3 This Policy does not apply to information collected offline or through third-party websites linked from our Website, which may have their own privacy practices.",
    ],
  },
  {
    title: "2. Information We Collect",
    content: [
      "2.1 Information Provided by Users: We collect the following personal information:",
      "(a) From Organizations: Legal organization name, contact person’s name, phone number, mailing address, and federal tax identification number, provided during registration for fundraising campaigns.",
      "(b) From Consumers: Name, email address, phone number, mailing address, and payment information (e.g., credit card details), provided when placing an order.",
      "2.2 Automatically Collected Information: We collect usage data through cookies and similar tracking technologies, including:",
      "(a) IP address, browser type, device information, and operating system;",
      "(b) Website navigation patterns, such as pages visited and time spent; and",
      "(c) Affiliate tracking data to attribute sales to specific fundraising campaigns.",
      "2.3 Third-Party Information: We may receive information from third parties, such as Shopify (our payment processor) or affiliate marketing software providers, to facilitate order processing and commission tracking.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    content: [
      "3.1 We use personal information for the following purposes:",
      "(a) To process and fulfill consumer orders, including payment processing, shipping, and customer support;",
      "(b) To administer virtual fundraising campaigns, including verifying Organization eligibility, tracking sales, and issuing commission payments;",
      "(c) To communicate with users about orders, campaigns, or account updates (e.g., order confirmations, fundraising tips);",
      "(d) To send promotional emails or marketing materials from the Company or its affiliates, subject to applicable laws and your consent;",
      "(e) To analyze Website usage and improve our services, user experience, and marketing strategies; and",
      "(f) To comply with legal obligations, such as IRS regulations for 501(c)(3) organizations or consumer protection laws.",
      "3.2 We may use anonymized or aggregated data (which does not identify individuals) for analytics, reporting, or promotional purposes.",
    ],
  },
  {
    title: "4. Sharing Information with Third Parties",
    content: [
      "4.1 We share personal information with the following third parties:",
      "(a) Shopify: Our payment processor, which handles credit card transactions and order fulfillment.	 Shopify’s privacy practices are governed by its own privacy policy (available at www.shopify.com/legal/privacy).",
      "(b) Affiliate Marketing Software: To track sales and commissions for fundraising campaigns, ensuring accurate attribution to Organizations.",
      "(c) Service Providers: Third parties that provide services such as shipping, email marketing, or website hosting, who are contractually obligated to protect your information.",
      "4.2 We do not sell, rent, or trade your personal information to third parties for their marketing	 purposes.",
      "4.3 We may disclose information as required by law, such as to comply with a subpoena, court order, or IRS audit, or to protect the rights, safety, or property of the Company or others.",
    ],
  },
  {
    title: "5. Cookies and Tracking Technologies",
    content: [
      "5.1 We use cookies and similar technologies (e.g., web beacons, pixel tags) to:",
      "(a) Track Website usage and user preferences;",
      "(b) Facilitate affiliate sales tracking for fundraising campaigns; and",
      "(c) Personalize content and advertisements.",
      "5.2 You can manage cookie preferences through your browser settings. Disabling cookies may limit Website functionality, such as the ability to track fundraising sales or complete orders.",
      "5.3 For users in jurisdictions requiring consent (e.g., GDPR for EU residents), we will display a cookie consent banner to obtain your approval before deploying non-essential cookies.",
    ],
  },
  {
    title: "6. Data Storage and Security",
    content: [
      "6.1 We store personal information on secure servers using industry-standard encryption and security measures to protect against unauthorized access, loss, or misuse.	",
      "6.2 Payment information is processed and stored by Shopify, which complies with Payment Card Industry Data Security Standards (PCI-DSS).",
      "6.3 Despite our efforts, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information.",
    ],
  },
  {
    title: "7. Data Retention",
    content: [
      "7.1 We retain personal information for as long as necessary to fulfill the purposes outlined in this Policy, comply with legal obligations, or resolve disputes.",
      "7.2 Organization data (e.g., tax ID, contact details) is retained for at least seven (7) years to comply with IRS recordkeeping requirements for charitable fundraising.",
      "7.3 Consumer data (e.g., order details) is retained for three (3) years after the last transaction, unless a longer period is required by law.",
      "7.4 You may request deletion of your information, subject to our legal obligations (see Section 8).",
    ],
  },
  {
    title: "8. Your Rights",
    content: [
      "8.1 Depending on your jurisdiction, you may have the following rights regarding your personal information:",
      "(a) Access: Request a copy of the personal information we hold about you.",
      "(b) Correction: Request correction of inaccurate or incomplete information.",
      "(c) Deletion: Request deletion of your information, subject to legal retention requirements.",
      "(d) Opt-Out: Opt out of marketing communications by clicking “unsubscribe” in emails or contacting us.",
      "(e) Restriction or Objection: Request restriction of or object to certain uses of your information (e.g., marketing).",
      "8.2 To exercise these rights, contact us at:",
      "Landmark Foods LLC",
      "4363 Ocean Farm Dr, Summerville, SC 29485",
      "Phone: 919-701-9321",
      "8.3 We will respond to requests within thirty (30) days or as required by law (e.g., CCPA for California residents, GDPR for EU residents).",
      "8.4 For California residents, we comply with the California Consumer Privacy Act (CCPA) by providing disclosures about data collection and the right to opt out of data sales (which we do not engage in).",
    ],
  },
  {
    title: "9. Children’s Privacy",
    content: [
      "9.1 The Website and our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18.",
      "9.2 If we learn that we have collected personal information from a child under 18 without parental consent, we will delete it promptly. Contact us if you believe we have inadvertently collected such information.",
    ],
  },
  {
    title: "10. International Users",
    content: [
      "10.1 The Website is hosted in the United States and governed by U.S. law. If you access the Website from outside the U.S., your information may be transferred to and stored in the U.S., where data protection laws may differ from your jurisdiction.",
      "10.2 For EU/EEA users, we implement measures to comply with GDPR, including obtaining consent for cookies and providing clear data usage disclosures. Contact us for details on GDPR compliance.",
    ],
  },
  {
    title: "11. Third-Party Links",
    content: ["11.1 The Website may contain links to third-party websites (e.g., Shopify, social media platforms). We are not responsible for the privacy practices or content of these sites. Review their privacy policies before providing personal information."],
  },
  {
    title: "12. Changes to this Policy",
    content: [
      "12.1 We may update this Policy periodically to reflect changes in our practices or legal requirements. Updates will be posted on this page with a revised “Last Updated” date.",
      "12.2 Continued use of the Website or services after changes constitutes acceptance of the revised Policy. We encourage you to review this Policy regularly.",
    ],
  },
  {
    title: "13. Compliance with Laws",
    content: [
      "13.1 We comply with applicable data protection laws, including but not limited to the CCPA, GDPR (for EU users), and South Carolina consumer protection regulations.",
      "13.2 Organizations are responsible for ensuring their fundraising activities comply with IRS regulations for 501(c)(3) entities, including proper use and reporting of funds.",
    ],
  },
  {
    title: "14. Miscellaneous",
    content: [
      "14.1 Severability: If any provision of this Policy is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.",
      "14.2 Entire Policy: This Policy, together with the Terms and Conditions and any applicable Affiliate Agreement, constitutes the entire understanding regarding our privacy practices.",
    ],
  },
  {
    title: "15. Contact Us",
    content: [
      "15.1 For questions, concerns, or requests related to this Policy, please contact:",
      "Landmark Foods LLC",
      "4363 Ocean Farm Dr, Summerville, SC 29485",
      "Phone: 919-701-9321",
    ],
  },
];

export default Page;
