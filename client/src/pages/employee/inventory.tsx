import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { Loader2 } from 'lucide-react';

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

export default function EmployeeInventoryManager() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
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
    vin: ''
  };
  
  const handleSubmit = (data: any) => {
    console.log("Form submitted:", data);
    toast({
      title: "Success",
      description: "Vehicle saved successfully!",
    });
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  return (
    <EmployeeLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>Add Vehicle</Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Employee Dashboard</CardTitle>
            <CardDescription>Welcome to the inventory management dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Click "Add Vehicle" to create a new vehicle listing.</p>
          </CardContent>
        </Card>
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
            onSubmit={handleSubmit}
            onCancel={() => setIsAddModalOpen(false)}
            isPending={false}
          />
        </DialogContent>
      </Dialog>
    </EmployeeLayout>
  );
}