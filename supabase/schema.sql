-- ============================================================
-- مكتب الهتار كارز | AL-HITAR CARS — المرحلة الأولى
-- schema.sql — بنية قاعدة البيانات الكاملة
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists btree_gist;

-- ------------------------------------------------------------
-- profiles: ملف كل مستخدم مرتبط بمستخدم Supabase Auth
-- ------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text not null,
  role text not null check (role in ('owner', 'accountant', 'receptionist')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- car_owners: أصحاب السيارات الخارجيين
-- ------------------------------------------------------------
create table if not exists car_owners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- cars: أسطول السيارات
-- ------------------------------------------------------------
create table if not exists cars (
  id uuid primary key default uuid_generate_v4(),
  plate_number text unique not null,
  make text not null,
  model text not null,
  year int not null check (year between 1990 and 2100),
  color text not null,
  car_type text not null check (car_type in ('صالون', 'دفع رباعي', 'حافلة', 'فخم')),
  ownership_type text not null check (ownership_type in ('ملك المكتب', 'خارجي')),
  external_owner_id uuid references car_owners(id) on delete set null,
  daily_price numeric(12, 2) not null default 0 check (daily_price >= 0),
  trip_price numeric(12, 2) check (trip_price is null or trip_price >= 0),
  km_price numeric(12, 2) check (km_price is null or km_price >= 0),
  insurance_expiry date,
  license_expiry date,
  status text not null default 'متاحة' check (status in ('متاحة', 'محجوزة', 'صيانة', 'غير نشطة')),
  current_odometer int not null default 0 check (current_odometer >= 0),
  notes text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- customers: العملاء
-- ------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text not null,
  phone2 text,
  national_id text,
  address text,
  customer_type text not null check (customer_type in ('فرد', 'شركة')),
  company_name text,
  notes text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- bookings: الحجوزات
-- ------------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  booking_number integer generated always as identity,
  customer_id uuid not null references customers(id) on delete restrict,
  car_id uuid not null references cars(id) on delete restrict,
  service_type text not null check (
    service_type in ('تأجير يومي', 'رحلة', 'مطار', 'زفاف', 'تخرج', 'حج', 'عمرة', 'جواز', 'طيران')
  ),
  driver_name text,
  pickup_location text,
  dropoff_location text,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  pricing_model text not null check (pricing_model in ('يومي', 'رحلة', 'كيلومتر')),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  deposit_amount numeric(12, 2) not null default 0 check (deposit_amount >= 0),
  status text not null default 'مسودة' check (status in ('مسودة', 'مؤكد', 'جاري', 'مكتمل', 'ملغي')),
  created_at timestamptz not null default now(),
  check (end_datetime >= start_datetime),
  check (deposit_amount <= total_amount),
  -- يمنع تعارض الحجوزات على نفس السيارة في نفس الفترة الزمنية (باستثناء الحجوزات الملغاة)
  exclude using gist (
    car_id with =,
    tstzrange(start_datetime, end_datetime) with &&
  ) where (status <> 'ملغي')
);

create index if not exists idx_bookings_customer on bookings(customer_id);
create index if not exists idx_bookings_car on bookings(car_id);
create index if not exists idx_bookings_start on bookings(start_datetime);

-- ------------------------------------------------------------
-- invoices: الفواتير
-- ------------------------------------------------------------
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number integer generated always as identity,
  booking_id uuid not null references bookings(id) on delete restrict,
  customer_id uuid not null references customers(id) on delete restrict,
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  paid_amount numeric(12, 2) not null default 0 check (paid_amount >= 0),
  created_at timestamptz not null default now(),
  unique (booking_id),
  check (paid_amount <= total_amount)
);

create index if not exists idx_invoices_customer on invoices(customer_id);

-- ------------------------------------------------------------
-- payments: المدفوعات
-- ------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references invoices(id) on delete restrict,
  amount numeric(12, 2) not null check (amount > 0),
  payment_method text not null,
  paid_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_invoice on payments(invoice_id);
