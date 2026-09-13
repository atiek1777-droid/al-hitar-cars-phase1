import { PageHeader } from "@/components/shared/page-header";
import { BookingForm } from "@/components/forms/booking-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewBookingPage() {
  const supabase = createClient();
  const { data: customers } = await supabase.from("customers").select("*").order("full_name");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="حجز جديد" />
      <BookingForm customers={customers ?? []} />
    </div>
  );
}
