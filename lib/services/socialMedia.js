import { getFromCache, setCache } from './cache.service.js';
import { logger } from '../utils/logger.js';
import { analyzeContentWithGemini } from './gemini.js';

// Mock Twitter API data
const mockSocialMediaPosts = [
  {
    id: 'tweet_1',
    content: '#floodrelief Need food and water in Lower East Side Manhattan. Families stranded.',
    user: 'citizen_helper1',
    timestamp: new Date().toISOString(),
    engagement: { likes: 23, retweets: 15, replies: 7 },
    location: 'Lower East Side, NYC',
    urgency: 'high'
  },
  {
    id: 'tweet_2', 
    content: 'Brooklyn Bridge area clear, emergency vehicles can pass through #disasterresponse',
    user: 'nycresponse',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    engagement: { likes: 45, retweets: 28, replies: 3 },
    location: 'Brooklyn Bridge, NYC',
    urgency: 'medium'
  },
  {
    id: 'tweet_3',
    content: 'Shelter open at PS 124 on Avenue B. Hot meals and blankets available #emergencyshelter',
    user: 'redcross_ny',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    engagement: { likes: 67, retweets: 43, replies: 12 },
    location: 'Avenue B, NYC',
    urgency: 'medium'
  },
  {
    id: 'tweet_4',
    content: 'URGENT: Medical assistance needed at 123 Delancey St. Elderly residents trapped on 3rd floor #SOS',
    user: 'concerned_neighbor',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    engagement: { likes: 89, retweets: 72, replies: 25 },
    location: 'Delancey St, NYC',
    urgency: 'critical'
  }
];

export const fetchSocialMediaReports = async (disasterId, keywords = ['flood', 'emergency', 'disaster']) => {
  const cacheKey = `social_media_${disasterId}_${keywords.join('_')}`;
  
  try {
    // Check cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      logger.debug(`Social media reports from cache for disaster ${disasterId}`);
      return cached;
    }
    
    // Mock Twitter API implementation
    if (!process.env.TWITTER_API_KEY) {
      logger.warn(`Using mock social media data for disaster ${disasterId} - no Twitter API key provided`);
      
      // Filter mock posts based on keywords
      const filteredPosts = mockSocialMediaPosts.filter(post => 
        keywords.some(keyword => 
          post.content.toLowerCase().includes(keyword.toLowerCase()) ||
          post.location.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      
      // Add some randomization to simulate real-time updates
      const randomPosts = filteredPosts
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * filteredPosts.length) + 1);
      
      const result = {
        posts: randomPosts,
        total: randomPosts.length,
        last_updated: new Date().toISOString(),
        source: 'mock_twitter'
      };
      
      await setCache(cacheKey, result, 0.25); // Cache for 15 minutes
      return result;
    }
    
    // Real Twitter API implementation (or other social media API)
    logger.info(`Fetching social media reports for disaster ${disasterId} using real API...`);
    
    // =================================================================================
    // TODO: Implement real Twitter/Bluesky API logic here
    // Example structure:
    // const twitterClient = new Twitter(process.env.TWITTER_API_KEY);
    // const response = await twitterClient.get('search/tweets', { q: keywords.join(' OR ') });
    // const posts = response.statuses.map(s => ({ id: s.id_str, content: s.text, ... }));
    // =================================================================================
    
    // For now, returning an empty array as the real API is not implemented
    const posts = []; 
    
    if (posts.length === 0) {
        logger.warn(`No new social media reports found from the real API for disaster ${disasterId}`);
        return { posts: [], total: 0, last_updated: new Date().toISOString(), source: 'twitter_api' };
    }

    // Analyze posts with Gemini only when using the real API
    const analyzedPosts = await Promise.all(posts.map(async (post) => {
      const analysis = await analyzeContentWithGemini(post.content);
      return { ...post, ...analysis };
    }));
    
    const finalResult = { 
        posts: analyzedPosts,
        total: analyzedPosts.length,
        last_updated: new Date().toISOString(),
        source: 'twitter_api' 
    };
    
    await setCache(cacheKey, finalResult, 0.25);
    return finalResult;
  } catch (error) {
    logger.error('Social media fetch error:', error);
    return {
      posts: [],
      total: 0,
      last_updated: new Date().toISOString(),
      source: 'error',
      error: error.message
    };
  }
}; 