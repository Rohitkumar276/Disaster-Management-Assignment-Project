import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance;

const getSupabase = () => {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://your-project.supabase.co' || 
        supabaseKey === 'your-anon-key') {
      logger.error('❌ Supabase credentials not configured properly!');
      logger.error('Environment variables missing:');
      logger.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
      logger.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
      
      // Create a dummy client that will fail gracefully with clear error messages
      supabaseInstance = {
        from: (table: string) => ({
          select: () => Promise.resolve({ 
            data: null, 
            error: { 
              message: `Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.`,
              details: 'Missing environment variables'
            } 
          }),
          insert: () => Promise.resolve({ 
            data: null, 
            error: { 
              message: `Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.`,
              details: 'Missing environment variables'
            } 
          }),
          update: () => Promise.resolve({ 
            data: null, 
            error: { 
              message: `Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.`,
              details: 'Missing environment variables'
            } 
          }),
          delete: () => Promise.resolve({ 
            data: null, 
            error: { 
              message: `Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.`,
              details: 'Missing environment variables'
            } 
          }),
          eq: () => supabaseInstance.from(table),
          contains: () => supabaseInstance.from(table),
          order: () => supabaseInstance.from(table),
          range: () => supabaseInstance.from(table),
          limit: () => supabaseInstance.from(table),
          single: () => Promise.resolve({ 
            data: null, 
            error: { 
              message: `Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.`,
              details: 'Missing environment variables'
            } 
          })
        }),
        rpc: () => Promise.resolve({ 
          data: null, 
          error: { 
            message: `Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.`,
            details: 'Missing environment variables'
          } 
        })
      };
    } else {
      logger.info('✅ Supabase credentials found, creating client.');
      supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }
    return supabaseInstance;
}

export const supabase = getSupabase();

// Test connection
export const testConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://your-project.supabase.co' || 
        supabaseKey === 'your-anon-key') {
      logger.error('❌ Cannot test connection - Supabase not configured');
      return {
        success: false,
        error: 'Missing environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          url: supabaseUrl || 'Not set',
          key: supabaseKey ? 'Set' : 'Not set'
        }
      };
    }

    const { data, error } = await supabase.from('disasters').select('count').limit(1); 
    if (error) throw error;
    logger.info('✅ Supabase connection successful');
    return { success: true, data };
  } catch (error) {
    logger.error('❌ Supabase connection failed:', error.message);
    return {
      success: false,
      error: error.message,
      details: 'Database connection failed'
    };
  }
}; 