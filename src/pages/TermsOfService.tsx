import { useEffect } from "react";
import { setHead } from "../lib/seo";

export function TermsOfService() {
  useEffect(() => {
    setHead({
      title: "Terms of Service",
      description:
        "Terms of Service for using the 1Life Coverage Solutions website and requesting insurance quotes.",
      canonicalPath: "/terms",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Terms of Service</h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Last Updated: 12/09/2025
        </p>

        <p className="text-gray-700 mb-8">
          Welcome to 1Life Coverage Solutions. By accessing or using our website, you agree to the following 
          Terms of Service. If you do not agree, please discontinue use of this site.
        </p>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By using this website, you acknowledge that you have read, understood, and agree to be bound by 
              these Terms of Service and all applicable laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use of This Website</h2>
            <p className="text-gray-700 mb-4">
              You agree to use this site for lawful purposes only. You may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>Use the site to submit false information</li>
              <li>Attempt to access unauthorized areas</li>
              <li>Copy, reproduce, or distribute site content without written permission</li>
              <li>Interfere with the website's functionality or security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Insurance Information Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              Information provided on this website is for general informational purposes only and does not constitute:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>A binding quote</li>
              <li>A guarantee of coverage</li>
              <li>An insurance contract</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Final eligibility, rates, terms, and coverage are determined by the insurance carriers we represent 
              and are subject to underwriting approval.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. No Professional Advice</h2>
            <p className="text-gray-700 mb-4">
              Content on this website should not be considered financial, legal, or professional advice. You should 
              consult a licensed insurance professional—like us—before making insurance decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Accuracy of Information</h2>
            <p className="text-gray-700 mb-4">
              We strive to ensure all information is accurate and up to date. However, we do not guarantee that 
              all content is free from errors or omissions. We reserve the right to correct or update content at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Third-Party Links</h2>
            <p className="text-gray-700 mb-4">
              Our website may contain links to third-party websites (such as insurance carriers or state insurance 
              departments). We do not control or endorse these sites and are not responsible for their content, 
              policies, or security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy & Data Collection</h2>
            <p className="text-gray-700 mb-4">
              Any personal information submitted through this website is handled in accordance with our Privacy Policy, 
              which explains how we collect, use, and protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All text, images, branding, logos, and design elements on this site are the property of 1Life Coverage 
              Solutions and may not be used or reproduced without written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the fullest extent permitted by law, 1Life Coverage Solutions is not liable for any damages resulting from:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>Use or inability to use the website</li>
              <li>Errors or inaccuracies in content</li>
              <li>Unavailable or interrupted website service</li>
              <li>Decisions made based on website content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to update, modify, or replace these Terms of Service at any time. Changes take 
              effect immediately upon posting.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms of Service are governed by the laws of the State of Ohio, without regard to conflict-of-law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <p className="text-gray-700 font-semibold">1Life Coverage Solutions</p>
            <ul className="list-none text-gray-700 ml-4 space-y-1 mt-2">
              <li>Email: Support@1lifecoverage.com</li>
              <li>Phone: 216-455-7283</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
