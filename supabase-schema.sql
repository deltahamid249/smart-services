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
  customer_name text NOT NULL,
  whatsapp text NOT NULL,
  service text NOT NULL,
  details text NOT NULL,
  status text NOT NULL DEFAULT 'جديد',
  admin_notes text DEFAULT '',
  final_file_url text,
  tracking_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- الأعمدة المطلوبة في حال كان الجدول موجوداً مسبقاً
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS customer_id uuid;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS admin_notes text DEFAULT '';

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS final_file_url text;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS tracking_token text;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();


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


-- =========================================================
-- تفعيل RLS
-- =========================================================

ALTER TABLE public.service_requests
ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- حذف السياسات القديمة
-- =========================================================

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

GRANT EXECUTE
ON FUNCTION public.get_request_by_tracking_token(text)
TO anon, authenticated;


-- =========================================================
-- الصلاحيات الأساسية للجدول
-- =========================================================

REVOKE ALL
ON public.service_requests
FROM anon;

GRANT INSERT
ON public.service_requests
TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.service_requests
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
