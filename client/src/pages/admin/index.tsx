import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import PageMeta from '@/components/seo/page-meta';
import CanonicalUrl from '@/components/seo/canonical-url';

export default function AdminDashboard() {
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
    { label: "Admin", href: "/admin", current: true }
  ];
  
  if (showLogin && !isAuthorized) {
    return (
      <main className="py-12 bg-[#F5F5F5] min-h-screen">
        <PageMeta
          title="Admin Dashboard | RPM Auto"
          description="Admin dashboard for RPM Auto administrators."
          keywords="admin, dashboard"
        />
        <CanonicalUrl path="/admin" />
        
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
        title="Admin Dashboard | RPM Auto"
        description="Admin dashboard for RPM Auto administrators."
        keywords="admin, dashboard"
      />
      <CanonicalUrl path="/admin" />
      
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
          <h1 className="text-3xl font-['Poppins'] font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your website and view analytics.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Analytics Card */}
          <Link href="/admin/analytics">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-['Poppins'] font-semibold">Analytics</h2>
                <span className="text-[#E31837] text-2xl">
                  <i className="fas fa-chart-bar"></i>
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                View user analytics, vehicle interest data, and marketing campaign effectiveness.
              </p>
              <div className="flex justify-end">
                <span className="text-[#E31837] flex items-center">
                  View Analytics <i className="fas fa-arrow-right ml-2"></i>
                </span>
              </div>
            </div>
          </Link>
          
          {/* A/B Testing Card */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-['Poppins'] font-semibold">A/B Testing</h2>
              <span className="text-[#E31837] text-2xl">
                <i className="fas fa-vial"></i>
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              Configure A/B tests to optimize page layouts and conversion rates.
            </p>
            <div className="flex justify-end">
              <span className="text-gray-400 flex items-center">
                Coming Soon <i className="fas fa-lock ml-2"></i>
              </span>
            </div>
          </div>
          
          {/* Marketing Card */}
          <Link href="/admin/marketing">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-['Poppins'] font-semibold">Marketing</h2>
                <span className="text-[#E31837] text-2xl">
                  <i className="fas fa-bullhorn"></i>
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                Generate UTM-tagged links and track effectiveness of marketing campaigns.
              </p>
              <div className="flex justify-end">
                <span className="text-[#E31837] flex items-center">
                  View Marketing Tools <i className="fas fa-arrow-right ml-2"></i>
                </span>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-['Poppins'] font-semibold mb-6">Business Benefits of Cookie Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-['Poppins'] font-semibold mb-3">Analytics & Insights</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Understand which vehicles generate the most interest</li>
                <li>Track user navigation patterns through the site</li>
                <li>Identify the most effective entry points and exit pages</li>
                <li>Measure user engagement with different sections</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-['Poppins'] font-semibold mb-3">Targeted Content</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Personalize recommendations based on browsing history</li>
                <li>Display vehicles similar to those previously viewed</li>
                <li>Adapt content based on user preferences and interests</li>
                <li>Highlight popular vehicles to new visitors</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-['Poppins'] font-semibold mb-3">Marketing Effectiveness</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Track which marketing campaigns drive conversions</li>
                <li>Identify the most valuable traffic sources</li>
                <li>Measure ROI on different advertising channels</li>
                <li>Optimize ad spend based on performance data</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-['Poppins'] font-semibold mb-3">A/B Testing</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Test different layouts to see which performs better</li>
                <li>Compare conversion rates between variants</li>
                <li>Optimize calls-to-action and key user flows</li>
                <li>Make data-driven decisions for website improvements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}