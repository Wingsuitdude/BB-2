-- Add home_base_id to profiles
ALTER TABLE profiles
ADD COLUMN home_base_id UUID REFERENCES bases(id) ON DELETE SET NULL,
ADD COLUMN base_count INTEGER DEFAULT 0;

-- Create function to update base count
CREATE OR REPLACE FUNCTION update_base_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET base_count = base_count + 1
    WHERE id = NEW.profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles 
    SET 
      base_count = GREATEST(base_count - 1, 0),
      home_base_id = CASE 
        WHEN home_base_id = OLD.base_id THEN NULL 
        ELSE home_base_id 
      END
    WHERE id = OLD.profile_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for base count
DROP TRIGGER IF EXISTS base_count_trigger ON base_members;
CREATE TRIGGER base_count_trigger
  AFTER INSERT OR DELETE ON base_members
  FOR EACH ROW
  EXECUTE FUNCTION update_base_count();

-- Update existing base counts
UPDATE profiles p
SET base_count = (
  SELECT COUNT(*)
  FROM base_members bm
  WHERE bm.profile_id = p.id
);