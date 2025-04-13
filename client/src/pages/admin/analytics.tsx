import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import AnalyticsDashboard from '@/components/admin/analytics-dashboard';
import PageMeta from '@/components/seo/page-meta';
import CanonicalUrl from '@/components/seo/canonical-url';
import { hasConsentedToCookies } from '@/lib/cookieUtils';

export default function AdminAnalytics() {
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
    { label: "Analytics", href: "/admin/analytics", current: true }
  ];
  
  if (!hasConsentedToCookies()) {
    return (
      <main className="py-12 bg-[#F5F5F5] min-h-screen">
        <div className="container mx-auto px-6">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-[#E31837] mb-4">
              <i className="fas fa-cookie-bite text-5xl"></i>
            </div>
            <h1 className="text-3xl font-['Poppins'] font-bold mb-4">Cookie Consent Required</h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Analytics data requires cookie consent. Please accept cookies in the banner at the bottom of the page to view this dashboard.
            </p>
          </div>
        </div>
      </main>
    );
  }
  
  if (showLogin && !isAuthorized) {
    return (
      <main className="py-12 bg-[#F5F5F5] min-h-screen">
        <PageMeta
          title="Admin Analytics | RPM Auto"
          description="Analytics dashboard for RPM Auto administrators."
          keywords="admin, analytics, dashboard"
        />
        <CanonicalUrl path="/admin/analytics" />
        
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
        title="Admin Analytics | RPM Auto"
        description="Analytics dashboard for RPM Auto administrators."
        keywords="admin, analytics, dashboard"
      />
      <CanonicalUrl path="/admin/analytics" />
      
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
          <h1 className="text-3xl font-['Poppins'] font-bold">Admin Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            View insights about user behavior and vehicle interest.
          </p>
        </div>
        
        <AnalyticsDashboard />
      </div>
    </main>
  );
}