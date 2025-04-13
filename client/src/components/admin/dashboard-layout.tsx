import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Car, Users, BarChart, Settings, FileEdit, MessageSquare, 
  LogOut, ShieldCheck, Menu, X, Home
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check if already authenticated
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    setIsAuthenticated(isAuth);
    setIsAuthenticating(false);
  }, []);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password authentication (in a real app, this would be server-side)
    if (password === 'rpmauto2025') {
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password. Please try again.');
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <BarChart className="h-5 w-5" /> },
    { path: '/admin/inventory', label: 'Inventory', icon: <Car className="h-5 w-5" /> },
    { path: '/admin/inquiries', label: 'Inquiries', icon: <MessageSquare className="h-5 w-5" /> },
    { path: '/admin/testimonials', label: 'Testimonials', icon: <FileEdit className="h-5 w-5" /> },
    { path: '/admin/marketing', label: 'Marketing', icon: <Users className="h-5 w-5" /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <BarChart className="h-5 w-5" /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];
  
  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E31837]"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 shadow-lg rounded-lg max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Enter your password to access the admin dashboard</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-[#E31837] text-white py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E31837]"
            >
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/">
              <a className="text-[#E31837] hover:underline text-sm">
                Return to Website
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white z-30 px-4 py-3 shadow">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <a className="text-xl font-bold text-[#E31837]">RPM Admin</a>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-20 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="relative bg-white h-full w-64 pt-14 flex flex-col">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Admin Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pb-4">
            <nav className="px-2 py-4 space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      location === item.path
                        ? "bg-[#E31837] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </a>
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t">
                <Link href="/">
                  <a className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <Home className="h-5 w-5" />
                    <span className="ml-3">Back to Website</span>
                  </a>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Log Out</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Desktop layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white h-screen shadow-md fixed">
          <div className="p-4 border-b">
            <Link href="/admin">
              <a className="flex items-center">
                <ShieldCheck className="h-6 w-6 text-[#E31837]" />
                <span className="ml-2 text-xl font-bold text-gray-900">RPM Admin</span>
              </a>
            </Link>
          </div>
          <nav className="px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location === item.path
                      ? "bg-[#E31837] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </a>
              </Link>
            ))}
            
            <div className="pt-6 mt-6 border-t">
              <Link href="/">
                <a className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  <Home className="h-5 w-5" />
                  <span className="ml-3">Back to Website</span>
                </a>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Log Out</span>
              </button>
            </div>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}