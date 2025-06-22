import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { fetchOfficialUpdates } from '@/lib/services/officialUpdates';
import { supabase } from '@/lib/config/supabase';

export const revalidate = 0;

// TODO: Replace with a proper real-time solution
const sendRealtimeUpdate = (disasterId: string, data: any) => {
  // io.to(`disaster_${disasterId}`).emit('official_updates_refreshed', data);
  logger.info(`Real-time update for disaster ${disasterId} (not sent)`);
};

export async function GET() {
    try {
        logger.info('Starting official updates refresh...');
        
        // Get all active disasters
        const { data: disasters, error: disastersError } = await supabase
            .from('disasters')
            .select('id, title, location')
            .eq('status', 'active');
            
        if (disastersError) {
            logger.error('Error fetching disasters:', disastersError);
            return NextResponse.json({ error: 'Failed to fetch disasters' }, { status: 500 });
        }
        
        if (!disasters || disasters.length === 0) {
            logger.info('No active disasters found');
            return NextResponse.json({ message: 'No active disasters to update' });
        }
        
        let totalUpdates = 0;
        const results = [];
        
        for (const disaster of disasters) {
            try {
                logger.debug(`Fetching official updates for disaster: ${disaster.title} (${disaster.id})`);
                
                const updates = await fetchOfficialUpdates(disaster.location, disaster.title);
                
                if (updates.updates.length > 0) {
                    // await emitRealtimeEvent('official_updates_refreshed', `disaster_${disaster.id}`, updates);
                    logger.debug(`Official updates refreshed for disaster ${disaster.id}: ${updates.updates.length} updates`);
                    totalUpdates += updates.updates.length;
                    
                    // Store updates in database
                    const { error: insertError } = await supabase
                        .from('official_updates')
                        .insert({
                            disaster_id: disaster.id,
                            updates: updates.updates,
                            source: updates.source,
                            fetched_at: new Date().toISOString()
                        });
                        
                    if (insertError) {
                        logger.error(`Error storing updates for disaster ${disaster.id}:`, insertError);
                    }
                    
                    results.push({
                        disaster_id: disaster.id,
                        disaster_title: disaster.title,
                        updates_count: updates.updates.length,
                        source: updates.source
                    });
                }
            } catch (error: any) {
                logger.error(`Error processing disaster ${disaster.id}:`, error.message);
                results.push({
                    disaster_id: disaster.id,
                    disaster_title: disaster.title,
                    error: error.message
                });
            }
        }
        
        logger.info(`Official updates refresh completed. Total updates: ${totalUpdates}`);
        
        return NextResponse.json({
            message: 'Official updates refreshed successfully',
            total_updates: totalUpdates,
            disasters_processed: disasters.length,
            results
        });
        
    } catch (error: any) {
        logger.error('Official updates refresh error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 