-- Drop existing policies
DROP POLICY IF EXISTS "View connections" ON connections;
DROP POLICY IF EXISTS "Create connections" ON connections;
DROP POLICY IF EXISTS "Update connections" ON connections;

-- Create new policies with proper checks
CREATE POLICY "View connections"
ON connections FOR SELECT
TO public
USING (true);

CREATE POLICY "Create connections"
ON connections FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Update connections"
ON connections FOR UPDATE
TO public
USING (true);

CREATE POLICY "Delete connections"
ON connections FOR DELETE
TO public
USING (true);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_connections_combined 
ON connections(requester_id, receiver_id, status);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_connections_updated_at ON connections;
CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add connection count to profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' 
                  AND column_name = 'connection_count') THEN
        ALTER TABLE profiles ADD COLUMN connection_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create function to update connection count
CREATE OR REPLACE FUNCTION update_connection_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
        UPDATE profiles SET connection_count = connection_count + 1
        WHERE id IN (NEW.requester_id, NEW.receiver_id);
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        UPDATE profiles SET connection_count = connection_count + 1
        WHERE id IN (NEW.requester_id, NEW.receiver_id);
    ELSIF TG_OP = 'UPDATE' AND NEW.status != 'accepted' AND OLD.status = 'accepted' THEN
        UPDATE profiles SET connection_count = GREATEST(connection_count - 1, 0)
        WHERE id IN (NEW.requester_id, NEW.receiver_id);
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
        UPDATE profiles SET connection_count = GREATEST(connection_count - 1, 0)
        WHERE id IN (OLD.requester_id, OLD.receiver_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for connection count
DROP TRIGGER IF EXISTS connection_count_trigger ON connections;
CREATE TRIGGER connection_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_connection_count();