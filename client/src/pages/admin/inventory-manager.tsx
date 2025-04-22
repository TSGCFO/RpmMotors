import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '../../lib/queryClient';
import { Vehicle } from '../../../../shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Save, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InventoryManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('add');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
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
  });

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    queryFn: async () => {
      const res = await fetch('/api/vehicles');
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      return res.json();
    }
  });

  useEffect(() => {
    if (selectedVehicle) {
      setFormData({
        ...selectedVehicle,
        features: Array.isArray(selectedVehicle.features) 
          ? selectedVehicle.features.join(', ') 
          : typeof selectedVehicle.features === 'string' 
            ? selectedVehicle.features 
            : '',
        images: Array.isArray(selectedVehicle.images) 
          ? selectedVehicle.images.join(', ') 
          : typeof selectedVehicle.images === 'string' 
            ? selectedVehicle.images 
            : ''
      });
    }
  }, [selectedVehicle]);

  const addVehicleMutation = useMutation({
    mutationFn: async (data: any) => {
      // Format the data (convert features and images to arrays)
      const formattedData = {
        ...data,
        features: data.features.split(',').map((f: string) => f.trim()).filter(Boolean),
        images: data.images.split(',').map((i: string) => i.trim()).filter(Boolean)
      };
      
      const response = await apiRequest('POST', '/api/vehicles', formattedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: 'Success',
        description: 'Vehicle added successfully',
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to add vehicle: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async (data: any) => {
      const id = data.id;
      
      // Format the data (convert features and images to arrays)
      const formattedData = {
        ...data,
        features: typeof data.features === 'string' 
          ? data.features.split(',').map((f: string) => f.trim()).filter(Boolean)
          : data.features,
        images: typeof data.images === 'string'
          ? data.images.split(',').map((i: string) => i.trim()).filter(Boolean)
          : data.images
      };
      
      const response = await apiRequest('PUT', `/api/vehicles/${id}`, formattedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: 'Success',
        description: 'Vehicle updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update vehicle: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/vehicles/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      setSelectedVehicle(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Vehicle deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete vehicle: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' || name === 'price' || name === 'mileage' ? Number(value) : value
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isFeatured: checked
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'add') {
      addVehicleMutation.mutate(formData);
    } else if (selectedVehicle) {
      updateVehicleMutation.mutate({ ...formData, id: selectedVehicle.id });
    }
  };

  const handleDelete = () => {
    if (selectedVehicle && confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicleMutation.mutate(selectedVehicle.id);
    }
  };

  const resetForm = () => {
    setFormData({
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
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="add">Add Vehicle</TabsTrigger>
          <TabsTrigger value="edit">Edit Vehicle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Vehicle</CardTitle>
              <CardDescription>Enter the details for the new vehicle</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
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
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select name="fuelType" value={formData.fuelType} onValueChange={(value) => setFormData({ ...formData, fuelType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gasoline">Gasoline</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select name="transmission" value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" name="color" value={formData.color} onChange={handleInputChange} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select name="condition" value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Very Good">Very Good</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vin">VIN</Label>
                    <Input id="vin" name="vin" value={formData.vin} onChange={handleInputChange} required />
                  </div>
                  
                  <div className="space-y-2 flex items-center pt-8">
                    <Switch id="isFeatured" checked={formData.isFeatured} onCheckedChange={handleSwitchChange} />
                    <Label htmlFor="isFeatured" className="ml-2">Feature this vehicle</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="features">Features (comma separated)</Label>
                  <Textarea id="features" name="features" value={formData.features} onChange={handleInputChange} rows={3} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="images">Images (comma separated URLs)</Label>
                  <Textarea id="images" name="images" value={formData.images} onChange={handleInputChange} rows={3} required />
                  <p className="text-sm text-gray-500">Example: vehicles/bmw/image1.jpg, vehicles/bmw/image2.jpg</p>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" disabled={addVehicleMutation.isPending} className="mr-2">
                  {addVehicleMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Add Vehicle</span>
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Vehicle</CardTitle>
              <CardDescription>Select a vehicle to edit or delete</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleSelect">Select Vehicle</Label>
                      <Select value={selectedVehicle?.id?.toString() || ''} onValueChange={(value) => {
                        const vehicle = vehicles?.find(v => v.id === parseInt(value));
                        setSelectedVehicle(vehicle || null);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles?.map(vehicle => (
                            <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedVehicle && (
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
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
                            <Label htmlFor="fuelType">Fuel Type</Label>
                            <Select name="fuelType" value={formData.fuelType} onValueChange={(value) => setFormData({ ...formData, fuelType: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select fuel type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Gasoline">Gasoline</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="Electric">Electric</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="transmission">Transmission</Label>
                            <Select name="transmission" value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transmission" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Automatic">Automatic</SelectItem>
                                <SelectItem value="Manual">Manual</SelectItem>
                                <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="color">Color</Label>
                            <Input id="color" name="color" value={formData.color} onChange={handleInputChange} required />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="condition">Condition</Label>
                            <Select name="condition" value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Excellent">Excellent</SelectItem>
                                <SelectItem value="Very Good">Very Good</SelectItem>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Fair">Fair</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="vin">VIN</Label>
                            <Input id="vin" name="vin" value={formData.vin} onChange={handleInputChange} required />
                          </div>
                          
                          <div className="space-y-2 flex items-center pt-8">
                            <Switch id="isFeatured" checked={formData.isFeatured} onCheckedChange={handleSwitchChange} />
                            <Label htmlFor="isFeatured" className="ml-2">Feature this vehicle</Label>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} required />
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="features">Features (comma separated)</Label>
                          <Textarea id="features" name="features" value={formData.features} onChange={handleInputChange} rows={3} required />
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="images">Images (comma separated URLs)</Label>
                          <Textarea id="images" name="images" value={formData.images} onChange={handleInputChange} rows={3} required />
                          <p className="text-sm text-gray-500">Example: vehicles/bmw/image1.jpg, vehicles/bmw/image2.jpg</p>
                        </div>
                        
                        <div className="flex mt-6">
                          <Button type="submit" disabled={updateVehicleMutation.isPending} className="mr-2">
                            {updateVehicleMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                <span>Save Changes</span>
                              </>
                            )}
                          </Button>
                          <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteVehicleMutation.isPending}>
                            {deleteVehicleMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}