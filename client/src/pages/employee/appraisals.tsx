import { EmployeeLayout } from "@/components/employee/employee-layout";
import AppraisalListView from "@/components/staff/appraisal-list-view";

export default function EmployeeAppraisalsPage() {
  return (
    <EmployeeLayout>
      <AppraisalListView basePath="/employee/appraisals" />
    </EmployeeLayout>
  );
}
