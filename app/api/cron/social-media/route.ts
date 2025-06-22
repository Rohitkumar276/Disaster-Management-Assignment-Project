import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { fetchSocialMediaReports } from '@/lib/services/socialMedia';
import { supabase } from '@/lib/config/supabase';

export const revalidate = 0;

// TODO: Replace with a proper real-time solution (e.g., Supabase Realtime)
// This function would be responsible for sending updates to clients
const sendRealtimeUpdate = (disasterId: string, data: any) => {
  // io.to(`disaster_${disasterId}`).emit('social_media_updated', data);
  logger.info(`Real-time update for disaster ${disasterId} (not sent)`);
};

export async function GET() {
    try {
        logger.info('Starting social media monitoring...');
        
        // Get all active disasters
        const { data: disasters, error: disastersError } = await supabase 
            .from('disasters')
            .select('id, title, location, tags')
            .eq('status', 'active');
            
        if (disastersError) {
            logger.error('Error fetching disasters:', disastersError);
            return NextResponse.json({ error: 'Failed to fetch disasters' }, { status: 500 });
        }
        
        if (!disasters || disasters.length === 0) {
            logger.info('No active disasters found');
            return NextResponse.json({ message: 'No active disasters to monitor' });
        }
        
        let totalReports = 0;
        const results = [];
        
        for (const disaster of disasters) {
            try {
                logger.debug(`Monitoring social media for disaster: ${disaster.title} (${disaster.id})`);
                
                // Create keywords from disaster title, location, and tags
                const keywords = [
                    disaster.title,
                    disaster.location,
                    ...(disaster.tags || [])
                ].filter(Boolean);
                
                const reports = await fetchSocialMediaReports(disaster.id, keywords);
                
                if (reports.posts && reports.posts.length > 0) {
                    // await emitRealtimeEvent('social_media_updated', `disaster_${disaster.id}`, reports);
                    logger.debug(`Social media reports found for disaster ${disaster.id}: ${reports.posts.length} reports`);
                    totalReports += reports.posts.length;
                    
                    // Store reports in database
                    const { error: insertError } = await supabase
                        .from('social_media_reports')
                        .insert({
                            disaster_id: disaster.id,
                            reports: reports.posts,
                            fetched_at: new Date().toISOString()
                        });
                        
                    if (insertError) {
                        logger.error(`Error storing social media reports for disaster ${disaster.id}:`, insertError);
                    }
                    
                    results.push({
                        disaster_id: disaster.id,
                        disaster_title: disaster.title,
                        reports_count: reports.posts.length
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
        
        logger.info(`Social media monitoring completed. Total reports: ${totalReports}`);
        
        return NextResponse.json({
            message: 'Social media monitoring completed successfully',
            total_reports: totalReports,
            disasters_processed: disasters.length,
            results
        });
        
    } catch (error: any) {
        logger.error('Social media monitoring error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 