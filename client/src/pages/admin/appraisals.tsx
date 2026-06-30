import DashboardLayout from "@/components/admin/dashboard-layout";
import AppraisalListView from "@/components/staff/appraisal-list-view";

export default function AdminAppraisalsPage() {
  return (
    <DashboardLayout>
      <AppraisalListView basePath="/admin/appraisals" />
    </DashboardLayout>
  );
}
