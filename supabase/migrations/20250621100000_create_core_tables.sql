-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Create the disasters table
CREATE TABLE public.disasters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    location_name TEXT,
    location GEOGRAPHY(POINT, 4326),
    description TEXT,
    tags TEXT[],
    owner_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    audit_trail JSONB
);

-- Create the reports table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES public.disasters(id) ON DELETE CASCADE,
    user_id TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    verification_status TEXT DEFAULT 'pending',
    verification_details JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create the resources table
CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES public.disasters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT,
    status TEXT DEFAULT 'active',
    location_name TEXT,
    location GEOGRAPHY(POINT, 4326),
    capacity INT,
    contact_info JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Geospatial and other indexes for performance
CREATE INDEX disasters_location_idx ON public.disasters USING GIST (location);
CREATE INDEX resources_location_idx ON public.resources USING GIST (location);
CREATE INDEX disasters_tags_idx ON public.disasters USING GIN (tags);
CREATE INDEX reports_disaster_id_idx ON public.reports(disaster_id);
CREATE INDEX resources_disaster_id_idx ON public.resources(disaster_id);

-- Add comments to tables and columns
COMMENT ON TABLE public.disasters IS 'Stores information about disaster events.';
COMMENT ON TABLE public.reports IS 'Stores citizen reports related to disasters.';
COMMENT ON TABLE public.resources IS 'Stores information about available resources like shelters and hospitals.';
COMMENT ON COLUMN public.disasters.audit_trail IS 'Tracks changes to a disaster record.'; 