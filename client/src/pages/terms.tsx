import PageMeta from "@/components/seo/page-meta";
import CanonicalUrl from "@/components/seo/canonical-url";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function Terms() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Terms & Conditions", href: "/terms", current: true }
  ];

  return (
    <main className="bg-[#F5F5F5] py-12 min-h-screen">
      {/* SEO Components */}
      <PageMeta
        title="Terms & Conditions | RPM Auto"
        description="The terms and conditions governing your use of RPM Auto's website and services. Learn about our policies regarding vehicle purchases, financing, and more."
        keywords="terms and conditions, legal terms, user agreement, RPM Auto terms"
        canonical="https://rpmauto.com/terms"
      />
      <CanonicalUrl path="/terms" />
      
      <div className="container mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-['Poppins'] font-bold mb-8">Terms & Conditions</h1>
          
          <div className="prose max-w-none">
            <p>
              Welcome to the RPM Auto website. By accessing or using our website, you agree to be bound by these 
              Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our website.
            </p>
            
            <h2>Website Use</h2>
            <p>
              The content on our website is for general information purposes only. It is subject to change without notice. 
              We do not guarantee that our website, or any content on it, will be free from errors or omissions.
            </p>
            <p>
              You may use our website only for lawful purposes and in accordance with these Terms and Conditions. 
              You agree not to:
            </p>
            <ul>
              <li>Use our website in any way that violates any applicable federal, provincial, or local law</li>
              <li>Use our website to transmit or send any unauthorized advertising or promotional material</li>
              <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of our website</li>
              <li>Use any robot, spider, or other automatic device to access or monitor our website</li>
            </ul>
            
            <h2>Vehicle Information</h2>
            <p>
              While we strive to provide accurate information about our vehicles, we do not warrant that the vehicle 
              descriptions, prices, or availability information is error-free. All vehicle prices are subject to change 
              without notice and do not include applicable taxes, fees, and finance charges.
            </p>
            <p>
              Vehicle images shown on our website may not represent the actual vehicle for sale and are for illustration 
              purposes only. Please contact us to confirm vehicle details before making a purchase decision.
            </p>
            
            <h2>Test Drives and Vehicle Purchases</h2>
            <p>
              Test drives are subject to appointment availability and verification of a valid driver's license. 
              We reserve the right to refuse a test drive at our discretion.
            </p>
            <p>
              All vehicle sales are subject to our sales agreements. Vehicles are sold "as is" unless covered by 
              an express written warranty provided at the time of sale.
            </p>
            
            <h2>Financing and Credit Applications</h2>
            <p>
              Submission of a credit application does not guarantee approval for financing. All financing is subject 
              to credit approval by our financing partners. Interest rates and terms vary based on credit history 
              and other factors.
            </p>
            
            <h2>Intellectual Property</h2>
            <p>
              Our website and its content, including logos, images, text, and design, are the property of RPM Auto 
              and are protected by copyright and other intellectual property laws. You may not reproduce, distribute, 
              modify, or create derivative works of our content without our express written permission.
            </p>
            
            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, RPM Auto shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages arising out of or related to your use of our website 
              or services.
            </p>
            
            <h2>Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless RPM Auto and its officers, directors, employees, and agents 
              from any claims, liabilities, damages, losses, and expenses arising out of or related to your use 
              of our website or services.
            </p>
            
            <h2>Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the 
              Province of Ontario, without regard to its conflict of law provisions.
            </p>
            
            <h2>Changes to These Terms</h2>
            <p>
              We may update these Terms and Conditions from time to time. We will notify you of any changes 
              by posting the new Terms and Conditions on this page and updating the "Last Updated" date below.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p>
              RPM Auto<br />
              6260 Hwy 7 Unit 6<br />
              Woodbridge, ON L4H 4G3<br />
              Email: legal@rpmauto.com<br />
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