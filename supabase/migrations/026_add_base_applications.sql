-- Create base_applications table
CREATE TABLE base_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_id UUID REFERENCES bases(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(base_id, applicant_id)
);

-- Enable RLS
ALTER TABLE base_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "View applications"
ON base_applications FOR SELECT
TO public
USING (true);

CREATE POLICY "Create applications"
ON base_applications FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Update applications"
ON base_applications FOR UPDATE
TO public
USING (true);

-- Create indexes
CREATE INDEX idx_base_applications_base ON base_applications(base_id);
CREATE INDEX idx_base_applications_applicant ON base_applications(applicant_id);
CREATE INDEX idx_base_applications_status ON base_applications(status);

-- Create trigger for updated_at
CREATE TRIGGER update_base_applications_updated_at
    BEFORE UPDATE ON base_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();