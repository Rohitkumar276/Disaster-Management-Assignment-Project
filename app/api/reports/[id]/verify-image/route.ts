import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/config/supabase';
import { logger } from '@/lib/utils/logger';
import { verifyImage } from '@/lib/services/gemini';

export const dynamic = "force-dynamic";

// POST to verify an image for a specific report
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: reportId } = params;

        const { data: report, error: fetchError } = await supabase
            .from('reports')
            .select('*')
            .eq('id', reportId)
            .single();
        
        if (fetchError) throw fetchError;
        if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        if (!report.image_url) return NextResponse.json({ error: 'No image to verify' }, { status: 400 });
        
        const verification = await verifyImage(report.image_url, report.content);
        
        const { data, error } = await supabase
            .from('reports')
            .update({
                verification_status: verification.authentic ? 'verified' : 'flagged',
                verification_details: verification
            })
            .eq('id', reportId)
            .select()
            .single();
        
        if (error) throw error;
        
        logger.info(`Image verification completed for report ${reportId}`);
        
        return NextResponse.json({ verification });
    } catch (error: any) {
        logger.error(`Verify image for report ${params.id} error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 