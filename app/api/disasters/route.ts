import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/config/supabase';
import { logger } from '@/lib/utils/logger';
import { geocodeLocation } from '@/lib/services/geocoding';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const owner_id = searchParams.get('owner_id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('disasters')
      .select(`
        *,
        reports (count),
        resources (count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    
    if (owner_id) {
      query = query.eq('owner_id', owner_id);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      logger.error('Get disasters error:', error);
      throw error;
    }
    
    logger.info(`Retrieved ${data?.length || 0} disasters`);
    return NextResponse.json({
      disasters: data || [],
      pagination: {
        page,
        limit,
        total: count,
      }
    });
  } catch (error: any) {
    logger.error('Get disasters API route error:', { message: error.message, stack: error.stack });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    try {
        const user = {
            id: request.headers.get('x-user-id') || request.headers.get('x-user') || 'default-user',
            username: request.headers.get('x-user-username') || 'default-user',
            role: request.headers.get('x-user-role') || 'admin', // Assume admin for now
        };
        
        if (user.role !== 'admin') {
            logger.warn(`Non-admin user ${user.username} attempted to create disaster`);
            return NextResponse.json({ 
                error: 'Access denied. Only administrators can report disasters.',
            }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, tags = [], location_name } = body;
        const owner_id = user.id;

        if (!title || !description || !location_name) {
            return NextResponse.json({ error: 'Title, description, and location_name are required' }, { status: 400 });
        }
        
        if (!Array.isArray(tags) || !tags.every(t => typeof t === 'string')) {
            return NextResponse.json({ error: 'Tags must be an array of strings' }, { status: 400 });
        }
        
        const geocoded = await geocodeLocation(location_name);
        if (!geocoded) {
            return NextResponse.json({ error: `Could not geocode location: "${location_name}"` }, { status: 400 });
        }
        
        const locationPoint = `POINT(${geocoded.lng} ${geocoded.lat})`;
        
        const disasterData = {
            title,
            description,
            tags,
            location_name,
            location: locationPoint,
            owner_id,
            audit_trail: [{
                action: 'create',
                user_id: owner_id,
                timestamp: new Date().toISOString()
            }]
        };
        
        const { data, error } = await supabase
            .from('disasters')
            .insert(disasterData)
            .select()
            .single();
        
        if (error) {
            logger.error('Create disaster error:', error);
            throw error;
        }
        
        logger.info(`Disaster created by admin ${user.username}: ${data.id}`);
        
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        logger.error('Create disaster API route error:', { message: error.message, stack: error.stack });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 