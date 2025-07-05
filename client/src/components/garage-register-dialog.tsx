import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle } from '@shared/schema';

interface GarageRegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onConfirm: (garageRegisterData: any) => void;
}

export function GarageRegisterDialog({ 
  isOpen, 
  onClose, 
  vehicle, 
  onConfirm 
}: GarageRegisterDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auto-filled data from vehicle
  const [formData, setFormData] = useState({
    vehicleId: vehicle.id,
    make: vehicle.make,
    modelStyle: vehicle.model,
    colour: vehicle.color,
    dateIntoStock: vehicle.createdAt ? new Date(vehicle.createdAt).toISOString().split('T')[0].replace(/-/g, '/') : '',
    vinSerialNo: vehicle.vin,
    purchasedFromName: 'RPM Auto',
    purchasedFromAddress: '204 Hill Farm Road, Nobleton L7B 0A1',
    // User input required
    purposeType: '',
    dateOutOfStock: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
    soldToName: '',
    soldToAddress: '',
    plateNo: '',
    odometerReading: vehicle.mileage || 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'odometerReading' ? parseInt(value) || 0 : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      purposeType: value
    }));
    if (errors.purposeType) {
      setErrors(prev => ({ ...prev, purposeType: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.purposeType) {
      newErrors.purposeType = 'Purpose type is required';
    }
    
    if (!formData.dateOutOfStock) {
      newErrors.dateOutOfStock = 'Date out of stock is required';
    } else if (!/^\d{4}\/\d{2}\/\d{2}$/.test(formData.dateOutOfStock)) {
      newErrors.dateOutOfStock = 'Date must be in format yyyy/mm/dd';
    }
    
    if (!formData.soldToName) {
      newErrors.soldToName = 'Buyer name is required';
    }
    
    if (!formData.soldToAddress) {
      newErrors.soldToAddress = 'Buyer address is required';
    }
    
    if (!formData.plateNo) {
      newErrors.plateNo = 'Plate number is required';
    } else if (!/^[A-Z0-9]+$/i.test(formData.plateNo)) {
      newErrors.plateNo = 'Plate number must be alphanumeric';
    }
    
    if (formData.odometerReading < 0) {
      newErrors.odometerReading = 'Odometer reading must be positive';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Convert plate number to uppercase for consistency
    const submissionData = {
      ...formData,
      plateNo: formData.plateNo.toUpperCase()
    };
    
    onConfirm(submissionData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Garage Register Entry</DialogTitle>
          <DialogDescription>
            Before marking this vehicle as sold, please complete the garage register information.
            Auto-filled fields are shown below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Auto-filled fields (read-only) */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm">Vehicle Information (Auto-filled)</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">Make</Label>
                <p className="font-medium">{formData.make}</p>
              </div>
              <div>
                <Label className="text-gray-600">Model/Style</Label>
                <p className="font-medium">{formData.modelStyle}</p>
              </div>
              <div>
                <Label className="text-gray-600">Colour</Label>
                <p className="font-medium">{formData.colour}</p>
              </div>
              <div>
                <Label className="text-gray-600">VIN/Serial No.</Label>
                <p className="font-medium">{formData.vinSerialNo}</p>
              </div>
              <div>
                <Label className="text-gray-600">Date into Stock</Label>
                <p className="font-medium">{formData.dateIntoStock}</p>
              </div>
              <div>
                <Label className="text-gray-600">Purchased From</Label>
                <p className="font-medium">{formData.purchasedFromName}</p>
                <p className="text-xs text-gray-500">{formData.purchasedFromAddress}</p>
              </div>
            </div>
          </div>
          
          {/* User input fields */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Sale Information (Required)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purposeType">Purpose Type *</Label>
                <Select 
                  value={formData.purposeType} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className={errors.purposeType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select purpose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Resale">Resale</SelectItem>
                    <SelectItem value="Wrecking">Wrecking</SelectItem>
                    <SelectItem value="Consignment">Consignment</SelectItem>
                  </SelectContent>
                </Select>
                {errors.purposeType && (
                  <p className="text-xs text-red-500">{errors.purposeType}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOutOfStock">Date Out of Stock (yyyy/mm/dd) *</Label>
                <Input
                  id="dateOutOfStock"
                  name="dateOutOfStock"
                  value={formData.dateOutOfStock}
                  onChange={handleInputChange}
                  placeholder="2025/01/05"
                  className={errors.dateOutOfStock ? 'border-red-500' : ''}
                />
                {errors.dateOutOfStock && (
                  <p className="text-xs text-red-500">{errors.dateOutOfStock}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="soldToName">Sold to - Name of New Owner *</Label>
              <Input
                id="soldToName"
                name="soldToName"
                value={formData.soldToName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={errors.soldToName ? 'border-red-500' : ''}
              />
              {errors.soldToName && (
                <p className="text-xs text-red-500">{errors.soldToName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="soldToAddress">New Owner Address *</Label>
              <Input
                id="soldToAddress"
                name="soldToAddress"
                value={formData.soldToAddress}
                onChange={handleInputChange}
                placeholder="123 Main St, City, Province, Postal Code"
                className={errors.soldToAddress ? 'border-red-500' : ''}
              />
              {errors.soldToAddress && (
                <p className="text-xs text-red-500">{errors.soldToAddress}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plateNo">Plate No. (Alphanumeric) *</Label>
                <Input
                  id="plateNo"
                  name="plateNo"
                  value={formData.plateNo}
                  onChange={handleInputChange}
                  placeholder="ABC123"
                  className={errors.plateNo ? 'border-red-500' : ''}
                />
                {errors.plateNo && (
                  <p className="text-xs text-red-500">{errors.plateNo}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="odometerReading">Odometer Reading (km) *</Label>
                <Input
                  id="odometerReading"
                  name="odometerReading"
                  type="number"
                  value={formData.odometerReading}
                  onChange={handleInputChange}
                  min="0"
                  className={errors.odometerReading ? 'border-red-500' : ''}
                />
                {errors.odometerReading && (
                  <p className="text-xs text-red-500">{errors.odometerReading}</p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Complete Sale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}