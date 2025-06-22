import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/config/supabase';
import { logger } from '@/lib/utils/logger';
import { geocodeLocation } from '@/lib/services/geocoding';

export const dynamic = "force-dynamic";

// GET a single disaster by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { data, error } = await supabase
            .from('disasters')
            .select(`
                *,
                reports (*),
                resources (*)
            `)
            .eq('id', id)
            .single();
        
        if (error) {
            logger.error(`Get disaster ${id} error:`, error);
            throw error;
        }

        if (!data) {
            return NextResponse.json({ error: 'Disaster not found' }, { status: 404 });
        }
        
        return NextResponse.json(data);
    } catch (error: any) {
        logger.error('Get disaster by ID API route error:', { message: error.message, stack: error.stack });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT (update) a disaster by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();

        const user = {
            id: request.headers.get('x-user-id') || request.headers.get('x-user') || 'default-user',
            username: request.headers.get('x-user-username') || 'default-user',
            role: request.headers.get('x-user-role') || 'admin',
        };

        const { data: existing, error: fetchError } = await supabase
            .from('disasters')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!existing) return NextResponse.json({ error: 'Disaster not found' }, { status: 404 });

        if (existing.owner_id !== user.id && user.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized to update this disaster' }, { status: 403 });
        }

        const { title, description, tags, location_name } = body;
        const updates: any = {};

        if (title && typeof title === 'string') updates.title = title;
        if (description && typeof description === 'string') updates.description = description;
        if (tags && Array.isArray(tags) && tags.every(t => typeof t === 'string')) {
            updates.tags = tags;
        }

        if (location_name && typeof location_name === 'string' && location_name !== existing.location_name) {
            const geocoded = await geocodeLocation(location_name);
            if (!geocoded) {
                return NextResponse.json({ error: `Could not geocode new location: "${location_name}"` }, { status: 400 });
            }
            updates.location_name = location_name;
            updates.location = `POINT(${geocoded.lng} ${geocoded.lat})`;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
        }

        const newAuditEntry = {
            action: 'update',
            user_id: user.id,
            timestamp: new Date().toISOString(),
            changes: Object.keys(updates)
        };
        updates.audit_trail = [...(existing.audit_trail || []), newAuditEntry];

        const { data, error } = await supabase
            .from('disasters')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        
        logger.info(`Disaster ${id} updated successfully`);
        
        return NextResponse.json(data);
    } catch (error: any) {
        logger.error(`Update disaster ${params.id} API error:`, { message: error.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE a disaster by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const user = {
            id: request.headers.get('x-user-id') || request.headers.get('x-user') || 'default-user',
            username: request.headers.get('x-user-username') || 'default-user',
            role: request.headers.get('x-user-role') || 'admin',
        };

        const { data: existing, error: fetchError } = await supabase
            .from('disasters')
            .select('owner_id, title')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!existing) return NextResponse.json({ error: 'Disaster not found' }, { status: 404 });
        
        if (existing.owner_id !== user.id && user.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized to delete this disaster' }, { status: 403 });
        }

        const { error } = await supabase
            .from('disasters')
            .delete()
            .eq('id', id);

        if (error) throw error;

        logger.info(`Disaster ${id} deleted successfully`);

        return NextResponse.json({ message: `Disaster ${id} deleted` });
    } catch (error: any) {
        logger.error(`Delete disaster ${params.id} API error:`, { message: error.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 