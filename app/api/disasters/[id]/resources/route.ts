import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/config/supabase';
import { logger } from '@/lib/utils/logger';
import { geocodeLocation } from '@/lib/services/geocoding';
import { emitRealtimeEvent } from '@/lib/realtime';

// POST a new resource for a specific disaster
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: disaster_id } = params;
        const body = await request.json();
        const { name, location_name, type, description, capacity, contact_info } = body;

        if (!name || typeof name !== 'string' || !location_name || typeof location_name !== 'string' || !type || typeof type !== 'string') {
            return NextResponse.json({ error: 'Name, location_name, and type are required strings' }, { status: 400 });
        }
        
        if (capacity !== undefined && typeof capacity !== 'number') {
            return NextResponse.json({ error: 'Capacity must be a number' }, { status: 400 });
        }
        
        const geocoded = await geocodeLocation(location_name);
        if (!geocoded) {
            return NextResponse.json({ error: `Could not geocode location: "${location_name}"`}, { status: 400 });
        }
        const locationPoint = `POINT(${geocoded.lng} ${geocoded.lat})`;
        
        const resourceData = {
            disaster_id,
            name,
            location_name,
            location: locationPoint,
            type,
            description,
            capacity,
            contact_info,
            status: 'active'
        };
        
        const { data, error } = await supabase
            .from('resources')
            .insert(resourceData)
            .select()
            .single();
        
        if (error) throw error;
        
        logger.info(`Resource created: ${data.id} for disaster ${disaster_id}`);
        
        // Emit a real-time event
        await emitRealtimeEvent('resources_updated', `disaster_${disaster_id}`, { action: 'create', resource: data });
        
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        logger.error(`Create resource for disaster ${params.id} error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 