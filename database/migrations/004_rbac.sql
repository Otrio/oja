-- RBAC: Add roles and user management
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'sales_agent');

-- Extend profiles table for RBAC
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'sales_agent',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- RLS for profiles: Only admins can add/edit managers, managers can edit their own profile, admins can edit profiles they created
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Managers can edit their own profile" ON profiles
  FOR UPDATE
  USING (id = auth.uid() AND role = 'manager');

CREATE POLICY "Admins can edit profiles they created" ON profiles
  FOR UPDATE
  USING (created_by = auth.uid() AND role = 'manager');

-- RLS for activity_log: Only admins and managers can view logs for users they created or themselves
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs" ON activity_log
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE POLICY "Managers can view their own logs" ON activity_log
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view logs for users they created" ON activity_log
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = user_id AND p.created_by = auth.uid()));
