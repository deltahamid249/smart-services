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
 final_file_url text,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);

create index if not exists service_requests_status_idx on service_requests(status);
create index if not exists service_requests_customer_idx on service_requests(customer_id);
