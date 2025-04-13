import PageMeta from "@/components/seo/page-meta";
import CanonicalUrl from "@/components/seo/canonical-url";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function PrivacyPolicy() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Privacy Policy", href: "/privacy-policy", current: true }
  ];

  return (
    <main className="bg-[#F5F5F5] py-12 min-h-screen">
      {/* SEO Components */}
      <PageMeta
        title="Privacy Policy | RPM Auto"
        description="RPM Auto's privacy policy explains how we collect, use, and protect your personal information when you visit our website or do business with us."
        keywords="privacy policy, data protection, personal information, RPM Auto privacy"
        canonical="https://rpmauto.com/privacy-policy"
      />
      <CanonicalUrl path="/privacy-policy" />
      
      <div className="container mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-['Poppins'] font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p>
              This Privacy Policy describes how RPM Auto ("we," "us," or "our") collects, uses, and shares your personal information 
              when you visit our website, use our services, or otherwise interact with us.
            </p>
            
            <h2>Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as when you fill out a contact form, 
              request information about vehicles, apply for financing, or communicate with us via email or phone.
            </p>
            <p>
              The types of personal information we may collect include:
            </p>
            <ul>
              <li>Name, email address, phone number, and mailing address</li>
              <li>Vehicle preferences and purchase history</li>
              <li>Employment and income information if you apply for financing</li>
              <li>Information about your vehicle if you request service</li>
              <li>Any other information you choose to provide</li>
            </ul>
            
            <h2>How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Comply with legal obligations</li>
              <li>Protect against fraud and unauthorized transactions</li>
            </ul>
            
            <h2>Information Sharing</h2>
            <p>
              We may share your personal information with:
            </p>
            <ul>
              <li>Service providers who perform services on our behalf</li>
              <li>Financial institutions and lenders if you apply for financing</li>
              <li>Vehicle manufacturers for warranty or recall purposes</li>
              <li>Professional advisors, such as lawyers, auditors, and insurers</li>
              <li>Government authorities if required by law</li>
            </ul>
            
            <h2>Your Rights and Choices</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, 
              such as the right to access, correct, or delete your data. To exercise these rights, please 
              contact us using the information provided below.
            </p>
            
            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, 
              no method of transmission over the Internet or electronic storage is 100% secure, so we 
              cannot guarantee absolute security.
            </p>
            
            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last Updated" date below.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              RPM Auto<br />
              6260 Hwy 7 Unit 6<br />
              Woodbridge, ON L4H 4G3<br />
              Email: privacy@rpmauto.com<br />
              Phone: (905) 264-1969
            </p>
            
            <p className="mt-8 text-sm text-gray-600">
              Last Updated: April 13, 2025
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}