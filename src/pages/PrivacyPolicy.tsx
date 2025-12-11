export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Privacy Policy</h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <p className="text-gray-700 mb-8">
          At 1Life Coverage Solutions, we are committed to protecting your privacy and safeguarding your personal 
          information. This Privacy Policy explains how we collect, use, disclose, and protect your information when 
          you visit our website or use our services.
        </p>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
            <p className="text-gray-700 mb-4">
              When you request a quote or contact us, we may collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>Name, address, email address, and phone number</li>
              <li>Date of birth and Social Security number (for underwriting purposes)</li>
              <li>Driver's license information and driving history</li>
              <li>Vehicle information (make, model, VIN)</li>
              <li>Property information (address, construction details)</li>
              <li>Insurance history and claims information</li>
              <li>Financial information for payment processing</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Automatically Collected Information</h3>
            <p className="text-gray-700 mb-4">
              When you visit our website, we automatically collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>Provide insurance quotes and policy recommendations</li>
              <li>Process insurance applications and bind coverage</li>
              <li>Communicate with you about your policies and services</li>
              <li>Process payments and manage billing</li>
              <li>Handle claims and provide customer support</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Improve our website and services</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Detect and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We may share your information with:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Insurance Carriers</h3>
            <p className="text-gray-700 mb-4">
              We share your information with insurance companies to obtain quotes and bind coverage on your behalf.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Providers</h3>
            <p className="text-gray-700 mb-4">
              We may share information with third-party service providers who assist us with:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>Payment processing</li>
              <li>Data analytics and website optimization</li>
              <li>Marketing and communication services</li>
              <li>Technology and hosting services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Legal Requirements</h3>
            <p className="text-gray-700 mb-4">
              We may disclose information when required by law, court order, or government regulation, or to protect 
              our rights, property, or safety.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Business Transfers</h3>
            <p className="text-gray-700 mb-4">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the 
              acquiring entity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Secure servers and firewalls</li>
              <li>Access controls and authentication procedures</li>
              <li>Regular security assessments and updates</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-gray-700 mt-4">
              While we strive to protect your information, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Personalize content and advertisements</li>
              <li>Improve website functionality</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You can control cookies through your browser settings, but disabling cookies may limit website functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information (subject to legal obligations)</li>
              <li>Object to or restrict certain processing activities</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your information in a portable format</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>Provide our services and maintain your policies</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain business records</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Websites</h2>
            <p className="text-gray-700 mb-4">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices 
              of these external sites. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. California Privacy Rights</h2>
            <p className="text-gray-700 mb-4">
              California residents have additional rights under the California Consumer Privacy Act (CCPA), including 
              the right to know what personal information is collected, sold, or disclosed, and the right to opt-out 
              of the sale of personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
              We will post the updated policy on our website with a revised "Last Updated" date. Your continued use of 
              our services after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, 
              please contact us:
            </p>
            <p className="text-gray-700 font-semibold">1Life Coverage Solutions</p>
            <ul className="list-none text-gray-700 ml-4 space-y-1 mt-2">
              <li>Email: privacy@1lifecoverage.com</li>
              <li>Phone: 216-455-7283</li>
              <li>Address: [Your Company Address]</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Gramm-Leach-Bliley Act Notice</h2>
            <p className="text-gray-700 mb-4">
              As required by federal law, we provide this notice about our privacy practices and how we protect your 
              nonpublic personal information. We do not sell your personal information to third parties. Information 
              is shared only as necessary to provide insurance services and as permitted or required by law.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
