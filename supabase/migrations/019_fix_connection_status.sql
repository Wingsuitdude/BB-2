-- Drop existing policies
DROP POLICY IF EXISTS "View connections" ON connections;
DROP POLICY IF EXISTS "Create connections" ON connections;
DROP POLICY IF EXISTS "Update connections" ON connections;
DROP POLICY IF EXISTS "Delete connections" ON connections;

-- Create simplified policies for connections
CREATE POLICY "View connections"
ON connections FOR SELECT
TO public
USING (true);

CREATE POLICY "Create connections"
ON connections FOR INSERT
TO public
WITH CHECK (
  requester_id IS NOT NULL AND 
  receiver_id IS NOT NULL AND 
  requester_id != receiver_id AND
  NOT EXISTS (
    SELECT 1 FROM connections
    WHERE (requester_id = NEW.requester_id AND receiver_id = NEW.receiver_id)
    OR (requester_id = NEW.receiver_id AND receiver_id = NEW.requester_id)
  )
);

CREATE POLICY "Update connections"
ON connections FOR UPDATE
TO public
USING (true);

CREATE POLICY "Delete connections"
ON connections FOR DELETE
TO public
USING (true);

-- Ensure indexes exist
DROP INDEX IF EXISTS idx_connections_combined;
CREATE INDEX idx_connections_combined 
ON connections(requester_id, receiver_id, status);

-- Clean up any duplicate connections
DELETE FROM connections a
USING connections b
WHERE a.id > b.id
AND (
  (a.requester_id = b.requester_id AND a.receiver_id = b.receiver_id)
  OR
  (a.requester_id = b.receiver_id AND a.receiver_id = b.requester_id)
);

-- Recount all connections
UPDATE profiles p
SET connection_count = (
  SELECT COUNT(*)
  FROM connections c
  WHERE (c.requester_id = p.id OR c.receiver_id = p.id)
  AND c.status = 'accepted'
);