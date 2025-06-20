import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import { getFromCache, setCache } from './cache.service.js';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

export const extractLocationFromText = async (text) => {
  const cacheKey = `location_extract_${Buffer.from(text).toString('base64').slice(0, 50)}`;
  
  try {
    // Check cache first
    const cached = await getFromCache(cacheKey);
    if (cached) {
      logger.debug('Location extraction from cache');
      return cached;
    }
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'demo-key') {
      logger.warn('Using mock Gemini response - no API key provided');
      // Mock response for demo
      const mockLocation = text.includes('NYC') || text.includes('Manhattan') ? 'Manhattan, NYC' : 
                           text.includes('LA') || text.includes('Angeles') ? 'Los Angeles, CA' :
                           'New York, NY';
      await setCache(cacheKey, mockLocation);   
      return mockLocation;
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Extract the most specific location mentioned in this disaster description. Return only the location name (city, state/country format if possible), nothing else: "${text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const location = response.text().trim();
    
    logger.info(`Location extracted: ${location}`);
    await setCache(cacheKey, location);
    return location;
  } catch (error) {
    logger.error('Gemini location extraction error:', error);
    // Fallback to simple text parsing
    const locationMatch = text.match(/\b([A-Z][a-z]+(?: [A-Z][a-z]+)*,?\s*[A-Z]{2,})\b/);
    const fallbackLocation = locationMatch ? locationMatch[0] : 'Unknown Location';
    await setCache(cacheKey, fallbackLocation);
    return fallbackLocation;
  }
};

export const verifyImage = async (imageUrl, context = '') => {
  const cacheKey = `image_verify_${Buffer.from(imageUrl).toString('base64').slice(0, 50)}`;
  
  try {
    const cached = await getFromCache(cacheKey);
    if (cached) {
      logger.debug('Image verification from cache');
      return cached;
    }
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'demo-key') {
      logger.warn('Using mock image verification - no API key provided');
      const mockResult = {
        authentic: Math.random() > 0.2, // 80% authentic rate for demo
        confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
        analysis: 'Mock analysis - API key required for real verification'
      };
      await setCache(cacheKey, mockResult);
      return mockResult;
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const prompt = `Analyze this image for authenticity in the context of disaster reporting. Look for signs of manipulation, inconsistencies, or if it appears to be stock/old footage. Context: ${context}. Respond in JSON format with keys: "authentic" (true/false), "confidence" (0-1), and "analysis" (a brief explanation).`;
    
    // Fetch the image from the URL
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary').toString('base64');
    
    const imagePart = {
      inlineData: {
        data: imageBuffer,
        mimeType: imageResponse.headers['content-type'] || 'image/jpeg',
      },
    };
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const analysisText = response.text().trim();

    // Parse the JSON response from Gemini
    const verificationResult = JSON.parse(analysisText.replace(/```json/g, '').replace(/```/g, ''));
    
    logger.info(`Image verified: ${JSON.stringify(verificationResult)}`);
    await setCache(cacheKey, verificationResult);
    return verificationResult;
  } catch (error) {
    logger.error('Gemini image verification error:', error);
    const fallbackResult = {
      authentic: true,
      confidence: 0.5,
      analysis: 'Verification failed - manual review required'
    };
    await setCache(cacheKey, fallbackResult);
    return fallbackResult;
  }
};

export const analyzeContentWithGemini = async (text) => {
  const cacheKey = `content_analysis_${Buffer.from(text).toString('base64').slice(0, 50)}`;

  try {
    const cached = await getFromCache(cacheKey);
    if (cached) {
      logger.debug('Content analysis from cache');
      return cached;
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'demo-key') {
      logger.warn('Using mock Gemini content analysis - no API key provided');
      const mockAnalysis = {
        summary: 'Mock summary: People may be in need of assistance.',
        urgency: text.toLowerCase().includes('urgent') ? 'critical' : 'medium',
        resource_needs: ['water', 'food', 'medical aid'],
        location_mentioned: 'Mock Location',
      };
      await setCache(cacheKey, mockAnalysis);
      return mockAnalysis;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze the following text from a disaster report. Provide a structured response with:
      1. 'summary': A brief one-sentence summary.
      2. 'urgency': A single urgency keyword (critical, high, medium, low).
      3. 'resource_needs': A JSON array of specific resources needed (e.g., ["water", "medical supplies"]).
      4. 'location_mentioned': The most specific location found.
      
      Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text().trim();
    
    // Simple parsing, robust implementation would use function calling
    const analysis = JSON.parse(analysisText.replace(/```json/g, '').replace(/```/g, ''));
    
    await setCache(cacheKey, analysis);
    return analysis;
  } catch (error) {
    logger.error('Gemini content analysis error:', error);
    return {
      summary: 'Analysis failed',
      urgency: 'unknown',
      resource_needs: [],
      location_mentioned: null
    };
  }
}; 