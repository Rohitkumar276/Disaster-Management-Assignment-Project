import { type NextRequest, NextResponse } from 'next/server';
import { extractLocationFromText } from '@/lib/services/gemini';
import { geocodeLocation } from '@/lib/services/geocoding';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text } = body;
      
        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
        }

        logger.info(`Geocoding request for text: ${text.substring(0, 100)}...`);

        const extractedLocation = await extractLocationFromText(text);
      
        if (!extractedLocation || extractedLocation === 'Unknown Location') {
            return NextResponse.json({ 
                error: 'Could not extract location from the provided text',
                extractedLocation: extractedLocation
            }, { status: 400 });
        }

        const geocodedResult = await geocodeLocation(extractedLocation);

        const result = {
            original_text: text,
            extracted_location: extractedLocation,
            coordinates: {
                lat: geocodedResult.lat,
                lng: geocodedResult.lng
            },
            formatted_address: geocodedResult.formatted_address,
            geocoding_service: geocodedResult.service,
            timestamp: new Date().toISOString()
        };

        logger.info(`Geocoding completed: ${extractedLocation} -> ${geocodedResult.lat}, ${geocodedResult.lng}`);

        return NextResponse.json(result);
    } catch (error: any) {
        logger.error('Geocoding API route error:', { message: error.message });
        return NextResponse.json({ 
            error: 'Geocoding failed',
            message: error.message 
        }, { status: 500 });
    }
} 