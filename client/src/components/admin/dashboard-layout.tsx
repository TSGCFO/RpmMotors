import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Car, Users, BarChart, Settings, FileEdit, MessageSquare, 
  LogOut, ShieldCheck, Menu, X, Home, Calculator
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Verify session against the server. The cookie is httpOnly + signed,
    // so the client cannot spoof admin access by setting sessionStorage.
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.role === 'admin') {
            setIsAuthenticated(true);
          }
        }
      } catch {
        // ignore network errors — user will see the login screen
      } finally {
        if (!cancelled) setIsAuthenticating(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { data: appraisalsList } = useQuery<{ offerRequestCount7d?: number }>({
    queryKey: ['/api/admin/appraisals', 'admin-badge'],
    queryFn: async () => {
      const res = await fetch('/api/admin/appraisals?limit=1', { credentials: 'include' });
      if (!res.ok) return { offerRequestCount7d: 0 };
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  const offerBadge = appraisalsList?.offerRequestCount7d ?? 0;
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.authenticated && data.role === 'admin') {
        setIsAuthenticated(true);
        setPassword('');
      } else if (res.ok && data.authenticated) {
        setError('Access denied. Admin role required.');
      } else {
        setError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    }
  };
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsAuthenticated(false);
  };
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <BarChart className="h-5 w-5" />, badge: 0 },
    { path: '/admin/inventory', label: 'Inventory', icon: <Car className="h-5 w-5" />, badge: 0 },
    { path: '/admin/inquiries', label: 'Inquiries', icon: <MessageSquare className="h-5 w-5" />, badge: 0 },
    { path: '/admin/appraisals', label: 'Appraisals', icon: <Calculator className="h-5 w-5" />, badge: offerBadge },
    { path: '/admin/testimonials', label: 'Testimonials', icon: <FileEdit className="h-5 w-5" />, badge: 0 },
    { path: '/admin/marketing', label: 'Marketing', icon: <Users className="h-5 w-5" />, badge: 0 },
    { path: '/admin/analytics', label: 'Analytics', icon: <BarChart className="h-5 w-5" />, badge: 0 },
    { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, badge: 0 },
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
            <p className="text-gray-600">Sign in to access the admin dashboard</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4" data-testid="text-login-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                required
                data-testid="input-admin-username"
              />
            </div>
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
                data-testid="input-admin-password"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-[#E31837] text-white py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E31837]"
              data-testid="button-admin-login"
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
  
  const renderBadge = (badge: number) =>
    badge > 0 ? (
      <span className="ml-auto inline-flex items-center justify-center rounded-full bg-[#E31837] px-2 py-0.5 text-xs font-bold text-white">
        {badge}
      </span>
    ) : null;

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
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                    {renderBadge(item.badge)}
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
                  data-testid={`nav-admin-${item.path.replace(/\//g, '-')}`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                  {renderBadge(item.badge)}
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
        
        <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
