-- ============================================================
-- مكتب الهتار كارز | AL-HITAR CARS — المرحلة الأولى
-- policies.sql — سياسات أمان الصفوف (RLS)
-- ============================================================

alter table profiles enable row level security;
alter table car_owners enable row level security;
alter table cars enable row level security;
alter table customers enable row level security;
alter table bookings enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;

-- دالة مساعدة: تعيد دور المستخدم الحالي من جدول profiles
create or replace function auth_role()
returns text
language plpgsql
security definer
stable
as $$
declare
  r text;
begin
  select role into r from profiles where id = auth.uid();
  if r is null then
    raise exception 'No profile found for user %', auth.uid()
      using errcode='28000';
  end if;
  return r;
end;
$$;

-- DROP ALL EXISTING POLICIES (idempotent) ==================
drop policy if exists "profiles_select_own_or_owner" on profiles;
drop policy if exists "profiles_owner_manage" on profiles;
drop policy if exists "car_owners_select_all" on car_owners;
drop policy if exists "car_owners_owner_write" on car_owners;
drop policy if exists "car_owners_owner_update" on car_owners;
drop policy if exists "car_owners_owner_delete" on car_owners;
drop policy if exists "cars_select_all" on cars;
drop policy if exists "cars_owner_insert" on cars;
drop policy if exists "cars_owner_update" on cars;
drop policy if exists "cars_owner_delete" on cars;
drop policy if exists "customers_select_all" on customers;
drop policy if exists "customers_insert" on customers;
drop policy if exists "customers_update" on customers;
drop policy if exists "customers_delete" on customers;
drop policy if exists "bookings_select_all" on bookings;
drop policy if exists "bookings_insert" on bookings;
drop policy if exists "bookings_update" on bookings;
drop policy if exists "bookings_delete" on bookings;
drop policy if exists "invoices_select" on invoices;
drop policy if exists "invoices_insert" on invoices;
drop policy if exists "invoices_update" on invoices;
drop policy if exists "invoices_delete" on invoices;
drop policy if exists "payments_select" on payments;
drop policy if exists "payments_insert" on payments;
drop policy if exists "payments_update" on payments;
drop policy if exists "payments_delete" on payments;

-- CREATE ALL POLICIES ========================================
-- profiles
create policy "profiles_select_own_or_owner"
  on profiles for select
  using (id = auth.uid() or auth_role() = 'owner');

create policy "profiles_owner_manage"
  on profiles for all
  using (auth_role() = 'owner')
  with check (auth_role() = 'owner');

-- ------------------------------------------------------------
-- car_owners (أصحاب السيارات الخارجيين)
-- ------------------------------------------------------------
create policy "car_owners_select_all"
  on car_owners for select
  using (auth_role() in ('owner', 'accountant', 'receptionist'));

create policy "car_owners_owner_write"
  on car_owners for insert
  with check (auth_role() = 'owner');

create policy "car_owners_owner_update"
  on car_owners for update
  using (auth_role() = 'owner')
  with check (auth_role() = 'owner');

create policy "car_owners_owner_delete"
  on car_owners for delete
  using (auth_role() = 'owner');

-- ------------------------------------------------------------
-- cars
-- Owner: كل شيء | Accountant: قراءة فقط | Receptionist: قراءة فقط
-- ------------------------------------------------------------
create policy "cars_select_all"
  on cars for select
  using (auth_role() in ('owner', 'accountant', 'receptionist'));

create policy "cars_owner_insert"
  on cars for insert
  with check (auth_role() = 'owner');

create policy "cars_owner_update"
  on cars for update
  using (auth_role() = 'owner')
  with check (auth_role() = 'owner');

create policy "cars_owner_delete"
  on cars for delete
  using (auth_role() = 'owner');

-- ------------------------------------------------------------
-- customers
-- Owner + Receptionist: CRUD كامل | Accountant: قراءة فقط
-- ------------------------------------------------------------
create policy "customers_select_all"
  on customers for select
  using (auth_role() in ('owner', 'accountant', 'receptionist'));

create policy "customers_insert"
  on customers for insert
  with check (auth_role() in ('owner', 'receptionist'));

create policy "customers_update"
  on customers for update
  using (auth_role() in ('owner', 'receptionist'))
  with check (auth_role() in ('owner', 'receptionist'));

create policy "customers_delete"
  on customers for delete
  using (auth_role() = 'owner');

-- ------------------------------------------------------------
-- bookings
-- Owner + Receptionist: CRUD كامل | Accountant: قراءة فقط
-- ------------------------------------------------------------
create policy "bookings_select_all"
  on bookings for select
  using (auth_role() in ('owner', 'accountant', 'receptionist'));

create policy "bookings_insert"
  on bookings for insert
  with check (auth_role() in ('owner', 'receptionist'));

create policy "bookings_update"
  on bookings for update
  using (auth_role() in ('owner', 'receptionist'))
  with check (auth_role() in ('owner', 'receptionist'));

create policy "bookings_delete"
  on bookings for delete
  using (auth_role() = 'owner');

-- ------------------------------------------------------------
-- invoices
-- Owner + Accountant: CRUD كامل على الفواتير
-- Receptionist: إدراج فقط (لا تعديل ولا حذف ولا قراءة القوائم المالية الكاملة، لكن يمكنه رؤية فاتورة حجزه)
-- ------------------------------------------------------------
create policy "invoices_select"
  on invoices for select
  using (auth_role() in ('owner', 'accountant', 'receptionist'));

create policy "invoices_insert"
  on invoices for insert
  with check (auth_role() in ('owner', 'accountant', 'receptionist'));

create policy "invoices_update"
  on invoices for update
  using (auth_role() in ('owner', 'accountant'))
  with check (auth_role() in ('owner', 'accountant'));

create policy "invoices_delete"
  on invoices for delete
  using (auth_role() = 'owner');

-- ------------------------------------------------------------
-- payments
-- Owner + Accountant: CRUD كامل | Receptionist: لا وصول
-- ------------------------------------------------------------
create policy "payments_select"
  on payments for select
  using (auth_role() in ('owner', 'accountant'));

create policy "payments_insert"
  on payments for insert
  with check (auth_role() in ('owner', 'accountant'));

create policy "payments_update"
  on payments for update
  using (auth_role() in ('owner', 'accountant'))
  with check (auth_role() in ('owner', 'accountant'));

create policy "payments_delete"
  on payments for delete
  using (auth_role() = 'owner');

-- لا سياسة = لا وصول: المستخدم المجهول (anonymous) لا يملك أي صلاحية على أي جدول أعلاه
