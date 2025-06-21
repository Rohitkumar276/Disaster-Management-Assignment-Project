import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { fetchOfficialUpdates } from '@/lib/services/officialUpdates';
import { supabase } from '@/lib/config/supabase';
import { emitRealtimeEvent } from '@/lib/realtime';

export const revalidate = 0;

// TODO: Replace with a proper real-time solution
const sendRealtimeUpdate = (disasterId: string, data: any) => {
  // io.to(`disaster_${disasterId}`).emit('official_updates_refreshed', data);
  logger.info(`Real-time update for disaster ${disasterId} (not sent)`);
};

export async function GET() {
  logger.info('Running scheduled official updates...');
  
  try {
    const { data: disasters, error } = await supabase
      .from('disasters')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    if (!disasters || disasters.length === 0) {
      logger.info('No active disasters to fetch official updates for.');
      return NextResponse.json({ message: 'No active disasters.' });
    }

    let totalUpdates = 0;
    for (const disaster of disasters) {
      try {
        const updates = await fetchOfficialUpdates(disaster.id);

        if (updates.updates.length > 0) {
          await emitRealtimeEvent('official_updates_refreshed', `disaster_${disaster.id}`, updates);
          logger.debug(`Official updates refreshed for disaster ${disaster.id}: ${updates.updates.length} updates`);
          totalUpdates += updates.updates.length;
        }
      } catch (disasterError) {
        logger.error(`Error processing disaster ${disaster.id} for official updates:`, disasterError);
      }
    }

    const message = `Scheduled official updates completed. Found ${totalUpdates} new updates across ${disasters.length} disasters.`;
    logger.info(message);
    return NextResponse.json({ message });

  } catch (error) {
    logger.error('Scheduled official updates failed:', error);
    return NextResponse.json({ error: 'Failed to fetch official updates' }, { status: 500 });
  }
} 