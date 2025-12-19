import { useEffect } from "react";
import { setHead } from "../lib/seo";

export function Compliance() {
  useEffect(() => {
    setHead({
      title: "Legal & Compliance",
      description:
        "Compliance information, privacy commitments, and licensing details for 1Life Coverage Solutions.",
      canonicalPath: "/compliance",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Legal & Compliance</h1>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <p className="text-gray-700 mb-4">
              1Life Coverage Solutions operates in full compliance with all applicable state and federal insurance 
              regulations. Our agency and agents are licensed to sell insurance in the State of Ohio. Coverage, 
              product availability, and carrier offerings may vary based on underwriting guidelines and state regulations.
            </p>
            <p className="text-gray-700 mb-4">
              All quotes provided through this website are subject to underwriting approval and are not a guarantee 
              of coverage until a policy is issued.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy & Data Protection</h2>
            <p className="text-gray-700 mb-4">
              We are committed to protecting your personal information. Any data collected through this website—whether 
              through forms, quote requests, or communication tools—is used strictly for providing insurance services. 
              We follow all applicable privacy laws related to the collection, use, and safeguarding of your information.
            </p>
            <p className="text-gray-700 mb-4">
              For full details on how your data is handled, please review our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use of Website</h2>
            <p className="text-gray-700 mb-4">
              Information on this website is for informational and educational purposes only and should not be 
              interpreted as a binding offer of insurance. Final terms, rates, and eligibility are determined by the carrier.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">License Verification</h2>
            <p className="text-gray-700 mb-4">
              You may verify our active Ohio insurance licenses by visiting the{" "}
              <a 
                href="https://insurance.ohio.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Ohio Department of Insurance website
              </a>.
            </p>
            <ul className="list-none text-gray-700 ml-4 space-y-2">
              <li>Melissa Lynn Moore NPN: 2999065</li>
              <li>Anne Marie Glorioso NPN: 2334391</li>
            </ul>
          </section>

          <p className="text-sm text-gray-600 mt-12">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
