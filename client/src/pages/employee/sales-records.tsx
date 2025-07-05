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
  vehicleId: number;
  make: string;
  modelStyle: string;
  colour: string;
  dateIntoStock: string;
  vinSerialNo: string;
  purchasedFromName: string;
  purchasedFromAddress: string;
  purposeType: string;
  dateOutOfStock: string;
  soldToName: string;
  soldToAddress: string;
  plateNo: string;
  odometerReading: number;
  createdAt: string;
  createdBy: number | null;
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
                    <TableHead>Buyer Address</TableHead>
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
                          {formatDate(register.dateOutOfStock)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <Car className="h-3 w-3 text-muted-foreground" />
                          {register.make} {register.modelStyle} ({register.colour})
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {register.vinSerialNo}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          register.purposeType === 'Resale' ? 'default' : 
                          register.purposeType === 'Wrecking' ? 'destructive' : 
                          'secondary'
                        }>
                          {register.purposeType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {register.soldToName}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{register.soldToAddress}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {register.plateNo}
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