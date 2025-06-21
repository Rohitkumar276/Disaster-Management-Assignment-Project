import { NextResponse } from 'next/server';
import { supabase } from '@/lib/config/supabase';
import { logger } from '@/lib/utils/logger';

export async function GET() {
  try {
    logger.info('Testing backend API route...');
    
    // Test Supabase connection
    const { data, error } = await supabase
      .from('disasters')
      .select('count')
      .limit(1);
    
    if (error) {
      logger.error('Supabase connection failed:', error);
      return NextResponse.json({
        status: 'error',
        message: 'Backend is running but Supabase connection failed',
        error: error.message,
        env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
        }
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Backend is working correctly',
      supabase: 'Connected',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    logger.error('Test API route error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Backend test failed',
      error: error.message
    }, { status: 500 });
  }
} 