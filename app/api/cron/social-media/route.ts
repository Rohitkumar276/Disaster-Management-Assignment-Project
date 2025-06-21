import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { fetchSocialMediaReports } from '@/lib/services/socialMedia';
import { supabase } from '@/lib/config/supabase';
import { emitRealtimeEvent } from '@/lib/realtime';

export const revalidate = 0;

// TODO: Replace with a proper real-time solution (e.g., Supabase Realtime)
// This function would be responsible for sending updates to clients
const sendRealtimeUpdate = (disasterId: string, data: any) => {
  // io.to(`disaster_${disasterId}`).emit('social_media_updated', data);
  logger.info(`Real-time update for disaster ${disasterId} (not sent)`);
};

export async function GET() {
  logger.info('Running scheduled social media update...');

  try {
    const { data: disasters, error } = await supabase
      .from('disasters')
      .select('id, tags')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    if (!disasters || disasters.length === 0) {
      logger.info('No active disasters to update.');
      return NextResponse.json({ message: 'No active disasters to update.' });
    }

    let totalReports = 0;
    for (const disaster of disasters) {
      try {
        const reports = await fetchSocialMediaReports(disaster.id, disaster.tags);
        
        if (reports.posts.length > 0) {
          await emitRealtimeEvent('social_media_updated', `disaster_${disaster.id}`, reports);
          logger.debug(`Social media updated for disaster ${disaster.id}: ${reports.posts.length} posts`);
          totalReports += reports.posts.length;
        }
      } catch (disasterError) {
        logger.error(`Error processing disaster ${disaster.id} for social media updates:`, disasterError);
      }
    }
    
    const message = `Scheduled social media update completed. Found ${totalReports} new reports across ${disasters.length} disasters.`;
    logger.info(message);
    return NextResponse.json({ message });

  } catch (error) {
    logger.error('Scheduled social media update failed:', error);
    return NextResponse.json({ error: 'Failed to update social media reports' }, { status: 500 });
  }
} 