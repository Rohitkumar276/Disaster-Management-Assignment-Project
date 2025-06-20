// TODO: Refactor this hook to use Next.js data fetching patterns.
// For now, it's moved as-is to maintain type definitions.
// We will replace its usage with Server Components, Server Actions, and Route Handlers.

import { useState, useCallback } from 'react';

const API_BASE = '/api';

export interface Disaster {
  id: string;
  title: string;
  location_name: string;  
  description: string;
  tags: string[];
  owner_id: string;
  created_at: string;
  updated_at: string;
  reports?: Report[];
  resources?: Resource[];
}

export interface Report {
  id: string;
  disaster_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  verification_status: 'pending' | 'verified' | 'flagged' | 'rejected';
  verification_details?: Record<string, unknown>;
  created_at: string;
}

export interface Resource {
  id: string;
  disaster_id: string;
  name: string;
  location_name: string;
  type: string;
  description?: string;
  capacity?: number;
  contact_info?: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface SocialMediaPost {
  id: string;
  content: string;
  user: string;
  timestamp: string;
  engagement: { likes: number; retweets: number; replies: number };
  location: string;
  urgency: string;
}

export interface SocialMediaReport {
  posts: SocialMediaPost[];
  total: number;
  last_updated: string;
  source: string;
}

export interface OfficialUpdatePost {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  timestamp: string;
  severity: string;
  category: string;
}

export interface OfficialUpdate {
  updates: OfficialUpdatePost[];
  total: number;
  last_updated: string;
  sources: string[];
}

export interface ImageVerificationResult {
  authentic: boolean;
  confidence: number;
  analysis: string;
}

export const useApi = () => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUser = () => {
    if (typeof window === 'undefined') {
        return 'server_user';
    }
    return localStorage.getItem('adminUser') || 'netrunnerX'; // fallback to default
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const currentUser = getCurrentUser();
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user': currentUser, // Use logged-in admin user
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('API call failed:', err);
      throw err;
    }
  };

  const refreshDisasters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall('/disasters');
      setDisasters(response.disasters || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch disasters');
    } finally {
      setLoading(false);
    }
  }, []);

  const getDisasterById = useCallback(async (id: string): Promise<Disaster> => {
    return await apiCall(`/disasters/${id}`);
  }, []);

  const createDisaster = useCallback(async (data: Partial<Disaster>): Promise<Disaster> => {
    return await apiCall('/disasters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, []);

  const updateDisaster = useCallback(async (id: string, data: Partial<Disaster>): Promise<Disaster> => {
    return await apiCall(`/disasters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, []);

  const deleteDisaster = useCallback(async (id: string): Promise<void> => {
    await apiCall(`/disasters/${id}`, {
      method: 'DELETE',
    });
  }, []);

  const verifyImage = useCallback(async (disasterId: string, imageUrl: string, context: string): Promise<ImageVerificationResult> => {
    return await apiCall(`/disasters/${disasterId}/verify-image`, {
      method: 'POST',
      body: JSON.stringify({ image_url: imageUrl, context }),
    });
  }, []);

  const getReports = useCallback(async (disasterId: string): Promise<Report[]> => {
    return await apiCall(`/reports?disaster_id=${disasterId}`);
  }, []);

  const createReport = useCallback(async (disasterId: string, data: Partial<Report>): Promise<Report> => {
    return await apiCall(`/disasters/${disasterId}/reports`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, []);

  const getResources = useCallback(async (disasterId: string, lat?: number, lon?: number): Promise<Resource[]> => {
    const params = new URLSearchParams();
    params.set('disaster_id', disasterId);
    if (lat !== undefined) params.set('lat', lat.toString());
    if (lon !== undefined) params.set('lon', lon.toString());
    
    const queryString = params.toString();
    const endpoint = `/resources?${queryString}`;
    
    return await apiCall(endpoint);
  }, []);

  const createResource = useCallback(async (disasterId: string, data: Partial<Resource>): Promise<Resource> => {
    return await apiCall(`/disasters/${disasterId}/resources`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, []);

  const getSocialMedia = useCallback(async (disasterId: string, keywords?: string[]): Promise<SocialMediaReport> => {
    const params = new URLSearchParams();
    if (keywords?.length) params.set('keywords', keywords.join(','));
    
    const queryString = params.toString();
    const endpoint = `/disasters/${disasterId}/social-media${queryString ? `?${queryString}` : ''}`;
    
    return await apiCall(endpoint);
  }, []);

  const getOfficialUpdates = useCallback(async (disasterId: string, sources?: string[]): Promise<OfficialUpdate> => {
    const params = new URLSearchParams();
    if (sources?.length) params.set('sources', sources.join(','));
    
    const queryString = params.toString();
    const endpoint = `/disasters/${disasterId}/official-updates${queryString ? `?${queryString}` : ''}`;
    
    return await apiCall(endpoint);
  }, []);

  const geocodeText = useCallback(async (text: string) => {
    return await apiCall('/geocode', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }, []);

  return {
    disasters,
    loading,
    error,
    refreshDisasters,
    getDisasterById,
    createDisaster,
    updateDisaster,
    deleteDisaster,
    verifyImage,
    getReports,
    createReport,
    getResources,
    createResource,
    getSocialMedia,
    getOfficialUpdates,
    geocodeText,
  };
}; 