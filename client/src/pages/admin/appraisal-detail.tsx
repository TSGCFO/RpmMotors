import { useRoute } from "wouter";
import DashboardLayout from "@/components/admin/dashboard-layout";
import AppraisalDetailView from "@/components/staff/appraisal-detail-view";

export default function AdminAppraisalDetailPage() {
  const [, params] = useRoute<{ id: string }>("/admin/appraisals/:id");
  const id = params ? parseInt(params.id, 10) : NaN;

  return (
    <DashboardLayout>
      {isNaN(id) ? (
        <div className="text-red-600">Invalid appraisal ID</div>
      ) : (
        <AppraisalDetailView id={id} basePath="/admin/appraisals" />
      )}
    </DashboardLayout>
  );
}
