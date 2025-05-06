import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Car, 
  MessageSquare, 
  FileEdit, 
  BarChart, 
  Settings, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Home,
  LayoutDashboard,
  ClipboardList,
  Image,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';
import { 
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
};

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if already authenticated
    const isAuth = sessionStorage.getItem('employee_authenticated') === 'true';
    const storedUsername = sessionStorage.getItem('employee_username') || '';
    setIsAuthenticated(isAuth);
    setUsername(storedUsername);
    setIsAuthenticating(false);
  }, []);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple credentials check - in a real app this would use a server API endpoint with proper authentication
    // Using a simplified approach here for demonstration
    if ((username === 'admin' && password === 'rpmauto2025') || 
        (username === 'employee' && password === 'employee2025')) {
      sessionStorage.setItem('employee_authenticated', 'true');
      sessionStorage.setItem('employee_username', username);
      setIsAuthenticated(true);
      setError('');
      toast({
        title: "Login Successful",
        description: `Welcome back, ${username}!`,
      });
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('employee_authenticated');
    sessionStorage.removeItem('employee_username');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };
  
  const navItems: NavItem[] = [
    { path: '/employee', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, description: 'Overview of dealership performance' },
    { path: '/employee/inventory', label: 'Inventory', icon: <Car className="h-5 w-5" />, description: 'Manage vehicle inventory' },
    { path: '/employee/inquiries', label: 'Inquiries', icon: <MessageSquare className="h-5 w-5" />, description: 'Customer inquiries and messages' },
    { path: '/employee/testimonials', label: 'Testimonials', icon: <FileEdit className="h-5 w-5" />, description: 'Manage customer reviews' },
    { path: '/employee/media', label: 'Media Library', icon: <Image className="h-5 w-5" />, description: 'Manage images and media files' },
    { path: '/employee/sales', label: 'Sales Records', icon: <Wallet className="h-5 w-5" />, description: 'View and manage sales records' },
    { path: '/employee/reports', label: 'Reports', icon: <ClipboardList className="h-5 w-5" />, description: 'Sales and inventory reports' },
    { path: '/employee/analytics', label: 'Analytics', icon: <BarChart className="h-5 w-5" />, description: 'Traffic and user analytics' },
    { path: '/employee/settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, description: 'System preferences and settings' },
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">RPM Auto Employee Portal</h1>
            <p className="text-gray-600">Enter your credentials to access the employee dashboard</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E31837] focus:border-[#E31837]"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E31837] focus:border-[#E31837]"
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-[#E31837] hover:bg-[#C31530]">
              Sign In
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-[#E31837] hover:underline">
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col fixed inset-y-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center">
              <img src="/logo/original/rpm_logo.png" alt="RPM Auto" className="h-10 w-auto" />
              <span className="ml-2 text-xl font-bold text-gray-900">Employee Portal</span>
            </div>
          </div>
          
          <div className="px-4 mt-6">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/assets/avatars/01.png" />
                <AvatarFallback className="bg-[#E31837] text-white">{username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900">{username}</p>
                <p className="text-xs text-gray-500">Staff Member</p>
              </div>
            </div>
          </div>
          
          <nav className="mt-6 px-3 flex-1">
            {navItems.map((item) => (
              <TooltipProvider key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      href={item.path}
                      className={`flex items-center px-3 py-2 my-1 text-sm font-medium rounded-md ${
                        location === item.path
                          ? 'bg-[#E31837]/10 text-[#E31837]'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            
            <div className="pt-4 mt-6 border-t border-gray-200">
              <Link 
                href="/"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100"
              >
                <Home className="h-5 w-5" />
                <span className="ml-3">Visit Website</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 w-full text-left mt-1"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/logo/original/rpm_logo.png" alt="RPM Auto" className="h-8 w-auto" />
          <span className="ml-2 font-bold text-gray-900">Employee Portal</span>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle className="text-left flex items-center">
                <img src="/logo/original/rpm_logo.png" alt="RPM Auto" className="h-8 w-auto mr-2" />
                Employee Portal
              </SheetTitle>
            </SheetHeader>
            <div className="px-4 py-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/assets/avatars/01.png" />
                  <AvatarFallback className="bg-[#E31837] text-white">{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">{username}</p>
                  <p className="text-xs text-gray-500">Staff Member</p>
                </div>
              </div>
            </div>
            <nav className="px-2 py-3">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center px-3 py-2 my-1 text-sm font-medium rounded-md ${
                    location === item.path
                      ? 'bg-[#E31837]/10 text-[#E31837]'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
              <div className="pt-4 mt-6 border-t border-gray-200">
                <Link 
                  href="/"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span className="ml-3">Visit Website</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 w-full text-left mt-1"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Sign Out</span>
                </button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    
      {/* Main Content */}
      <div className="flex-1 md:ml-64 lg:ml-72">
        <main className="py-6 px-4 sm:px-6 md:px-8 md:pt-4 md:pb-16 min-h-screen">
          {/* Mobile spacing for fixed header */}
          <div className="md:hidden h-14"></div>
          {children}
        </main>
      </div>
    </div>
  );
}

export default EmployeeLayout;