import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/config/supabase';
import { logger } from '@/lib/utils/logger';
import { geocodeLocation } from '@/lib/services/geocoding';

const VALID_STATUSES = ['active', 'inactive', 'maintenance', 'exhausted'];

export const dynamic = "force-dynamic";

// PUT (update) a resource by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const userRole = request.headers.get('x-user-role') || '';
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Only admins can update resources.' }, { status: 403 });
        }
        
        const body = await request.json();
        const { name, location_name, type, description, capacity, contact_info, status } = body;
      
        const updates: any = {};
        if (name && typeof name === 'string') updates.name = name;
        if (type && typeof type === 'string') updates.type = type;
        if (description && typeof description === 'string') updates.description = description;
        if (capacity !== undefined && typeof capacity === 'number') updates.capacity = capacity;
        if (contact_info && typeof contact_info === 'object') updates.contact_info = contact_info;
        
        if (status) {
            if (typeof status !== 'string' || !VALID_STATUSES.includes(status)) {
                return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
            }
            updates.status = status;
        }
        
        if (location_name && typeof location_name === 'string') {
            const geocoded = await geocodeLocation(location_name);
            if (!geocoded) {
                return NextResponse.json({ error: `Could not geocode location: "${location_name}"`}, { status: 400 });
            }
            updates.location_name = location_name;
            updates.location = `POINT(${geocoded.lng} ${geocoded.lat})`;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
        }
        
        const { data, error } = await supabase
            .from('resources')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        
        logger.info(`Resource ${id} updated successfully`);
        
        return NextResponse.json(data);
    } catch (error: any) {
        logger.error(`Update resource ${params.id} error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE a resource by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const userRole = request.headers.get('x-user-role') || '';
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Only admins can delete resources.' }, { status: 403 });
        }

        const { data: existing, error: fetchError } = await supabase
            .from('resources')
            .select('disaster_id')
            .eq('id', id)
            .single();
        
        if (fetchError) throw fetchError;
        if (!existing) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        
        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        logger.info(`Resource ${id} deleted successfully`);
        
        return NextResponse.json({ message: `Resource ${id} deleted` });
    } catch (error: any) {
        logger.error(`Delete resource ${params.id} error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 