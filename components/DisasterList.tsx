"use client";

import React, { useState } from 'react';
import { MapPin, Clock, AlertTriangle, Filter, Search } from 'lucide-react';
// import { Disaster } from '../hooks/useApi';

// A placeholder type for now
export type Disaster = any;

interface DisasterListProps {
  disasters: Disaster[];
  loading: boolean;
  error: string | null;
  onViewDisaster: (id: string) => void;
  onReportDisaster: () => void;
}

export const DisasterList: React.FC<DisasterListProps> = ({
  disasters,
  loading,
  error,
  onViewDisaster,
  onReportDisaster,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Get all unique tags
  const allTags = Array.from(
    new Set(disasters.flatMap(disaster => disaster.tags))
  ).sort();

  // Filter disasters
  const filteredDisasters = disasters.filter(disaster => {
    const matchesSearch = disaster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disaster.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disaster.location_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || disaster.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const getSeverityColor = (tags: string[]) => {
    if (tags.some(tag => ['urgent', 'critical', 'emergency'].includes(tag.toLowerCase()))) {
      return 'border-red-500 bg-red-50';
    }
    if (tags.some(tag => ['flood', 'fire', 'earthquake'].includes(tag.toLowerCase()))) {
      return 'border-amber-500 bg-amber-50';
    }
    return 'border-blue-500 bg-blue-50';
  };

  const getTagColor = (tag: string) => {
    if (['urgent', 'critical', 'emergency', 'sos'].includes(tag.toLowerCase())) {
      return 'bg-red-100 text-red-800';
    }
    if (['flood', 'fire', 'earthquake', 'storm'].includes(tag.toLowerCase())) {
      return 'bg-amber-100 text-amber-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Disasters</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Active Disasters</h1>
          <p className="text-gray-600 mt-2">Monitor and manage ongoing emergency situations</p>
        </div>
        <button
            onClick={onReportDisaster}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report New Disaster</span>
          </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search disasters by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="sm:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {(searchTerm || selectedTag) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredDisasters.length} of {disasters.length} disasters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('');
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Disaster List */}
      {filteredDisasters.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Disasters Found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedTag 
              ? 'Try adjusting your search criteria or filters.'
              : 'No active disasters at this time.'
            }
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredDisasters.map((disaster) => (
            <div
              key={disaster.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow cursor-pointer ${getSeverityColor(disaster.tags)}`}
              onClick={() => onViewDisaster(disaster.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{disaster.title}</h3>
                    <div className="flex space-x-2">
                      {disaster.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                      {disaster.tags.length > 3 && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                          +{disaster.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {disaster.description.length > 200 
                      ? `${disaster.description.substring(0, 200)}...`
                      : disaster.description
                    }
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{disaster.location_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(disaster.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-6">
                  <div className="space-y-2">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {disaster.reports?.length || 0} Reports
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {disaster.resources?.length || 0} Resources
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 