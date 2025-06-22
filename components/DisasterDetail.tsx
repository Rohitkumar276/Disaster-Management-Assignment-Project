"use client";

import React, { useEffect, useState } from 'react';
import { useApi, Disaster, Report, Resource, SocialMediaReport, OfficialUpdate } from '../hooks/useApi';
import { Loader, AlertTriangle, ArrowLeft, FileText, Ambulance, MessageSquare, Megaphone, Edit, Trash2 } from 'lucide-react';

interface DisasterDetailProps {
  disasterId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

type Tab = 'reports' | 'resources' | 'social' | 'official';

export const DisasterDetail: React.FC<DisasterDetailProps> = ({ disasterId, onBack, onEdit, onDelete, isAdmin }) => {
  const [disaster, setDisaster] = useState<Disaster | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMediaReport | null>(null);
  const [officialUpdates, setOfficialUpdates] = useState<OfficialUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('reports');
  const { 
    getDisasterById, 
    getReports, 
    getResources, 
    getSocialMedia, 
    getOfficialUpdates 
  } = useApi();
  
  const connected = false;

  useEffect(() => {
    const fetchDisasterData = async () => {
      if (!disasterId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setDisaster(null);

        // 1. Fetch core disaster details
        const disasterData = await getDisasterById(disasterId);
        if (!disasterData) {
          setError('Disaster not found.');
          setLoading(false);
          return;
        }
        setDisaster(disasterData);

        // 2. Fetch all related data in parallel now that we have disasterData
        const [
          reportsData,
          resourcesData,
          socialMediaData,
          officialUpdatesData
        ] = await Promise.all([
          getReports(disasterId),
          getResources(disasterId),
          getSocialMedia(disasterId, disasterData.tags),
          getOfficialUpdates(disasterId)
        ]);

        setReports(reportsData);
        setResources(resourcesData);
        setSocialMedia(socialMediaData);
        setOfficialUpdates(officialUpdatesData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch disaster details');
        setDisaster(null); // Ensure state is clean on error
      } finally {
        setLoading(false);
      }
    };

    fetchDisasterData();
  }, [disasterId, getDisasterById, getReports, getResources, getSocialMedia, getOfficialUpdates]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-red-600" />
        <p className="ml-4 text-gray-700">Loading disaster details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-red-800">Error</h3>
        <p className="text-red-700 mt-2">{error}</p>
      </div>
    );
  }

  if (!disaster) {
    return <div>Disaster not found.</div>;
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to List</span>
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">{disaster.title}</h1>
            <p className="text-lg text-gray-600 mt-2">{disaster.location_name}</p>
          </div>
          {isAdmin && (
            <div className="flex space-x-2">
              <button onClick={() => onEdit(disaster.id)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button onClick={() => onDelete(disaster.id)} className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
            {disaster.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">{tag}</span>
            ))}
        </div>
        <div className="mt-2 text-sm text-gray-500">
            WebSocket Status: <span className={connected ? 'text-green-600' : 'text-red-600'}>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      <p className="text-gray-700 leading-relaxed">{disaster.description}</p>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('reports')} className={`${activeTab === 'reports' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            <FileText className="w-5 h-5 mr-2" /> Reports ({reports.length})
          </button>
          <button onClick={() => setActiveTab('resources')} className={`${activeTab === 'resources' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            <Ambulance className="w-5 h-5 mr-2" /> Resources ({resources.length})
          </button>
          <button onClick={() => setActiveTab('social')} className={`${activeTab === 'social' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            <MessageSquare className="w-5 h-5 mr-2" /> Social Media ({socialMedia?.total || 0})
          </button>
          <button onClick={() => setActiveTab('official')} className={`${activeTab === 'official' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            <Megaphone className="w-5 h-5 mr-2" /> Official Updates ({officialUpdates?.total || 0})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'reports' && <ReportsTab reports={reports} />}
        {activeTab === 'resources' && <ResourcesTab resources={resources} />}
        {activeTab === 'social' && <SocialMediaTab socialMedia={socialMedia} />}
        {activeTab === 'official' && <OfficialUpdatesTab officialUpdates={officialUpdates} />}
      </div>
    </div>
  );
};

// TODO: Create these tab components in separate files

const ReportsTab: React.FC<{reports: Report[]}> = ({reports}) => (
    <div className="space-y-4">
        {reports.length > 0 ? reports.map(r => <div key={r.id} className="p-4 bg-gray-50 rounded-lg border">{r.content}</div>) : <p>No reports found.</p>}
    </div>
);
const ResourcesTab: React.FC<{resources: Resource[]}> = ({resources}) => (
    <div className="space-y-4">
        {resources.length > 0 ? resources.map(r => <div key={r.id} className="p-4 bg-gray-50 rounded-lg border">{r.name}: {r.description}</div>) : <p>No resources found.</p>}
    </div>
);
const SocialMediaTab: React.FC<{socialMedia: SocialMediaReport | null}> = ({socialMedia}) => (
    <div className="space-y-4">
        {socialMedia?.posts?.length ? socialMedia.posts.map(p => <div key={p.id} className="p-4 bg-gray-50 rounded-lg border">{p.content}</div>) : <p>No social media posts found.</p>}
    </div>
);
const OfficialUpdatesTab: React.FC<{officialUpdates: OfficialUpdate | null}> = ({officialUpdates}) => (
    <div className="space-y-4">
        {officialUpdates?.updates?.length ? officialUpdates.updates.map(u => <div key={u.id} className="p-4 bg-gray-50 rounded-lg border">{u.title}: {u.content}</div>) : <p>No official updates found.</p>}
    </div>
); 