import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import UTMGenerator from '@/components/admin/utm-generator';
import PageMeta from '@/components/seo/page-meta';
import CanonicalUrl from '@/components/seo/canonical-url';

export default function AdminMarketing() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(true);
  
  // Simple admin password
  const ADMIN_PASSWORD = 'rpmauto2025';
  
  // Check if user is logged in
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_auth');
    if (adminAuth === 'true') {
      setIsAuthorized(true);
      setShowLogin(false);
    }
  }, []);
  
  // Handle login
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_auth', 'true');
      setIsAuthorized(true);
      setShowLogin(false);
    } else {
      alert('Invalid password');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthorized(false);
    setLocation('/');
  };
  
  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Admin", href: "/admin" },
    { label: "Marketing", href: "/admin/marketing", current: true }
  ];
  
  if (showLogin && !isAuthorized) {
    return (
      <main className="py-12 bg-[#F5F5F5] min-h-screen">
        <PageMeta
          title="Admin Marketing | RPM Auto"
          description="Marketing tools for RPM Auto administrators."
          keywords="admin, marketing, UTM, tracking"
        />
        <CanonicalUrl path="/admin/marketing" />
        
        <div className="container mx-auto px-6">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-['Poppins'] font-bold mb-6 text-center">Admin Login</h1>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="py-12 bg-[#F5F5F5] min-h-screen">
      <PageMeta
        title="Admin Marketing | RPM Auto"
        description="Marketing tools for RPM Auto administrators."
        keywords="admin, marketing, UTM, tracking"
      />
      <CanonicalUrl path="/admin/marketing" />
      
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <Breadcrumb items={breadcrumbItems} />
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-['Poppins'] font-bold">Marketing Tools</h1>
          <p className="text-gray-600 mt-2">
            Create and track marketing campaigns with these tools.
          </p>
        </div>
        
        <UTMGenerator />
        
        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-['Poppins'] font-semibold mb-6">Marketing Analytics</h2>
          
          <div className="bg-[#F5F5F5] p-6 rounded-lg text-center">
            <p className="text-gray-600">
              Marketing campaign analytics will be available here soon.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This feature is currently under development.
            </p>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-['Poppins'] font-semibold mb-4">About Marketing Cookies</h3>
            <p className="text-gray-600 mb-4">
              Cookies enable powerful marketing capabilities by tracking user behavior and campaign effectiveness:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div>
                <h4 className="font-['Poppins'] font-semibold mb-3">Traffic Source Tracking</h4>
                <p className="text-gray-600">
                  Cookies help identify where visitors are coming from, whether it's social media, search engines, email campaigns, or direct visits. This information helps allocate marketing resources effectively.
                </p>
              </div>
              
              <div>
                <h4 className="font-['Poppins'] font-semibold mb-3">Campaign Performance</h4>
                <p className="text-gray-600">
                  By tracking UTM parameters in cookies, you can measure which specific campaigns, ads, and keywords drive the most valuable traffic to your website.
                </p>
              </div>
              
              <div>
                <h4 className="font-['Poppins'] font-semibold mb-3">Conversion Path Analysis</h4>
                <p className="text-gray-600">
                  Cookies help track the entire customer journey from first visit to inquiry or sale, showing which marketing touchpoints influenced the conversion.
                </p>
              </div>
              
              <div>
                <h4 className="font-['Poppins'] font-semibold mb-3">Retargeting</h4>
                <p className="text-gray-600">
                  When users visit specific vehicle pages, cookies enable targeted advertising to show them similar vehicles when they browse other websites or social media.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}