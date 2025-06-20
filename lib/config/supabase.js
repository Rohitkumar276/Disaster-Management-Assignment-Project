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
      logger.error('Please create a .env.local file in the project root with the following variables:');
      logger.error('NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-project-url');
      logger.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key');
      
      // Create a dummy client that will fail gracefully
      supabaseInstance = {
        from: () => ({
          select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
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
      return false;
    }

    const { data, error } = await supabase.from('disasters').select('count').limit(1); 
    if (error) throw error;
    logger.info('✅ Supabase connection successful');
    return true;
  } catch (error) {
    logger.error('❌ Supabase connection failed:', error.message);
    logger.error('Make sure your Supabase project is set up and the database tables exist');
    return false;
  }
}; 