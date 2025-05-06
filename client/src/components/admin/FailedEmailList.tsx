import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
// Define the Inquiry interface locally to avoid path issues
interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  vehicleId: number | null;
  status: string;
  createdAt: string;
}

export function FailedEmailList() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch all inquiries with email failures
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/inquiries'],
    select: (data: Inquiry[]) => data.filter(inquiry => 
      inquiry.status === 'email-failed' || inquiry.status === 'email-error'
    ),
  });

  // Handle retry email
  const handleRetryEmail = async (inquiryId: number) => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}/retry-email`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Invalidate the inquiries cache to refresh the data
        // queryClient.invalidateQueries(['/api/inquiries']);
        alert('Email retry requested. Check server logs for results.');
      } else {
        alert('Failed to retry sending email. Please try again.');
      }
    } catch (error) {
      console.error('Error retrying email:', error);
      alert('An error occurred while trying to retry the email.');
    }
  };

  // Calculate pagination
  const totalPages = data ? Math.ceil(data.length / pageSize) : 0;
  const paginatedData = data ? data.slice((page - 1) * pageSize, page * pageSize) : [];

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  if (isLoading) return <div>Loading failed email list...</div>;
  if (isError) return <div>Error loading failed emails. Please try again.</div>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Failed Email Notifications</CardTitle>
        <CardDescription>
          Inquiries where email notification failed to send. These inquiries are still saved in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data && data.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No failed email notifications found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>{inquiry.id}</TableCell>
                  <TableCell>{inquiry.name}</TableCell>
                  <TableCell>{inquiry.email}</TableCell>
                  <TableCell>{inquiry.subject}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      {inquiry.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleRetryEmail(inquiry.id)}
                    >
                      Retry Email
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default FailedEmailList;