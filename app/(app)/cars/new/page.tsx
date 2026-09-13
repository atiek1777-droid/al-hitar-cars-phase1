import { PageHeader } from "@/components/shared/page-header";
import { CarForm } from "@/components/forms/car-form";

export default function NewCarPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="إضافة سيارة جديدة" />
      <CarForm />
    </div>
  );
}
