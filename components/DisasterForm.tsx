"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Tag, FileText, Loader, Edit } from 'lucide-react';
import { useApi, Disaster } from '../hooks/useApi';

interface DisasterFormProps {
  onDisasterCreated?: () => void;
  onDisasterUpdated?: () => void;
  disasterToEdit?: Disaster | null;
}

export const DisasterForm: React.FC<DisasterFormProps> = ({ 
  onDisasterCreated, 
  onDisasterUpdated, 
  disasterToEdit = null 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location_name: '',
    tags: [] as string[],
  });
  const [customTag, setCustomTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  const { createDisaster, updateDisaster, geocodeText } = useApi();

  const isEditMode = !!disasterToEdit;

  useEffect(() => {
    if (isEditMode && disasterToEdit) {
      setFormData({
        title: disasterToEdit.title,
        description: disasterToEdit.description,
        location_name: disasterToEdit.location_name,
        tags: disasterToEdit.tags || [],
      });
    }
  }, [disasterToEdit, isEditMode]);

  const predefinedTags = [
    'flood', 'fire', 'earthquake', 'storm', 'hurricane', 'tornado',
    'landslide', 'tsunami', 'drought', 'emergency', 'urgent', 'critical',
    'medical', 'evacuation', 'shelter', 'rescue', 'transportation'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim().toLowerCase()]
      }));
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleExtractLocation = async () => {
    if (!formData.description.trim()) {
      setError('Please enter a description first to extract location');
      return;
    }

    setGeocoding(true);
    setError(null);

    try {
      const result = await geocodeText(formData.description);
      setFormData(prev => ({
        ...prev,
        location_name: result.extracted_location
      }));
    } catch {
      setError('Failed to extract location from description');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditMode && disasterToEdit) {
        await updateDisaster(disasterToEdit.id, formData);
        onDisasterUpdated?.();
      } else {
        await createDisaster(formData);
        onDisasterCreated?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} disaster report`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Disaster Record' : 'Report New Disaster'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode ? 'Update the details for this ongoing disaster event.' : 'Create a new disaster record for coordination and response'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Disaster Title</span>
            </div>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief, descriptive title of the disaster"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Description</span>
            </div>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Detailed description of the disaster situation, impact, and current status"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Location */}
        <div className="mb-6">
          <label htmlFor="location_name" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </div>
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              id="location_name"
              name="location_name"
              value={formData.location_name}
              onChange={handleInputChange}
              placeholder="City, State/Province, Country"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleExtractLocation}
              disabled={geocoding || !formData.description.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {geocoding ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>Extract from Description</span>
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Enter location manually or use AI to extract from description above
          </p>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>Disaster Tags</span>
            </div>
          </label>
          
          {/* Predefined Tags */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Select relevant tags:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Add custom tag"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              isEditMode ? <Edit className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />
            )}
            <span>{loading ? 'Submitting...' : isEditMode ? 'Save Changes' : 'Submit Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}; 