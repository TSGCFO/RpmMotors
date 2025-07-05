import { useQuery } from "@tanstack/react-query";
import EmployeeLayout from "@/components/employee/employee-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Car, User, FileText } from "lucide-react";
import { format } from "date-fns";

interface GarageRegister {
  id: number;
  dateOfSale: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleVin: string;
  purposeOfSale: string;
  buyerName: string;
  buyerPhoneNumber: string;
  licensePlate: string;
  odometerReading: number;
}

export function SalesRecords() {
  const { data: garageRegisters = [], isLoading } = useQuery<GarageRegister[]>({
    queryKey: ["/api/garage-registers"],
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <EmployeeLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Garage Register Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : garageRegisters && garageRegisters.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date of Sale</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Sale Purpose</TableHead>
                    <TableHead>Buyer Name</TableHead>
                    <TableHead>Buyer Phone</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Odometer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {garageRegisters.map((register) => (
                    <TableRow key={register.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(register.dateOfSale)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <Car className="h-3 w-3 text-muted-foreground" />
                          {register.vehicleMake} {register.vehicleModel} ({register.vehicleYear})
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {register.vehicleVin}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          register.purposeOfSale === 'Resale' ? 'default' : 
                          register.purposeOfSale === 'Wrecking' ? 'destructive' : 
                          'secondary'
                        }>
                          {register.purposeOfSale}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {register.buyerName}
                        </div>
                      </TableCell>
                      <TableCell>{register.buyerPhoneNumber}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {register.licensePlate}
                        </code>
                      </TableCell>
                      <TableCell>{register.odometerReading.toLocaleString()} km</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No sales records found.
            </div>
          )}
        </CardContent>
      </Card>
    </EmployeeLayout>
  );
}