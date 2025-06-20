-- Create the cache table for API responses
CREATE TABLE public.cache (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Create an index on the expiry time for efficient cleanup
CREATE INDEX cache_expires_at_idx ON public.cache(expires_at);

COMMENT ON TABLE public.cache IS 'Stores cached responses from external APIs to reduce latency and rate limit usage.'; 