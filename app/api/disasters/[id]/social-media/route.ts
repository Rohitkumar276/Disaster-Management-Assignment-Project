import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { fetchSocialMediaReports } from '@/lib/services/socialMedia';
import { supabase } from '@/lib/config/supabase';

export const revalidate = 0; // Do not cache this endpoint

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: disasterId } = params;
    const { searchParams } = new URL(request.url);
    let keywords = searchParams.get('keywords')?.split(',');

    // If no keywords are provided via query param, fetch the disaster's tags as a fallback
    if (!keywords || keywords.length === 0) {
      const { data: disaster, error } = await supabase
        .from('disasters')
        .select('tags')
        .eq('id', disasterId)
        .single();
      
      if (error) throw error;
      if (disaster) {
        keywords = disaster.tags;
      }
    }
    
    logger.info(`Fetching on-demand social media reports for disaster ${disasterId}`);

    const reports = await fetchSocialMediaReports(disasterId, keywords || []);

    return NextResponse.json(reports);
  } catch (error) {
    logger.error(`On-demand social media for disaster ${params.id} failed:`, error);
    return NextResponse.json({ error: 'Failed to fetch social media reports' }, { status: 500 });
  }
} 