import { useRoute } from "wouter";
import { EmployeeLayout } from "@/components/employee/employee-layout";
import AppraisalDetailView from "@/components/staff/appraisal-detail-view";

export default function EmployeeAppraisalDetailPage() {
  const [, params] = useRoute<{ id: string }>("/employee/appraisals/:id");
  const id = params ? parseInt(params.id, 10) : NaN;

  return (
    <EmployeeLayout>
      {isNaN(id) ? (
        <div className="text-red-600">Invalid appraisal ID</div>
      ) : (
        <AppraisalDetailView id={id} basePath="/employee/appraisals" />
      )}
    </EmployeeLayout>
  );
}
