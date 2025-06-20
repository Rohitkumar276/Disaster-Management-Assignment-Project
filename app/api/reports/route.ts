import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/config/supabase';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const disasterId = searchParams.get('disaster_id');
    const userId = searchParams.get('user_id');
    const status = searchParams.get('verification_status');

    let query = supabase.from('reports').select('*');

    if (disasterId) {
      query = query.eq('disaster_id', disasterId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (status) {
      query = query.eq('verification_status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      logger.error('Get reports error:', error);
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    logger.error('Get reports API route error:', { message: error.message, stack: error.stack });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 