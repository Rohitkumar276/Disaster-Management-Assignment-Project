import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/config/supabase';
import { logger } from '@/lib/utils/logger';
import { verifyImage } from '@/lib/services/gemini';
import { emitRealtimeEvent } from '@/lib/realtime';

// POST a new report for a specific disaster
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: disasterId } = params;
        const body = await request.json();
        const { content, image_url } = body;
        
        const user = {
            id: request.headers.get('x-user-id') || request.headers.get('x-user') || 'default-user',
            username: request.headers.get('x-user-username') || 'default-user',
        };

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required and must be a non-empty string' }, { status: 400 });
        }

        if (image_url) {
            try {
                new URL(image_url);
            } catch (_) {
                return NextResponse.json({ error: 'Invalid image_url format' }, { status: 400 });
            }
        }
        
        let verification_status = 'pending';
        let verification_details = null;
        
        if (image_url) {
            try {
                verification_details = await verifyImage(image_url, content);
                verification_status = verification_details.authentic ? 'verified' : 'flagged';
            } catch (error) {
                logger.warn('Image verification failed during report creation:', error);
                verification_status = 'pending';
            }
        }
        
        const reportData = {
            disaster_id: disasterId,
            user_id: user.id,
            content,
            image_url,
            verification_status,
            verification_details
        };
        
        const { data, error } = await supabase
            .from('reports')
            .insert(reportData)
            .select()
            .single();
        
        if (error) throw error;
        
        logger.info(`Report created: ${data.id} for disaster ${disasterId}`);
        
        // Emit a real-time event
        await emitRealtimeEvent('report_created', `disaster_${disasterId}`, data);
        
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        logger.error(`Create report for disaster ${params.id} error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 