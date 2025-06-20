import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { supabase } from '@/lib/config/supabase';

export const revalidate = 0;

export async function GET() {
  logger.info('Running scheduled cache cleanup...');

  try {
    const { error } = await supabase
      .from('cache')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      throw error;
    }

    logger.info('Cache cleanup completed successfully.');
    return NextResponse.json({ message: 'Cache cleanup completed successfully.' });
  } catch (error) {
    logger.error('Scheduled cache cleanup failed:', error);
    return NextResponse.json({ error: 'Failed to cleanup cache' }, { status: 500 });
  }
} 