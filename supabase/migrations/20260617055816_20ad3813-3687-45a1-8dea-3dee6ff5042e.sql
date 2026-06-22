
-- 1. Role enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'lab', 'mrs');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 2. has_role + current_profile_id helpers (SECURITY DEFINER avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 3. Clear existing data (no auth.users links) and reset counters
TRUNCATE public.users, public.diagnoses, public.prescriptions, public.lab_reports, public.medical_docs, public.audit_logs;
TRUNCATE public.id_counters;
INSERT INTO public.id_counters(role, next_val) VALUES
  ('patient', 1001), ('doctor', 1001), ('lab', 1001), ('mrs', 1001);

-- 4. Link users to auth.users, drop plaintext password column
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE public.users ADD COLUMN auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1
$$;
REVOKE EXECUTE ON FUNCTION public.current_profile_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_profile_id() TO authenticated, service_role;

-- 5. Lock down get_next_id (server-only)
REVOKE EXECUTE ON FUNCTION public.get_next_id(text) FROM PUBLIC, anon, authenticated;

-- 6. USERS table policies
DROP POLICY IF EXISTS "open users" ON public.users;
REVOKE ALL ON public.users FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

CREATE POLICY "users view self" ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);
CREATE POLICY "staff view patients" ON public.users FOR SELECT TO authenticated
  USING (role = 'Patient' AND (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'lab') OR
    public.has_role(auth.uid(), 'mrs')
  ));
CREATE POLICY "users update self" ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id) WITH CHECK (auth.uid() = auth_user_id);

-- 7. DIAGNOSES policies
DROP POLICY IF EXISTS "open diagnoses" ON public.diagnoses;
REVOKE ALL ON public.diagnoses FROM anon, authenticated;
GRANT SELECT, INSERT ON public.diagnoses TO authenticated;
GRANT ALL ON public.diagnoses TO service_role;

CREATE POLICY "diag patient read" ON public.diagnoses FOR SELECT TO authenticated
  USING (patient_id = public.current_profile_id());
CREATE POLICY "diag doctor read" ON public.diagnoses FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') AND doctor_id = public.current_profile_id());
CREATE POLICY "diag doctor insert" ON public.diagnoses FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'doctor') AND doctor_id = public.current_profile_id());

-- 8. PRESCRIPTIONS policies
DROP POLICY IF EXISTS "open prescriptions" ON public.prescriptions;
REVOKE ALL ON public.prescriptions FROM anon, authenticated;
GRANT SELECT, INSERT ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;

CREATE POLICY "rx patient read" ON public.prescriptions FOR SELECT TO authenticated
  USING (patient_id = public.current_profile_id());
CREATE POLICY "rx doctor read" ON public.prescriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') AND doctor_id = public.current_profile_id());
CREATE POLICY "rx doctor insert" ON public.prescriptions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'doctor') AND doctor_id = public.current_profile_id());

-- 9. LAB_REPORTS policies
DROP POLICY IF EXISTS "open lab_reports" ON public.lab_reports;
REVOKE ALL ON public.lab_reports FROM anon, authenticated;
GRANT SELECT, INSERT ON public.lab_reports TO authenticated;
GRANT ALL ON public.lab_reports TO service_role;

CREATE POLICY "lab patient read" ON public.lab_reports FOR SELECT TO authenticated
  USING (patient_id = public.current_profile_id());
CREATE POLICY "lab staff read" ON public.lab_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'lab') AND lab_id = public.current_profile_id());
CREATE POLICY "lab staff insert" ON public.lab_reports FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'lab') AND lab_id = public.current_profile_id());

-- 10. MEDICAL_DOCS policies
DROP POLICY IF EXISTS "open medical_docs" ON public.medical_docs;
REVOKE ALL ON public.medical_docs FROM anon, authenticated;
GRANT SELECT, INSERT ON public.medical_docs TO authenticated;
GRANT ALL ON public.medical_docs TO service_role;

CREATE POLICY "doc patient read" ON public.medical_docs FOR SELECT TO authenticated
  USING (patient_id = public.current_profile_id());
CREATE POLICY "doc mrs read" ON public.medical_docs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'mrs') AND staff_id = public.current_profile_id());
CREATE POLICY "doc mrs insert" ON public.medical_docs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'mrs') AND staff_id = public.current_profile_id());

-- 11. ID_COUNTERS: server-only
DROP POLICY IF EXISTS "open id_counters" ON public.id_counters;
REVOKE ALL ON public.id_counters FROM anon, authenticated;
GRANT ALL ON public.id_counters TO service_role;

-- 12. AUDIT_LOGS: authenticated can insert their own, no client read
DROP POLICY IF EXISTS "open audit_logs" ON public.audit_logs;
REVOKE ALL ON public.audit_logs FROM anon, authenticated;
GRANT INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

CREATE POLICY "audit self insert" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_profile_id());
