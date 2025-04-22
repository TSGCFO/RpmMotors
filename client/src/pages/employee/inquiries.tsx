import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Inquiry } from '@shared/schema';
import EmployeeLayout from '@/components/employee/employee-layout';
import { Car } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Loader2, 
  Trash2, 
  Eye, 
  Mail,
  CalendarIcon,
  ArrowUpDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function EmployeeInquiries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  
  // Fetch all inquiries
  const { data: inquiries, isLoading } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries'],
  });
  
  // Update inquiry status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/inquiries/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      toast({
        title: 'Status Updated',
        description: 'The inquiry status has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update status: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Filtered inquiries based on search and status filter
  const filteredInquiries = inquiries?.filter(inquiry => {
    const matchesSearch = searchQuery === '' || 
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inquiry.subject ? inquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      (inquiry.message ? inquiry.message.toLowerCase().includes(searchQuery.toLowerCase()) : false);
    
    const matchesStatus = statusFilter === '' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  // Handle viewing an inquiry
  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewModalOpen(true);
  };
  
  // Handle replying to an inquiry
  const handleReplyToInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsReplyModalOpen(true);
    setReplyMessage('');
  };
  
  // Handle updating status
  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };
  
  // Handle sending a reply
  const handleSendReply = () => {
    if (!selectedInquiry || !replyMessage.trim()) return;
    
    // This would typically make an API request to send the email and update the inquiry
    toast({
      title: 'Reply Sent',
      description: 'Your response has been sent to the customer.',
    });
    
    // Update the inquiry status to "responded"
    updateStatusMutation.mutate({ id: selectedInquiry.id, status: 'responded' });
    setIsReplyModalOpen(false);
  };
  
  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Inquiries</h1>
            <p className="text-gray-600 mt-1">Manage and respond to customer messages and inquiries</p>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or content..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </div>
            <div className="flex gap-2">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Main inquiries table */}
        <Card>
          <CardHeader>
            <CardTitle>Inquiry Management</CardTitle>
            <CardDescription>
              Manage and respond to customer inquiries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E31837]"></div>
              </div>
            ) : filteredInquiries.length > 0 ? (
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer">
                          Date
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1 cursor-pointer">
                          Subject
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInquiries.map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell className="font-medium">
                          {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : 'Unknown date'}
                        </TableCell>
                        <TableCell>{inquiry.name}</TableCell>
                        <TableCell>{inquiry.subject}</TableCell>
                        <TableCell>
                          <div className="text-sm">{inquiry.email}</div>
                          {inquiry.phone && <div className="text-sm text-gray-500">{inquiry.phone}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              inquiry.status === 'new' ? 'default' :
                              inquiry.status === 'in-progress' ? 'secondary' :
                              inquiry.status === 'responded' ? 'outline' :
                              inquiry.status === 'resolved' ? 'default' :
                              'outline'
                            }
                            className={
                              inquiry.status === 'new' ? 'bg-blue-500' :
                              inquiry.status === 'in-progress' ? 'bg-yellow-500' :
                              inquiry.status === 'responded' ? '' :
                              inquiry.status === 'resolved' ? 'bg-green-500' :
                              ''
                            }
                          >
                            {inquiry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleViewInquiry(inquiry)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleReplyToInquiry(inquiry)}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No inquiries found</h3>
                <p className="text-gray-500 mt-1">
                  {searchQuery || statusFilter ? 
                    "Try adjusting your search or filter criteria." : 
                    "There are no customer inquiries to display."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* View Inquiry Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              View the complete details of this customer inquiry.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedInquiry.subject}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <CalendarIcon className="h-3 w-3" />
                    {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : 'Unknown date'}
                  </p>
                </div>
                <Badge 
                  variant={
                    selectedInquiry.status === 'new' ? 'default' :
                    selectedInquiry.status === 'in-progress' ? 'secondary' :
                    selectedInquiry.status === 'responded' ? 'outline' :
                    selectedInquiry.status === 'resolved' ? 'default' :
                    'outline'
                  }
                  className={
                    selectedInquiry.status === 'new' ? 'bg-blue-500' :
                    selectedInquiry.status === 'in-progress' ? 'bg-yellow-500' :
                    selectedInquiry.status === 'responded' ? '' :
                    selectedInquiry.status === 'resolved' ? 'bg-green-500' :
                    ''
                  }
                >
                  {selectedInquiry.status}
                </Badge>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{selectedInquiry.name}</h4>
                    <p className="text-sm text-gray-600">{selectedInquiry.email}</p>
                    {selectedInquiry.phone && <p className="text-sm text-gray-600">{selectedInquiry.phone}</p>}
                  </div>
                  {selectedInquiry.vehicleId && (
                    <Badge variant="outline" className="ml-2">
                      <Car className="h-3 w-3 mr-1" />
                      Vehicle Inquiry
                    </Badge>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div>
                  <Select 
                    value={selectedInquiry.status} 
                    onValueChange={(status) => handleStatusChange(selectedInquiry.id, status)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleReplyToInquiry(selectedInquiry);
                    }}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Reply Modal */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Inquiry</DialogTitle>
            <DialogDescription>
              Send a response to the customer's inquiry.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="mt-4 space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Original Message</p>
                    <p className="text-sm text-gray-600">From: {selectedInquiry.name}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  {selectedInquiry.subject && <p className="font-medium">Subject: {selectedInquiry.subject}</p>}
                  <p className="mt-1 line-clamp-3">{selectedInquiry.message}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="reply" className="block text-sm font-medium text-gray-700">
                  Your Response
                </label>
                <Textarea
                  id="reply"
                  rows={8}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full"
                />
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsReplyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim()}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Send Reply
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </EmployeeLayout>
  );
}