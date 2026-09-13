export type UserRole = "owner" | "accountant" | "receptionist";

export type CarType = "صالون" | "دفع رباعي" | "حافلة" | "فخم";
export type OwnershipType = "ملك المكتب" | "خارجي";
export type CarStatus = "متاحة" | "محجوزة" | "صيانة" | "غير نشطة";

export type CustomerType = "فرد" | "شركة";

export type ServiceType =
  | "تأجير يومي"
  | "رحلة"
  | "مطار"
  | "زفاف"
  | "تخرج"
  | "حج"
  | "عمرة"
  | "جواز"
  | "طيران";

export type PricingModel = "يومي" | "رحلة" | "كيلومتر";

export type BookingStatus = "مسودة" | "مؤكد" | "جاري" | "مكتمل" | "ملغي";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface CarOwner {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
  created_at: string;
}

export interface Car {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  color: string;
  car_type: CarType;
  ownership_type: OwnershipType;
  external_owner_id: string | null;
  daily_price: number;
  trip_price: number | null;
  km_price: number | null;
  insurance_expiry: string | null;
  license_expiry: string | null;
  status: CarStatus;
  current_odometer: number;
  notes: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  phone2: string | null;
  national_id: string | null;
  address: string | null;
  customer_type: CustomerType;
  company_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_number: number;
  customer_id: string;
  car_id: string;
  service_type: ServiceType;
  driver_name: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  start_datetime: string;
  end_datetime: string;
  pricing_model: PricingModel;
  total_amount: number;
  deposit_amount: number;
  status: BookingStatus;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: number;
  booking_id: string;
  customer_id: string;
  total_amount: number;
  paid_amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  paid_at: string;
  notes: string | null;
  created_at: string;
}

// نوع مبسّط لقاعدة بيانات Supabase — يُستخدم لعملاء createBrowserClient/createServerClient
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      car_owners: { Row: CarOwner; Insert: Partial<CarOwner>; Update: Partial<CarOwner> };
      cars: { Row: Car; Insert: Partial<Car>; Update: Partial<Car> };
      customers: { Row: Customer; Insert: Partial<Customer>; Update: Partial<Customer> };
      bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> };
      invoices: { Row: Invoice; Insert: Partial<Invoice>; Update: Partial<Invoice> };
      payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> };
    };
  };
};
