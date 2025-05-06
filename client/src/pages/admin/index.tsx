import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import DashboardLayout from '@/components/admin/dashboard-layout';
import { Vehicle, Inquiry, Testimonial } from '@shared/schema';
import { Car, MessageSquare, FileEdit, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  // Fetch all vehicles
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });
  
  // Fetch all inquiries
  const { data: inquiries, isLoading: isLoadingInquiries } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries'],
  });
  
  // Fetch all testimonials
  const { data: testimonials, isLoading: isLoadingTestimonials } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });
  
  // Check if all data is loading
  const isLoading = isLoadingVehicles || isLoadingInquiries || isLoadingTestimonials;
  
  // Calculate statistics
  const totalVehicles = vehicles?.length || 0;
  const featuredVehicles = vehicles?.filter(v => v.isFeatured).length || 0;
  const totalInquiries = inquiries?.length || 0;
  const pendingInquiries = inquiries?.filter(i => i.status === 'pending').length || 0;
  const totalTestimonials = testimonials?.length || 0;
  const approvedTestimonials = testimonials?.filter(t => t.isApproved).length || 0;
  
  // Calculate inventory value
  const inventoryValue = vehicles?.reduce((total, vehicle) => total + vehicle.price, 0) || 0;
  
  // Get recent inquiries and vehicles
  const recentInquiries = inquiries?.slice(0, 5) || [];
  const recentVehicles = vehicles?.slice(0, 5) || [];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your RPM Auto admin dashboard</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalVehicles}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {featuredVehicles} featured vehicles
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalInquiries}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {pendingInquiries} pending responses
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Testimonials</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalTestimonials}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FileEdit className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {approvedTestimonials} approved testimonials
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(inventoryValue)}</p>
              </div>
              <div className="p-3 bg-[#ffe4e4] rounded-full">
                <DollarSign className="h-6 w-6 text-[#E31837]" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total value of all vehicles
            </p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link href="/admin/inventory-manager">
              <a className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <Car className="h-8 w-8 text-[#E31837] mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Inventory</span>
              </a>
            </Link>
            
            <Link href="/admin/inquiries">
              <a className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <MessageSquare className="h-8 w-8 text-[#E31837] mb-2" />
                <span className="text-sm font-medium text-gray-900">View Inquiries</span>
              </a>
            </Link>
            
            <Link href="/admin/testimonials">
              <a className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <FileEdit className="h-8 w-8 text-[#E31837] mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Testimonials</span>
              </a>
            </Link>
            
            <Link href="/admin/analytics">
              <a className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <TrendingUp className="h-8 w-8 text-[#E31837] mb-2" />
                <span className="text-sm font-medium text-gray-900">View Analytics</span>
              </a>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Inquiries */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Recent Inquiries</h2>
            </div>
            <div className="divide-y">
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E31837]"></div>
                </div>
              ) : recentInquiries.length > 0 ? (
                recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-900">{inquiry.name}</p>
                      <span className={`px-2 text-xs font-semibold rounded-full ${
                        inquiry.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : inquiry.status === 'responded'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {inquiry.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) : 'New'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm truncate mt-1">{inquiry.message}</p>
                    <div className="flex items-center text-gray-500 text-xs mt-2">
                      <span>{inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : 'N/A'}</span>
                      <span className="mx-2">•</span>
                      <span>{inquiry.email}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No inquiries found.
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50">
              <Link href="/admin/inquiries">
                <a className="text-sm text-[#E31837] font-medium hover:underline">
                  View All Inquiries
                </a>
              </Link>
            </div>
          </div>
          
          {/* Recent Vehicle Listings */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Recent Vehicles</h2>
            </div>
            <div className="divide-y">
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E31837]"></div>
                </div>
              ) : recentVehicles.length > 0 ? (
                recentVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-4 hover:bg-gray-50">
                    <div className="flex">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-md object-cover"
                          src={vehicle.images[0] || '/placeholders/placeholder-car.svg'}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/placeholders/placeholder-car.svg';
                          }}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-900">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <p className="font-semibold text-[#E31837]">
                            {formatCurrency(vehicle.price)}
                          </p>
                        </div>
                        <div className="flex items-center text-gray-500 text-xs mt-2">
                          <span>{vehicle.condition}</span>
                          <span className="mx-2">•</span>
                          <span>{vehicle.category}</span>
                          <span className="mx-2">•</span>
                          <span>{vehicle.mileage.toLocaleString()} miles</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No vehicles found.
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50">
              <Link href="/admin/inventory-manager">
                <a className="text-sm text-[#E31837] font-medium hover:underline">
                  View All Vehicles
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}