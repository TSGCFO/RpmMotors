import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from '@/components/admin/dashboard-layout';
import { Vehicle, InsertVehicle } from '@shared/schema';
import { Edit, Trash2, Plus, Search, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function AdminInventory() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: 0,
    price: 0,
    mileage: 0,
    vin: '',
    color: '',
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    description: '',
    category: 'SUV',
    features: '',
    images: [''],
    isFeatured: false,
    condition: 'Used'
  });
  
  // Fetch all vehicles including sold ones
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles?includeAll=true'],
  });
  
  // Add a new vehicle
  const addVehicleMutation = useMutation({
    mutationFn: (newVehicle: InsertVehicle) => 
      apiRequest('POST', '/api/vehicles', newVehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "Vehicle Added",
        description: "The vehicle has been added successfully.",
      });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Update a vehicle
  const updateVehicleMutation = useMutation({
    mutationFn: (vehicle: Vehicle) => 
      apiRequest('PUT', `/api/vehicles/${vehicle.id}`, vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "Vehicle Updated",
        description: "The vehicle has been updated successfully.",
      });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update vehicle. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Delete a vehicle
  const deleteVehicleMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "Vehicle Deleted",
        description: "The vehicle has been deleted successfully.",
      });
      setIsDeleteModalOpen(false);
      setSelectedVehicle(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete vehicle. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: 0,
      price: 0,
      mileage: 0,
      vin: '',
      color: '',
      transmission: 'Automatic',
      fuelType: 'Gasoline',
      description: '',
      category: 'SUV',
      features: '',
      images: [''],
      isFeatured: false,
      condition: 'Used'
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData({
      ...formData,
      images: updatedImages
    });
  };
  
  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, '']
    });
  };
  
  const removeImageField = (index: number) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };
  
  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };
  
  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      mileage: vehicle.mileage,
      vin: vehicle.vin,
      color: vehicle.color,
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      description: vehicle.description,
      category: vehicle.category,
      features: vehicle.features.join(', '),
      images: vehicle.images,
      isFeatured: vehicle.isFeatured || false,
      condition: vehicle.condition
    });
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteModalOpen(true);
  };
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVehicle = {
      ...formData,
      features: formData.features.split(',').map(feature => feature.trim()).filter(feature => feature !== '')
    };
    addVehicleMutation.mutate(newVehicle);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    
    const updatedVehicle = {
      ...selectedVehicle,
      ...formData,
      features: formData.features.split(',').map(feature => feature.trim()).filter(feature => feature !== '')
    };
    
    updateVehicleMutation.mutate(updatedVehicle);
  };
  
  const handleDeleteSubmit = () => {
    if (!selectedVehicle) return;
    deleteVehicleMutation.mutate(selectedVehicle.id);
  };
  
  // Filter vehicles based on search query and category
  const filteredVehicles = vehicles?.filter(vehicle => {
    const searchMatches = 
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase());
    
    const categoryMatches = filterCategory === '' || vehicle.category === filterCategory;
    
    return searchMatches && categoryMatches;
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Manage your vehicle inventory</p>
          </div>
          <button
            onClick={openAddModal}
            className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-[#E31837] text-white rounded-md hover:bg-opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </button>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by make, model, or VIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <div className="w-full md:w-64">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
            >
              <option value="">All Categories</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Coupe">Coupe</option>
              <option value="Truck">Truck</option>
              <option value="Convertible">Convertible</option>
              <option value="Luxury">Luxury</option>
              <option value="Sport">Sport</option>
            </select>
          </div>
        </div>
        
        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E31837]"></div>
            </div>
          ) : filteredVehicles && filteredVehicles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={vehicle.images[0] || '/placeholders/placeholder-car.svg'}
                              alt={`${vehicle.make} ${vehicle.model}`}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholders/placeholder-car.svg';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              VIN: {vehicle.vin}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(vehicle.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {vehicle.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vehicle.isFeatured
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {vehicle.isFeatured ? "Featured" : "Standard"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(vehicle)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(vehicle)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No vehicles found.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg max-w-3xl w-full max-h-90vh overflow-y-auto z-50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Vehicle</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                      Make *
                    </label>
                    <input
                      type="text"
                      id="make"
                      name="make"
                      required
                      value={formData.make}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      required
                      value={formData.model}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.year || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min="0"
                      step="1"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
                      Mileage *
                    </label>
                    <input
                      type="number"
                      id="mileage"
                      name="mileage"
                      required
                      min="0"
                      value={formData.mileage || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                      VIN *
                    </label>
                    <input
                      type="text"
                      id="vin"
                      name="vin"
                      required
                      value={formData.vin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                      Color *
                    </label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      required
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
                      Transmission *
                    </label>
                    <select
                      id="transmission"
                      name="transmission"
                      required
                      value={formData.transmission}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="CVT">CVT</option>
                      <option value="Dual Clutch">Dual Clutch</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Type *
                    </label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      required
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    >
                      <option value="Gasoline">Gasoline</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    >
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Truck">Truck</option>
                      <option value="Convertible">Convertible</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Sport">Sport</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                      Condition *
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      required
                      value={formData.condition}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    >
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                      <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <span className="text-xs text-gray-500">Min 20 characters</span>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    required
                    minLength={20}
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
                    Features (comma-separated) *
                  </label>
                  <textarea
                    id="features"
                    name="features"
                    required
                    rows={2}
                    value={formData.features}
                    onChange={handleInputChange}
                    placeholder="Leather Seats, Navigation, Sunroof, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                  ></textarea>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Images (URLs) *
                    </label>
                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add More
                    </button>
                  </div>
                  
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="url"
                        required
                        value={image}
                        onChange={(e) => handleImageChange(e, index)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-[#E31837] focus:ring-[#E31837] border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                    Featured Vehicle (will appear on homepage)
                  </label>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#E31837] text-white rounded-md hover:bg-opacity-90"
                    disabled={addVehicleMutation.isPending}
                  >
                    {addVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Vehicle Modal */}
      {isEditModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg max-w-3xl w-full max-h-90vh overflow-y-auto z-50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Vehicle</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Same form fields as Add Modal, but with values from selectedVehicle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="edit-make" className="block text-sm font-medium text-gray-700 mb-1">
                      Make *
                    </label>
                    <input
                      type="text"
                      id="edit-make"
                      name="make"
                      required
                      value={formData.make}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-model" className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      id="edit-model"
                      name="model"
                      required
                      value={formData.model}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-year" className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      id="edit-year"
                      name="year"
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.year || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      id="edit-price"
                      name="price"
                      required
                      min="0"
                      step="1"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-mileage" className="block text-sm font-medium text-gray-700 mb-1">
                      Mileage *
                    </label>
                    <input
                      type="number"
                      id="edit-mileage"
                      name="mileage"
                      required
                      min="0"
                      value={formData.mileage || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-vin" className="block text-sm font-medium text-gray-700 mb-1">
                      VIN *
                    </label>
                    <input
                      type="text"
                      id="edit-vin"
                      name="vin"
                      required
                      value={formData.vin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-color" className="block text-sm font-medium text-gray-700 mb-1">
                      Color *
                    </label>
                    <input
                      type="text"
                      id="edit-color"
                      name="color"
                      required
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-transmission" className="block text-sm font-medium text-gray-700 mb-1">
                      Transmission *
                    </label>
                    <select
                      id="edit-transmission"
                      name="transmission"
                      required
                      value={formData.transmission}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="CVT">CVT</option>
                      <option value="Dual Clutch">Dual Clutch</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-fuelType" className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Type *
                    </label>
                    <select
                      id="edit-fuelType"
                      name="fuelType"
                      required
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    >
                      <option value="Gasoline">Gasoline</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="edit-category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    >
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Truck">Truck</option>
                      <option value="Convertible">Convertible</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Sport">Sport</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-condition" className="block text-sm font-medium text-gray-700 mb-1">
                      Condition *
                    </label>
                    <select
                      id="edit-condition"
                      name="condition"
                      required
                      value={formData.condition}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                    >
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                      <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <span className="text-xs text-gray-500">Min 20 characters</span>
                  </div>
                  <textarea
                    id="edit-description"
                    name="description"
                    required
                    minLength={20}
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="edit-features" className="block text-sm font-medium text-gray-700 mb-1">
                    Features (comma-separated) *
                  </label>
                  <textarea
                    id="edit-features"
                    name="features"
                    required
                    rows={2}
                    value={formData.features}
                    onChange={handleInputChange}
                    placeholder="Leather Seats, Navigation, Sunroof, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                  ></textarea>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Images (URLs) *
                    </label>
                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add More
                    </button>
                  </div>
                  
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="url"
                        required
                        value={image}
                        onChange={(e) => handleImageChange(e, index)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-[#E31837] focus:ring-[#E31837] border-gray-300 rounded"
                  />
                  <label htmlFor="edit-isFeatured" className="ml-2 block text-sm text-gray-700">
                    Featured Vehicle (will appear on homepage)
                  </label>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#E31837] text-white rounded-md hover:bg-opacity-90"
                    disabled={updateVehicleMutation.isPending}
                  >
                    {updateVehicleMutation.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsDeleteModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full z-50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Delete Vehicle</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to delete the following vehicle? This action cannot be undone.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-900">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h3>
                  <p className="text-sm text-gray-500">VIN: {selectedVehicle.vin}</p>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSubmit}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    disabled={deleteVehicleMutation.isPending}
                  >
                    {deleteVehicleMutation.isPending ? "Deleting..." : "Delete Vehicle"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}