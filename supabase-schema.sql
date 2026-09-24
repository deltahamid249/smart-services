-- كود إنشاء وتهيئة قاعدة بيانات منصة الحلول التقنية الذكية في Supabase
-- قم بنسخ هذا الكود ولصقه في Supabase > SQL Editor > Run

create table if not exists profiles (
  id uuid primary key,
  full_name text not null,
  whatsapp text,
  role text not null default 'customer',
  created_at timestamptz default now()
);

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  customer_name text not null,
  whatsapp text not null,
  service text not null,
  details text not null,
  status text not null default 'جديد',
  admin_notes text default '',
  final_file_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- إضافة عمود admin_notes إن لم يكن موجوداً
alter table service_requests add column if not exists admin_notes text default '';

-- فهارس لتسريع البحث والاستعلام
create index if not exists service_requests_status_idx on service_requests(status);
create index if not exists service_requests_customer_idx on service_requests(customer_id);
create index if not exists service_requests_created_idx on service_requests(created_at desc);

-- تفعيل سياسات الأمان على مستوى الصفوف (RLS)
alter table service_requests enable row level security;

-- حذف السياسات القديمة إن وجدت لتجنب التكرار
drop policy if exists "Allow public to insert requests" on service_requests;
drop policy if exists "Allow public read access" on service_requests;
drop policy if exists "Allow public update requests" on service_requests;
drop policy if exists "Allow public delete requests" on service_requests;

-- السماح لجميع الزوار بإرسال طلباتهم
create policy "Allow public to insert requests" 
  on service_requests 
  for insert 
  with check (true);

-- السماح بقراءة الطلبات
create policy "Allow public read access" 
  on service_requests 
  for select 
  using (true);

-- السماح بتحديث الطلبات (الحالة والملاحظات)
create policy "Allow public update requests" 
  on service_requests 
  for update 
  using (true)
  with check (true);

-- السماح بحذف الطلبات من الإدارة
create policy "Allow public delete requests" 
  on service_requests 
  for delete 
  using (true);

-- تفعيل ميزة البث المباشر اللحظي (Supabase Realtime)
-- حتى يظهر أي طلب جديد فورياً في صفحة الإدارة لحظة إرساله
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and tablename = 'service_requests'
  ) then
    alter publication supabase_realtime add table service_requests;
  end if;
end $$;
