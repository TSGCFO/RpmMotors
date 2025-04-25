import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import EmployeeLayout from '@/components/employee/employee-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Pencil, Trash2, Car, Check, X, AlertTriangle } from 'lucide-react';
import { Vehicle } from '@shared/schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Simplified form component
interface VehicleFormProps {
  initialData: {
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    color: string;
    description: string;
    category: string;
    condition: string;
    isFeatured: boolean;
    features: string;
    images: string;
    vin: string;
    status?: string;
    id?: number;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
  isPending?: boolean;
}

function VehicleForm({ initialData, onSubmit, onCancel, isEdit = false, isPending = false }: VehicleFormProps) {
  const [formData, setFormData] = useState(initialData);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === 'year' || name === 'price' || name === 'mileage' ? Number(value) : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      isFeatured: checked
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input id="make" name="make" value={formData.make} onChange={handleInputChange} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" value={formData.model} onChange={handleInputChange} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" value={formData.year} onChange={handleInputChange} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mileage">Mileage</Label>
          <Input id="mileage" name="mileage" type="number" value={formData.mileage} onChange={handleInputChange} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vin">VIN</Label>
          <Input id="vin" name="vin" value={formData.vin} onChange={handleInputChange} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fuelType">Fuel Type</Label>
          <Select name="fuelType" value={formData.fuelType} onValueChange={(value) => handleSelectChange('fuelType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Gasoline">Gasoline</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Electric">Electric</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="transmission">Transmission</Label>
          <Select name="transmission" value={formData.transmission} onValueChange={(value) => handleSelectChange('transmission', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Automatic">Automatic</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
              <SelectItem value="CVT">CVT</SelectItem>
              <SelectItem value="DCT">DCT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" value={formData.color} onChange={handleInputChange} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sports Cars">Sports Cars</SelectItem>
              <SelectItem value="Luxury Cars">Luxury Cars</SelectItem>
              <SelectItem value="SUVs">SUVs</SelectItem>
              <SelectItem value="Sedans">Sedans</SelectItem>
              <SelectItem value="Convertibles">Convertibles</SelectItem>
              <SelectItem value="Exotics">Exotics</SelectItem>
              <SelectItem value="Hatchbacks">Hatchbacks</SelectItem>
              <SelectItem value="Wagons">Wagons</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select name="condition" value={formData.condition} onValueChange={(value) => handleSelectChange('condition', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Excellent">Excellent</SelectItem>
              <SelectItem value="Very Good">Very Good</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" value={formData.status || 'available'} onValueChange={(value) => handleSelectChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 flex items-center pt-8">
          <Switch id="isFeatured" checked={!!formData.isFeatured} onCheckedChange={handleSwitchChange} />
          <Label htmlFor="isFeatured" className="ml-2">Feature this vehicle</Label>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} required />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="features">Vehicle Features</Label>
        <Textarea 
          id="features" 
          name="features" 
          value={formData.features} 
          onChange={handleInputChange} 
          rows={5} 
          placeholder="Enter features separated by commas or use markdown format for categorized features" 
        />
        <p className="text-xs text-gray-500">
          Enter features separated by commas or use markdown format (## Category) for categorization
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="images">Images</Label>
        <Textarea
          id="images"
          name="images"
          value={formData.images}
          onChange={handleInputChange}
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          rows={2}
        />
        <p className="text-xs text-gray-500">Enter image URLs separated by commas</p>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>{isEdit ? 'Updating...' : 'Adding...'}</span>
            </>
          ) : (
            <span>{isEdit ? 'Update Vehicle' : 'Add Vehicle'}</span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Helper function to get status badge
function getStatusBadge(status: string) {
  switch (status) {
    case 'available':
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100"><Check className="h-3 w-3 mr-1" /> Available</Badge>;
    case 'sold':
      return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100"><X className="h-3 w-3 mr-1" /> Sold</Badge>;
    case 'reserved':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Car className="h-3 w-3 mr-1" /> Reserved</Badge>;
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertTriangle className="h-3 w-3 mr-1" /> Pending</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function EmployeeInventoryManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicleId, setDeletingVehicleId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch all vehicles
  const { data: vehicles, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles?includeAll=true'],
  });
  
  // Add vehicle mutation
  const addVehicleMutation = useMutation({
    mutationFn: async (newVehicle: any) => {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVehicle),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add vehicle');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "Success",
        description: "Vehicle added successfully!",
      });
      setIsAddModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Update vehicle mutation
  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update vehicle');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "Success",
        description: "Vehicle updated successfully!",
      });
      setIsEditModalOpen(false);
      setEditingVehicle(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update vehicle. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Update vehicle status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await fetch(`/api/vehicles/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "Status Updated",
        description: "Vehicle status changed successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Delete vehicle mutation
  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "Success",
        description: "Vehicle deleted successfully!",
      });
      setIsDeleteDialogOpen(false);
      setDeletingVehicleId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete vehicle. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Default form data 
  const defaultFormData = {
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    color: '',
    description: '',
    category: 'Sports Cars',
    condition: 'Excellent',
    isFeatured: false,
    features: '',
    images: '',
    vin: '',
    status: 'available'
  };
  
  // Handle add vehicle
  const handleAddVehicle = (data: any) => {
    // Convert images string to array
    const processedData = {
      ...data,
      images: data.images ? data.images.split(',').map((url: string) => url.trim()) : [],
      features: data.features || '',
    };
    
    addVehicleMutation.mutate(processedData);
  };
  
  // Handle edit vehicle
  const handleEditVehicle = (data: any) => {
    if (!editingVehicle) return;
    
    // Convert images string to array if it's a string
    const processedData = {
      ...data,
      images: typeof data.images === 'string' ? 
        data.images.split(',').map((url: string) => url.trim()) : 
        data.images,
      features: data.features || '',
    };
    
    updateVehicleMutation.mutate({ id: editingVehicle.id, updates: processedData });
  };
  
  // Handle delete vehicle
  const handleDeleteVehicle = () => {
    if (deletingVehicleId) {
      deleteVehicleMutation.mutate(deletingVehicleId);
    }
  };
  
  // Handle opening edit modal
  const handleOpenEditModal = (vehicle: Vehicle) => {
    // Convert images array to string for editing
    const vehicleWithImagesString = {
      ...vehicle,
      images: Array.isArray(vehicle.images) ? vehicle.images.join(', ') : '',
    };
    
    setEditingVehicle(vehicle);
    setIsEditModalOpen(true);
  };
  
  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };
  
  // Filter vehicles based on active tab
  const filteredVehicles = vehicles?.filter(vehicle => {
    if (activeTab === 'all') return true;
    return vehicle.status === activeTab;
  });

  return (
    <EmployeeLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>Add Vehicle</Button>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Vehicles</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
            <TabsTrigger value="reserved">Reserved</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <Card>
                <CardContent className="flex justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-red-500">Failed to load vehicles. Please try again later.</p>
                </CardContent>
              </Card>
            ) : filteredVehicles?.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No vehicles found in this category.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVehicles?.map(vehicle => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">
                            {vehicle.make} {vehicle.model}
                          </TableCell>
                          <TableCell>{vehicle.year}</TableCell>
                          <TableCell>${vehicle.price.toLocaleString()}</TableCell>
                          <TableCell>
                            <Select 
                              value={vehicle.status || 'available'} 
                              onValueChange={(value) => handleStatusChange(vehicle.id, value)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue>
                                  {getStatusBadge(vehicle.status || 'available')}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                                <SelectItem value="reserved">Reserved</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleOpenEditModal(vehicle)}
                              >
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => {
                                  setDeletingVehicleId(vehicle.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Vehicle Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Fill out the form below to add a new vehicle to the inventory.
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            initialData={defaultFormData}
            onSubmit={handleAddVehicle}
            onCancel={() => setIsAddModalOpen(false)}
            isPending={addVehicleMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Vehicle Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {editingVehicle && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Vehicle</DialogTitle>
              <DialogDescription>
                Update the details for {editingVehicle.year} {editingVehicle.make} {editingVehicle.model}
              </DialogDescription>
            </DialogHeader>
            <VehicleForm
              initialData={{
                ...editingVehicle,
                images: Array.isArray(editingVehicle.images) ? editingVehicle.images.join(', ') : '',
              }}
              onSubmit={handleEditVehicle}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingVehicle(null);
              }}
              isEdit={true}
              isPending={updateVehicleMutation.isPending}
            />
          </DialogContent>
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingVehicleId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVehicle} className="bg-red-500 hover:bg-red-600">
              {deleteVehicleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EmployeeLayout>
  );
}