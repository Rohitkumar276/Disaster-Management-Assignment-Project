-- Drop the existing function to redefine it
DROP FUNCTION IF EXISTS get_nearby_resources(UUID, GEOGRAPHY, INT);

-- Recreate the function with an optional disaster_id_filter
CREATE OR REPLACE FUNCTION get_nearby_resources(
    search_point GEOGRAPHY, 
    radius_meters INT,
    disaster_id_filter UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    disaster_id UUID,
    name TEXT,
    description TEXT,
    type TEXT,
    status TEXT,
    location_name TEXT,
    location GEOGRAPHY(POINT, 4326),
    capacity INT,
    contact_info JSONB,
    created_at TIMESTAMPTZ,
    distance_meters FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.disaster_id,
        r.name,
        r.description,
        r.type,
        r.status,
        r.location_name,
        r.location,
        r.capacity,
        r.contact_info,
        r.created_at,
        ST_Distance(r.location, search_point) AS distance_meters
    FROM
        public.resources AS r
    WHERE
        -- If disaster_id_filter is NULL, this condition is true for all non-null disaster_ids.
        -- If it's not NULL, it filters by the specific disaster ID.
        (r.disaster_id = disaster_id_filter OR disaster_id_filter IS NULL) AND
        ST_DWithin(r.location, search_point, radius_meters)
    ORDER BY
        distance_meters;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_nearby_resources(GEOGRAPHY, INT, UUID) IS 'Finds resources within a given radius. Can be filtered by a specific disaster ID (optional).'; 