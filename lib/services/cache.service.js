import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Retrieves a value from the cache. Returns null if the key is not found or the entry is expired.
 * @param {string} key - The key to look up in the cache.
 * @returns {Promise<any|null>} The cached value or null.
 */
export const getFromCache = async (key) => {
  try {
    const { data, error } = await supabase
      .from('cache')
      .select('value, expires_at')
      .eq('key', key)
      .single();
    
    if (error) {
      // If the table or view does not exist, it's a valid case where cache is not found.
      if (error.code === '42P01') {
        logger.warn(`Cache table not found. Please apply database migrations.`);
        return null;
      }
      throw error;
    }
    
    if (!data) return null;
    
    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      await deleteFromCache(key);
      return null;
    }
    
    return data.value;
  } catch (error) {
    logger.error(`Cache get error for key "${key}":`, error);
    return null;
  }
};

/**
 * Stores a value in the cache with a specific time-to-live (TTL).
 * @param {string} key - The key to store the value under.
 * @param {any} value - The JSON-serializable value to store.
 * @param {number} ttlHours - The time-to-live in hours. Defaults to 1.
 */
export const setCache = async (key, value, ttlHours = 1) => {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);
    
    const { error } = await supabase
      .from('cache')
      .upsert({
        key,
        value,
        expires_at: expiresAt.toISOString()
      });
    
    if (error) throw error;
    logger.info(`Cache set for key: ${key}`);
  } catch (error) {
    logger.error(`Cache set error for key "${key}":`, error);
  }
};

/**
 * Deletes a value from the cache.
 * @param {string} key - The key to delete from the cache.
 */
export const deleteFromCache = async (key) => {
  try {
    const { error } = await supabase.from('cache').delete().eq('key', key);
    if (error) throw error;
  } catch (error) {
    logger.error(`Cache delete error for key "${key}":`, error);
  }
}; 