import { PageHeader } from "@/components/shared/page-header";
import { CustomerForm } from "@/components/forms/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="إضافة عميل جديد" />
      <CustomerForm />
    </div>
  );
}
