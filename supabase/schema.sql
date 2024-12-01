-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in correct order
DROP TABLE IF EXISTS base_members;
DROP TABLE IF EXISTS bases;
DROP TABLE IF EXISTS profile_activity;
DROP TABLE IF EXISTS profile_endorsements;
DROP TABLE IF EXISTS profile_connections;
DROP TABLE IF EXISTS profiles;

-- Create profiles table (enhanced)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  bio TEXT,
  headline TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  location TEXT,
  website TEXT,
  github TEXT,
  twitter TEXT,
  linkedin TEXT,
  skills TEXT[] DEFAULT '{}',
  experience JSONB[] DEFAULT '[]',
  education JSONB[] DEFAULT '[]',
  certifications JSONB[] DEFAULT '[]',
  achievements JSONB[] DEFAULT '[]',
  reputation DECIMAL DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  available_for_work BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bases table
CREATE TABLE bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  skills TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create base members table
CREATE TABLE base_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_id UUID REFERENCES bases(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(base_id, profile_id)
);

-- Profile connections table
CREATE TABLE profile_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

-- Profile endorsements table
CREATE TABLE profile_endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill TEXT NOT NULL,
  endorser_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(endorser_id, profile_id, skill)
);

-- Profile activity table
CREATE TABLE profile_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_bases_updated_at ON bases;
CREATE TRIGGER update_bases_updated_at
  BEFORE UPDATE ON bases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_profile_connections_updated_at ON profile_connections;
CREATE TRIGGER update_profile_connections_updated_at
  BEFORE UPDATE ON profile_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_activity ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Bases policies
CREATE POLICY "Bases are viewable by everyone"
ON bases FOR SELECT
TO public
USING (true);

CREATE POLICY "Verified users can create bases"
ON bases FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = bases.creator_id
    AND profiles.verified = true
  )
);

CREATE POLICY "Base creators can update their bases"
ON bases FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = bases.creator_id
  )
);

-- Base members policies
CREATE POLICY "Base members are viewable by everyone"
ON base_members FOR SELECT
TO public
USING (true);

CREATE POLICY "Verified users can join bases"
ON base_members FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = base_members.profile_id
    AND profiles.verified = true
  )
);

CREATE POLICY "Members can leave bases"
ON base_members FOR DELETE
TO public
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_address_idx ON profiles(address);
CREATE INDEX IF NOT EXISTS bases_creator_idx ON bases(creator_id);
CREATE INDEX IF NOT EXISTS base_members_base_idx ON base_members(base_id);
CREATE INDEX IF NOT EXISTS base_members_profile_idx ON base_members(profile_id);
CREATE INDEX IF NOT EXISTS profile_connections_requester_idx ON profile_connections(requester_id);
CREATE INDEX IF NOT EXISTS profile_connections_receiver_idx ON profile_connections(receiver_id);
CREATE INDEX IF NOT EXISTS profile_endorsements_profile_idx ON profile_endorsements(profile_id);
CREATE INDEX IF NOT EXISTS profile_activity_profile_idx ON profile_activity(profile_id);