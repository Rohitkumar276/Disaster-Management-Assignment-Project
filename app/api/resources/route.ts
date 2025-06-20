import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/config/supabase';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const disasterId = searchParams.get('disaster_id');
        const lat = searchParams.get('lat');
        const lon = searchParams.get('lon');
        const radius = searchParams.get('radius') || '10000'; // 10km default

        let query;

        if (lat && lon) {
            // Location-based search (potentially across all disasters)
            const point = `POINT(${lon} ${lat})`;
            query = supabase.rpc('get_nearby_resources', {
                // The RPC function needs to handle a null disaster_id if we want a global search
                disaster_id_filter: disasterId,
                search_point: point,
                radius_meters: parseInt(radius, 10)
            });
        } else if (disasterId) {
            // Standard query by disaster_id
            query = supabase
                .from('resources')
                .select('*')
                .eq('disaster_id', disasterId)
                .order('created_at', { ascending: false });
        } else {
            // Return all resources if no filter is specified
            query = supabase
                .from('resources')
                .select('*')
                .order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;

        logger.info(`Retrieved ${data?.length || 0} resources.`);
        return NextResponse.json(data || []);
    } catch (error: any) {
        logger.error(`Get resources API error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 