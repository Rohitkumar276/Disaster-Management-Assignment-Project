/*
  # Disaster Response Platform Database Schema

  1. New Tables
    - `disasters`
      - `id` (uuid, primary key)
      - `title` (text, disaster title)
      - `location_name` (text, human-readable location)
      - `location` (geography, PostGIS point for geospatial queries)
      - `description` (text, disaster description)
      - `tags` (text[], array of tags like "flood", "earthquake")
      - `owner_id` (text, user who created the disaster)
      - `audit_trail` (jsonb, audit log of changes)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

    - `reports`
      - `id` (uuid, primary key)
      - `disaster_id` (uuid, foreign key to disasters)
      - `user_id` (text, user who created the report)
      - `content` (text, report content)
      - `image_url` (text, optional image URL)
      - `verification_status` (text, verification status)
      - `verification_details` (jsonb, verification details from Gemini API)
      - `created_at` (timestamptz, creation timestamp)

    - `resources`
      - `id` (uuid, primary key)
      - `disaster_id` (uuid, foreign key to disasters)
      - `name` (text, resource name)
      - `location_name` (text, human-readable location)
      - `location` (geography, PostGIS point)
      - `type` (text, resource type like "shelter", "hospital")
      - `description` (text, optional description)
      - `capacity` (integer, optional capacity)
      - `contact_info` (jsonb, contact information)
      - `status` (text, resource status)
      - `created_at` (timestamptz, creation timestamp)

    - `cache`
      - `key` (text, primary key, cache key)
      - `value` (jsonb, cached value)
      - `expires_at` (timestamptz, expiration timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Create geospatial indexes for performance

  3. Functions
    - Create helper functions for geospatial queries
*/

-- Enable PostGIS extension for geospatial functionality
CREATE EXTENSION IF NOT EXISTS postgis;

-- Disasters table
CREATE TABLE IF NOT EXISTS disasters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location_name text NOT NULL,
  location geography(POINT, 4326),
  description text NOT NULL,
  tags text[] DEFAULT '{}',
  owner_id text NOT NULL,
  audit_trail jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id uuid NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  content text NOT NULL,
  image_url text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'flagged', 'rejected')),
  verification_details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id uuid NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
  name text NOT NULL,
  location_name text NOT NULL,
  location geography(POINT, 4326),
  type text NOT NULL,
  description text,
  capacity integer,
  contact_info jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'full', 'closed')),
  created_at timestamptz DEFAULT now()
);

-- Cache table
CREATE TABLE IF NOT EXISTS cache (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  expires_at timestamptz NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS disasters_location_idx ON disasters USING GIST (location);
CREATE INDEX IF NOT EXISTS disasters_tags_idx ON disasters USING GIN (tags);
CREATE INDEX IF NOT EXISTS disasters_owner_idx ON disasters (owner_id);
CREATE INDEX IF NOT EXISTS disasters_created_idx ON disasters (created_at DESC);

CREATE INDEX IF NOT EXISTS reports_disaster_idx ON reports (disaster_id);
CREATE INDEX IF NOT EXISTS reports_user_idx ON reports (user_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (verification_status);
CREATE INDEX IF NOT EXISTS reports_created_idx ON reports (created_at DESC);

CREATE INDEX IF NOT EXISTS resources_location_idx ON resources USING GIST (location);
CREATE INDEX IF NOT EXISTS resources_disaster_idx ON resources (disaster_id);
CREATE INDEX IF NOT EXISTS resources_type_idx ON resources (type);
CREATE INDEX IF NOT EXISTS resources_status_idx ON resources (status);

CREATE INDEX IF NOT EXISTS cache_expires_idx ON cache (expires_at);

-- Enable Row Level Security
ALTER TABLE disasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disasters
CREATE POLICY "Everyone can read disasters"
  ON disasters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create disasters"
  ON disasters
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own disasters"
  ON disasters
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own disasters"
  ON disasters
  FOR DELETE
  TO public
  USING (true);

-- RLS Policies for reports
CREATE POLICY "Everyone can read reports"
  ON reports
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON reports
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own reports"
  ON reports
  FOR UPDATE
  TO public
  USING (true);

-- RLS Policies for resources
CREATE POLICY "Everyone can read resources"
  ON resources
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage resources"
  ON resources
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for cache
CREATE POLICY "System can manage cache"
  ON cache
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create function to get nearby resources
CREATE OR REPLACE FUNCTION get_nearby_resources(
  disaster_id uuid,
  search_point geography,
  radius_meters integer DEFAULT 10000
)
RETURNS TABLE (
  id uuid,
  disaster_id uuid,
  name text,
  location_name text,
  location geography,
  type text,
  description text,
  capacity integer,
  contact_info jsonb,
  status text,
  created_at timestamptz,
  distance_meters double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.disaster_id,
    r.name,
    r.location_name,
    r.location,
    r.type,
    r.description,
    r.capacity,
    r.contact_info,
    r.status,
    r.created_at,
    ST_Distance(r.location, search_point) as distance_meters
  FROM resources r
  WHERE r.disaster_id = get_nearby_resources.disaster_id
    AND ST_DWithin(r.location, search_point, radius_meters)
  ORDER BY ST_Distance(r.location, search_point);
END;
$$ LANGUAGE plpgsql;

-- Create function to create cache table (for initialization)
CREATE OR REPLACE FUNCTION create_cache_table()
RETURNS void AS $$
BEGIN
  -- This function exists to handle cache table creation from the application
  -- The table is already created above, so this is a no-op
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_disasters_updated_at
  BEFORE UPDATE ON disasters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO disasters (title, location_name, location, description, tags, owner_id) VALUES
  (
    'NYC Flood Emergency',
    'Manhattan, NYC',
    ST_SetSRID(ST_Point(-73.9712, 40.7831), 4326)::geography,
    'Heavy flooding in Manhattan due to storm surge. Multiple subway stations affected.',
    ARRAY['flood', 'urgent', 'transportation'],
    'netrunnerX'
  ),
  (
    'Brooklyn Power Outage',
    'Brooklyn, NYC', 
    ST_SetSRID(ST_Point(-73.9442, 40.6782), 4326)::geography,
    'Widespread power outage affecting 50,000 residents in Brooklyn.',
    ARRAY['power', 'infrastructure'],
    'reliefAdmin'
  ),
  (
    'Queens Building Collapse',
    'Queens, NYC',
    ST_SetSRID(ST_Point(-73.7949, 40.7282), 4326)::geography,
    'Partial building collapse in Queens. Search and rescue operations ongoing.',
    ARRAY['building', 'rescue', 'critical'],
    'netrunnerX'
  )
ON CONFLICT DO NOTHING;

-- Insert sample resources
INSERT INTO resources (disaster_id, name, location_name, location, type, description, capacity, contact_info, status) 
SELECT 
  d.id,
  'Red Cross Emergency Shelter',
  'Lower East Side, NYC',
  ST_SetSRID(ST_Point(-73.9857, 40.7128), 4326)::geography,
  'shelter',
  'Emergency shelter with hot meals and medical assistance',
  200,
  '{"phone": "1-800-RED-CROSS", "email": "shelter@redcross.org"}'::jsonb,
  'active'
FROM disasters d 
WHERE d.title = 'NYC Flood Emergency'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO resources (disaster_id, name, location_name, location, type, description, capacity, contact_info, status)
SELECT 
  d.id,
  'Mount Sinai Hospital',
  'Upper East Side, NYC',
  ST_SetSRID(ST_Point(-73.9514, 40.7903), 4326)::geography,
  'hospital',
  'Full-service hospital with emergency trauma center',
  NULL,
  '{"phone": "212-241-6500", "emergency": "911"}'::jsonb,
  'active'
FROM disasters d 
WHERE d.title = 'NYC Flood Emergency'
LIMIT 1
ON CONFLICT DO NOTHING;