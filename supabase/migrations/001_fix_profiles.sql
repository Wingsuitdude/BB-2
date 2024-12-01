-- Drop existing tables if they exist
DROP TABLE IF EXISTS profile_activity;
DROP TABLE IF EXISTS profile_endorsements;
DROP TABLE IF EXISTS profile_connections;
DROP TABLE IF EXISTS profiles;

-- Create profiles table with all required fields
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

-- Create profile connections table
CREATE TABLE profile_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

-- Create profile endorsements table
CREATE TABLE profile_endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill TEXT NOT NULL,
  endorser_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(endorser_id, profile_id, skill)
);

-- Create profile activity table
CREATE TABLE profile_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profile_connections_updated_at
  BEFORE UPDATE ON profile_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_activity ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT TO public
USING (true);

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO public
USING (true)
WITH CHECK (true);

-- Create indexes
CREATE INDEX profiles_address_idx ON profiles(address);
CREATE INDEX profile_connections_requester_idx ON profile_connections(requester_id);
CREATE INDEX profile_connections_receiver_idx ON profile_connections(receiver_id);
CREATE INDEX profile_endorsements_profile_idx ON profile_endorsements(profile_id);
CREATE INDEX profile_activity_profile_idx ON profile_activity(profile_id);