
-- id_counters
CREATE TABLE public.id_counters (
  role text PRIMARY KEY,
  next_val integer NOT NULL DEFAULT 1001
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.id_counters TO anon, authenticated;
GRANT ALL ON public.id_counters TO service_role;
ALTER TABLE public.id_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open id_counters" ON public.id_counters FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
INSERT INTO public.id_counters(role, next_val) VALUES ('patient',1001),('doctor',1001),('lab',1001),('mrs',1001);

-- users
CREATE TABLE public.users (
  id text PRIMARY KEY,
  role text NOT NULL,
  name text,
  password_hash text,
  mobile text,
  dob text,
  gender text,
  address text,
  reg_number text,
  hospital text,
  email text,
  lab_name text,
  org text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon, authenticated;
GRANT ALL ON public.users TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- diagnoses
CREATE TABLE public.diagnoses (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id text REFERENCES public.users(id) ON DELETE SET NULL,
  title text,
  symptoms text,
  findings text,
  treatment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnoses TO anon, authenticated;
GRANT ALL ON public.diagnoses TO service_role;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open diagnoses" ON public.diagnoses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- lab_reports
CREATE TABLE public.lab_reports (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.users(id) ON DELETE CASCADE,
  lab_id text REFERENCES public.users(id) ON DELETE SET NULL,
  test_name text,
  test_date date,
  summary text,
  status text DEFAULT 'Completed',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_reports TO anon, authenticated;
GRANT ALL ON public.lab_reports TO service_role;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open lab_reports" ON public.lab_reports FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- prescriptions
CREATE TABLE public.prescriptions (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id text REFERENCES public.users(id) ON DELETE SET NULL,
  diagnosis text,
  drugs text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescriptions TO anon, authenticated;
GRANT ALL ON public.prescriptions TO service_role;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open prescriptions" ON public.prescriptions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- medical_docs
CREATE TABLE public.medical_docs (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.users(id) ON DELETE CASCADE,
  staff_id text REFERENCES public.users(id) ON DELETE SET NULL,
  doc_type text,
  doc_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_docs TO anon, authenticated;
GRANT ALL ON public.medical_docs TO service_role;
ALTER TABLE public.medical_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open medical_docs" ON public.medical_docs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- audit_logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  action text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO anon, authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open audit_logs" ON public.audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- RPC
CREATE OR REPLACE FUNCTION public.get_next_id(role_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE next_number integer;
BEGIN
  UPDATE public.id_counters SET next_val = next_val + 1
  WHERE role = role_key
  RETURNING next_val - 1 INTO next_number;
  RETURN next_number;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_next_id(text) TO anon, authenticated;
