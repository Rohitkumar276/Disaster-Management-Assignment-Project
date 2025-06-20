import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/config/supabase';
import { logger } from '@/lib/utils/logger';

// PUT (update) a report's status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        
        const user = {
            id: request.headers.get('x-user-id') || 'mock-user-id',
            username: request.headers.get('x-user-username') || 'mock-admin',
            role: request.headers.get('x-user-role') || 'admin',
        };

        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
        
        const { verification_status } = body;
        const validStatuses = ['pending', 'verified', 'flagged', 'rejected'];
        
        if (!validStatuses.includes(verification_status)) {
            return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
        }
        
        const { data, error } = await supabase
            .from('reports')
            .update({ verification_status })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        
        logger.info(`Report status updated: ${id} to ${verification_status}`);
        
        // TODO: Re-implement real-time update
        // io.to(`disaster_${data.disaster_id}`).emit('report_status_updated', { report: data });
        
        return NextResponse.json(data);
    } catch (error: any) {
        logger.error(`Update report status for ${params.id} error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 