import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';
import { getFromCache, setCache } from './cache.service.js';
import { analyzeContentWithGemini } from './gemini.js';

// Mock official updates data
const mockOfficialUpdates = [
  {
    id: 'fema_001',
    title: 'FEMA Disaster Declaration - NYC Flooding',
    content: 'Federal Emergency Management Agency has declared a major disaster for New York City flooding. Federal aid available to affected residents.',
    source: 'FEMA',
    url: 'https://www.fema.gov/disaster/updates',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    severity: 'high',
    category: 'declaration'
  },
  {
    id: 'redcross_001',
    title: 'Red Cross Opens Additional Shelters',
    content: 'American Red Cross has opened 5 additional emergency shelters in Manhattan and Brooklyn. Capacity for 500 additional evacuees.',
    source: 'American Red Cross',
    url: 'https://www.redcross.org/local/ny/nyc',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    severity: 'medium',
    category: 'resources'
  },
  {
    id: 'nyc_001',
    title: 'NYC Emergency Alert - Subway Service Suspended',
    content: 'All subway service below 14th Street suspended due to flooding. MTA buses providing alternative service. Avoid unnecessary travel.',
    source: 'NYC Emergency Management',
    url: 'https://www1.nyc.gov/site/em/index.page',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    severity: 'high',
    category: 'transportation'
  }
];

export const fetchOfficialUpdates = async (disasterId, sources = ['fema', 'redcross', 'nyc']) => {
  const cacheKey = `official_updates_${disasterId}_${sources.join('_')}`;
  
  try {
    const cached = await getFromCache(cacheKey);
    if (cached) {
      logger.debug(`Official updates from cache for disaster ${disasterId}`);
      return cached;
    }
    
    let allUpdates = [];

    if (sources.includes('fema')) {
      const femaUpdates = await scrapeFEMAUpdates();
      allUpdates.push(...femaUpdates);
    }
    // TODO: Add scraper functions for other sources like 'redcross' and 'nyc'
    // if (sources.includes('redcross')) { ... }

    // If no real data is fetched, fallback to mock data for demonstration
    if (allUpdates.length === 0) {
      logger.warn('No real official updates were fetched, using mock data for now.');
      allUpdates = mockOfficialUpdates.filter(update => 
        sources.some(source => 
          update.source.toLowerCase().includes(source.toLowerCase())
        )
      );
    }
    
    // Analyze updates with Gemini
    const analyzedUpdates = await Promise.all(allUpdates.map(async (update) => {
      // Avoid re-analyzing mock data if it has analysis fields
      if (update.urgency) return update; 
      
      const analysis = await analyzeContentWithGemini(update.content);
      return { ...update, ...analysis };
    }));
    
    const result = {
      updates: analyzedUpdates,
      total: analyzedUpdates.length,
      last_updated: new Date().toISOString(),
      sources: sources
    };
    
    logger.info(`Fetched ${result.total} official updates for disaster ${disasterId}`);
    await setCache(cacheKey, result, 1); // Cache for 1 hour
    return result;
  } catch (error) {
    logger.error('Official updates fetch error:', error);
    return {
      updates: [],
      total: 0,
      last_updated: new Date().toISOString(),
      sources: sources,
      error: error.message
    };
  }
};

// Real web scraping implementation (example for FEMA)
export const scrapeFEMAUpdates = async () => {
  try {
    const response = await axios.get('https://www.fema.gov/disasters', {
      timeout: 10000,
      headers: {
        'User-Agent': 'DisasterResponsePlatform/1.0'
      }
    });
    
    const $ = cheerio.load(response.data);
    const updates = [];
    
    $('.disaster-item').each((i, element) => {
      const title = $(element).find('.title').text().trim();
      const content = $(element).find('.description').text().trim();
      const date = $(element).find('.date').text().trim();
      
      if (title && content) {
        updates.push({
          id: `fema_${Date.now()}_${i}`,
          title,
          content,
          source: 'FEMA',
          url: 'https://www.fema.gov/disasters',
          timestamp: date || new Date().toISOString(),
          severity: title.toLowerCase().includes('major') ? 'high' : 'medium',
          category: 'declaration'
        });
      }
    });
    
    return updates;
  } catch (error) {
    logger.error('FEMA scraping error:', error);
    return [];
  }
}; 