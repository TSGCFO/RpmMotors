import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Vehicle, Inquiry, Testimonial } from '@shared/schema';
import { EmployeeLayout } from '@/components/employee/employee-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Car, 
  MessageSquare, 
  FileEdit, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  BadgeCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function EmployeeDashboard() {
  // Fetch all vehicles, including sold ones
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles?includeAll=true'],
  });
  
  // Fetch all inquiries
  const { data: inquiries, isLoading: isLoadingInquiries } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries'],
  });
  
  // Fetch all testimonials
  const { data: testimonials, isLoading: isLoadingTestimonials } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });
  
  // Fetch inventory stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/vehicles/stats'],
  });
  
  // Check if all data is loading
  const isLoading = isLoadingVehicles || isLoadingInquiries || isLoadingTestimonials || isLoadingStats;
  
  // Calculate statistics if data is available
  const totalVehicles = vehicles?.length || 0;
  const featuredVehicles = vehicles?.filter(v => v.isFeatured).length || 0;
  const totalInquiries = inquiries?.length || 0;
  const newInquiries = inquiries?.filter(i => i.status === 'new').length || 0;
  const totalTestimonials = testimonials?.length || 0;
  const pendingTestimonials = testimonials?.filter(t => !t.isApproved).length || 0;
  
  // Get recent inquiries and vehicles
  const recentInquiries = inquiries?.slice(0, 5) || [];
  const recentVehicles = vehicles?.slice(0, 5) || [];

  // Get recent activity (combine latest actions)
  type ActivityItem = {
    id: string;
    type: 'vehicle' | 'inquiry' | 'testimonial';
    title: string;
    timestamp: Date;
    status?: string;
  };

  const recentActivity: ActivityItem[] = [
    ...(vehicles?.map(vehicle => ({
      id: `vehicle-${vehicle.id}`,
      type: 'vehicle' as const,
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      timestamp: new Date(vehicle.createdAt),
    })) || []),
    ...(inquiries?.map(inquiry => ({
      id: `inquiry-${inquiry.id}`,
      type: 'inquiry' as const,
      title: inquiry.subject,
      timestamp: new Date(inquiry.createdAt),
      status: inquiry.status
    })) || []),
    ...(testimonials?.map(testimonial => ({
      id: `testimonial-${testimonial.id}`,
      type: 'testimonial' as const,
      title: `Review for ${testimonial.vehicle}`,
      timestamp: new Date(testimonial.createdAt),
      status: testimonial.isApproved ? 'approved' : 'pending'
    })) || [])
  ]
  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  .slice(0, 8);
  
  // Calculate inventory value if data is available
  const inventoryValue = vehicles?.reduce((total, vehicle) => total + vehicle.price, 0) || 0;

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your RPM Auto employee portal</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31837]"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
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
                    {newInquiries} new inquiries
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Testimonials</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{totalTestimonials}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <FileEdit className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {pendingTestimonials} pending approval
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ${inventoryValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Average: ${Math.round(inventoryValue / totalVehicles).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Link 
                href="/employee/inventory"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <Car className="h-8 w-8 text-[#E31837] mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Inventory</span>
              </Link>
              
              <Link 
                href="/employee/inquiries"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <MessageSquare className="h-8 w-8 text-[#E31837] mb-2" />
                <span className="text-sm font-medium text-gray-900">View Inquiries</span>
              </Link>
              
              <Link 
                href="/employee/testimonials"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <FileEdit className="h-8 w-8 text-[#E31837] mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Testimonials</span>
              </Link>
              
              <Link 
                href="/employee/reports"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <TrendingUp className="h-8 w-8 text-[#E31837] mb-2" />
                <span className="text-sm font-medium text-gray-900">View Reports</span>
              </Link>
            </div>
            
            {/* Recent Activity & Latest Vehicles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start">
                        <div className="p-2 rounded-full bg-gray-100 mr-3">
                          {activity.type === 'vehicle' && <Car className="h-4 w-4 text-gray-600" />}
                          {activity.type === 'inquiry' && <MessageSquare className="h-4 w-4 text-gray-600" />}
                          {activity.type === 'testimonial' && <FileEdit className="h-4 w-4 text-gray-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Intl.DateTimeFormat('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).format(activity.timestamp)}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 capitalize flex items-center">
                            <span>{activity.type}</span>
                            {activity.status && (
                              <Badge variant={
                                activity.status === 'new' || activity.status === 'pending' 
                                  ? 'outline' 
                                  : activity.status === 'approved' 
                                    ? 'secondary' 
                                    : 'secondary'
                              } className="ml-2">
                                {activity.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link 
                    href="/employee/activity"
                    className="text-sm text-[#E31837] font-medium hover:underline"
                  >
                    View All Activity
                  </Link>
                </CardFooter>
              </Card>
              
              {/* Latest Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Latest Inventory</CardTitle>
                  <CardDescription>Recently added vehicles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentVehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-start">
                        <div className="h-14 w-14 rounded-md bg-gray-100 mr-3 overflow-hidden flex-shrink-0">
                          {vehicle.images && vehicle.images.length > 0 ? (
                            <img 
                              src={typeof vehicle.images[0] === 'string' ? vehicle.images[0] : ''} 
                              alt={`${vehicle.make} ${vehicle.model}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Car className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-sm font-semibold">${vehicle.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center mt-1">
                            <p className="text-xs text-gray-500 mr-3">
                              {vehicle.mileage.toLocaleString()} miles
                            </p>
                            <p className="text-xs text-gray-500">
                              {vehicle.transmission}
                            </p>
                            {vehicle.isFeatured && (
                              <Badge className="ml-2 bg-[#E31837]">
                                <BadgeCheck className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link 
                    href="/employee/inventory"
                    className="text-sm text-[#E31837] font-medium hover:underline"
                  >
                    View All Vehicles
                  </Link>
                </CardFooter>
              </Card>
            </div>
            
            {/* Inquiries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Inquiries</CardTitle>
                <CardDescription>Customer messages requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {recentInquiries.length > 0 ? (
                    recentInquiries.map((inquiry) => (
                      <div key={inquiry.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium">{inquiry.name}</span>
                              <Badge 
                                variant={inquiry.status === 'new' ? 'default' : 'outline'} 
                                className="ml-2"
                              >
                                {inquiry.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{inquiry.subject}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {inquiry.email} · {inquiry.phone || 'No phone'}
                            </p>
                          </div>
                          <div>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      No inquiries found.
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/employee/inquiries"
                  className="text-sm text-[#E31837] font-medium hover:underline"
                >
                  View All Inquiries
                </Link>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </EmployeeLayout>
  );
}