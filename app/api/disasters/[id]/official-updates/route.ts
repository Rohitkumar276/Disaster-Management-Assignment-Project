import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { fetchOfficialUpdates } from '@/lib/services/officialUpdates';

export const revalidate = 0; // Do not cache this endpoint

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: disasterId } = params;
    const { searchParams } = new URL(request.url);
    const sources = searchParams.get('sources')?.split(',');
    
    logger.info(`Fetching on-demand official updates for disaster ${disasterId}`);

    const updates = await fetchOfficialUpdates(disasterId, sources);

    return NextResponse.json(updates);
  } catch (error) {
    logger.error(`On-demand official updates for disaster ${params.id} failed:`, error);
    return NextResponse.json({ error: 'Failed to fetch official updates' }, { status: 500 });
  }
} 