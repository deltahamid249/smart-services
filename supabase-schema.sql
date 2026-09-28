-- =========================================================
-- قاعدة بيانات منصة الحلول التقنية الذكية
-- الإصدار الآمن
-- =========================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL,
  whatsapp text,
  role text NOT NULL DEFAULT 'customer',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  legacy_id text,
  legacy_customer_id text,
  customer_name text NOT NULL,
  customer_email text,
  whatsapp text NOT NULL,
  service text NOT NULL,
  details text NOT NULL,
  urgency text NOT NULL DEFAULT 'عادي',
  status text NOT NULL DEFAULT 'جديد',
  estimated_price numeric,
  final_price numeric,
  currency text NOT NULL DEFAULT 'SDG',
  payment_status text NOT NULL DEFAULT 'بانتظار التسعير',
  admin_notes text DEFAULT '',
  final_file_url text,
  delivery_notes text,
  assigned_to text,
  tracking_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- الأعمدة المطلوبة في حال كان الجدول موجوداً مسبقاً
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS customer_id uuid;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS legacy_id text;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS legacy_customer_id text;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS customer_email text;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS urgency text NOT NULL DEFAULT 'عادي';

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS estimated_price numeric;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS final_price numeric;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'SDG';

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'بانتظار التسعير';

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS admin_notes text DEFAULT '';

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS final_file_url text;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS delivery_notes text;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS assigned_to text;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS tracking_token text;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- حفظ سجل النشاط والإشعارات المنقولة من قاعدة D1.
CREATE TABLE IF NOT EXISTS public.request_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  request_id uuid REFERENCES public.service_requests(id) ON DELETE SET NULL,
  legacy_request_id text,
  actor_name text NOT NULL,
  actor_role text NOT NULL DEFAULT 'system',
  action text NOT NULL,
  details text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  recipient_whatsapp text,
  customer_id uuid,
  legacy_customer_id text,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);


-- =========================================================
-- الفهارس
-- =========================================================

CREATE INDEX IF NOT EXISTS service_requests_status_idx
ON service_requests(status);

CREATE INDEX IF NOT EXISTS service_requests_customer_idx
ON service_requests(customer_id);

CREATE INDEX IF NOT EXISTS service_requests_created_idx
ON service_requests(created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS service_requests_tracking_token_idx
ON service_requests(tracking_token)
WHERE tracking_token IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS service_requests_legacy_id_idx
ON service_requests(legacy_id)
WHERE legacy_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS request_activity_logs_request_idx
ON public.request_activity_logs(request_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_customer_idx
ON public.notifications(customer_id, created_at DESC);


-- =========================================================
-- دالة التحقق من المدير
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- إنشاء الطلب عبر دالة موثوقة؛ لا تمنح العميل صلاحية قراءة الصف بعد الإدراج.
CREATE OR REPLACE FUNCTION public.create_service_request(
  p_customer_name text,
  p_whatsapp text,
  p_service text,
  p_details text,
  p_tracking_token text
)
RETURNS TABLE (
  id uuid,
  customer_id uuid,
  customer_name text,
  whatsapp text,
  service text,
  details text,
  status text,
  admin_notes text,
  final_file_url text,
  tracking_token text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted public.service_requests%ROWTYPE;
BEGIN
  IF NULLIF(btrim(p_customer_name), '') IS NULL
     OR NULLIF(btrim(p_whatsapp), '') IS NULL
     OR NULLIF(btrim(p_service), '') IS NULL
     OR NULLIF(btrim(p_details), '') IS NULL
     OR NULLIF(btrim(p_tracking_token), '') IS NULL THEN
    RAISE EXCEPTION 'Required request fields are missing';
  END IF;

  INSERT INTO public.service_requests (
    customer_name,
    whatsapp,
    service,
    details,
    status,
    admin_notes,
    tracking_token
  )
  VALUES (
    btrim(p_customer_name),
    btrim(p_whatsapp),
    btrim(p_service),
    btrim(p_details),
    'جديد',
    '',
    btrim(p_tracking_token)
  )
  RETURNING * INTO inserted;

  RETURN QUERY
  SELECT
    inserted.id,
    inserted.customer_id,
    inserted.customer_name,
    inserted.whatsapp,
    inserted.service,
    inserted.details,
    inserted.status,
    inserted.admin_notes,
    inserted.final_file_url,
    inserted.tracking_token,
    inserted.created_at,
    inserted.updated_at;
END;
$$;


-- =========================================================
-- تفعيل RLS
-- =========================================================

ALTER TABLE public.profiles
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.service_requests
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.request_activity_logs
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications
ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- حذف السياسات القديمة
-- =========================================================

DROP POLICY IF EXISTS "Users can read their own profile"
ON public.profiles;

DROP POLICY IF EXISTS "Allow public to insert requests"
ON public.service_requests;

DROP POLICY IF EXISTS "Allow public read access"
ON public.service_requests;

DROP POLICY IF EXISTS "Allow public update requests"
ON public.service_requests;

DROP POLICY IF EXISTS "Allow public delete requests"
ON public.service_requests;

DROP POLICY IF EXISTS "Admins can read all requests"
ON public.service_requests;

DROP POLICY IF EXISTS "Admins can update all requests"
ON public.service_requests;

DROP POLICY IF EXISTS "Admins can delete all requests"
ON public.service_requests;

DROP POLICY IF EXISTS "Public can create requests"
ON public.service_requests;

DROP POLICY IF EXISTS "Admins can read request activity logs"
ON public.request_activity_logs;

DROP POLICY IF EXISTS "Admins can read notifications"
ON public.notifications;


-- =========================================================
-- سياسات الملفات الشخصية
-- =========================================================

CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);


-- =========================================================
-- السماح بإنشاء طلب
-- =========================================================

CREATE POLICY "Public can create requests"
ON public.service_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  customer_id IS NULL
  OR customer_id = auth.uid()
);


-- =========================================================
-- المدير يستطيع رؤية جميع الطلبات
-- =========================================================

CREATE POLICY "Admins can read all requests"
ON public.service_requests
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);


-- =========================================================
-- المدير يستطيع تعديل جميع الطلبات
-- =========================================================

CREATE POLICY "Admins can update all requests"
ON public.service_requests
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);


-- =========================================================
-- المدير يستطيع حذف جميع الطلبات
-- =========================================================

CREATE POLICY "Admins can delete all requests"
ON public.service_requests
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

CREATE POLICY "Admins can read request activity logs"
ON public.request_activity_logs
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can read notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (public.is_admin());


-- =========================================================
-- دالة متابعة الطلب بواسطة الرمز السري
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_request_by_tracking_token(
  p_tracking_token text
)
RETURNS TABLE (
  id uuid,
  customer_id uuid,
  customer_name text,
  whatsapp text,
  service text,
  details text,
  status text,
  admin_notes text,
  final_file_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sr.id,
    sr.customer_id,
    sr.customer_name,
    sr.whatsapp,
    sr.service,
    sr.details,
    sr.status,
    sr.admin_notes,
    sr.final_file_url,
    sr.created_at,
    sr.updated_at
  FROM public.service_requests sr
  WHERE sr.tracking_token = p_tracking_token
  LIMIT 1;
$$;


-- =========================================================
-- السماح باستدعاء دالة المتابعة
-- =========================================================

REVOKE ALL
ON FUNCTION public.create_service_request(text, text, text, text, text)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.create_service_request(text, text, text, text, text)
TO anon, authenticated;

REVOKE ALL
ON FUNCTION public.get_request_by_tracking_token(text)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.get_request_by_tracking_token(text)
TO anon, authenticated;

REVOKE ALL
ON FUNCTION public.is_admin()
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.is_admin()
TO authenticated;


-- =========================================================
-- الصلاحيات الأساسية للجدول
-- =========================================================

REVOKE ALL
ON public.profiles
FROM anon, authenticated;

GRANT SELECT
ON public.profiles
TO authenticated;

REVOKE ALL
ON public.service_requests
FROM PUBLIC;

REVOKE ALL
ON public.service_requests
FROM anon, authenticated;

GRANT SELECT, UPDATE, DELETE
ON public.service_requests
TO authenticated;

REVOKE ALL
ON public.request_activity_logs, public.notifications
FROM PUBLIC;

REVOKE ALL
ON public.request_activity_logs, public.notifications
FROM anon, authenticated;

GRANT SELECT
ON public.request_activity_logs, public.notifications
TO authenticated;


-- =========================================================
-- تفعيل Realtime
-- =========================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'service_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime
    ADD TABLE public.service_requests;
  END IF;
END $$;
