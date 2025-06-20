"use client";

import React, { useState } from 'react';
import { AlertTriangle, MapPin, Activity, Clock, TrendingUp, Users, Shield, Plus } from 'lucide-react';
// import { Disaster } from '../hooks/useApi'; 
// TODO: Update this import path later

// A placeholder type for now
export type Disaster = any;

interface DashboardProps {
  disasters: Disaster[];
  isAdmin?: boolean;
  onReportDisaster?: () => void;
  onViewDisaster: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  disasters, 
  isAdmin = false, 
  onReportDisaster,
  onViewDisaster
}) => {
  const [recentActivity] = useState([
    { id: 1, type: 'disaster', message: 'New flood emergency reported in Manhattan', time: '2 minutes ago', severity: 'high' },
    { id: 2, type: 'report', message: '15 new social media reports processed', time: '5 minutes ago', severity: 'medium' },
    { id: 3, type: 'resource', message: 'Emergency shelter activated in Brooklyn', time: '8 minutes ago', severity: 'medium' },
    { id: 4, type: 'update', message: 'FEMA disaster declaration issued', time: '12 minutes ago', severity: 'high' },
  ]);

  const stats = {
    activeDisasters: disasters.length,
    totalReports: disasters.reduce((sum, d) => sum + (d.reports?.length || 0), 0),
    resourcesDeployed: disasters.reduce((sum, d) => sum + (d.resources?.length || 0), 0),
    responsesLast24h: Math.floor(Math.random() * 100) + 50,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'disaster': return <AlertTriangle className="w-4 h-4" />;
      case 'report': return <Activity className="w-4 h-4" />;
      case 'resource': return <MapPin className="w-4 h-4" />;
      case 'update': return <Shield className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Response Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring and coordination center</p>
        </div>
        
        {isAdmin && onReportDisaster && (
          <button
            onClick={onReportDisaster}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Report Disaster</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Disasters</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.activeDisasters}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-red-500 font-medium">+2</span>
            <span className="text-gray-500 ml-1">since yesterday</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Reports</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalReports}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+12</span>
            <span className="text-gray-500 ml-1">this hour</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Resources Deployed</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{stats.resourcesDeployed}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+5</span>
            <span className="text-gray-500 ml-1">today</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Responses (24h)</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.responsesLast24h}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">18%</span>
            <span className="text-gray-500 ml-1">increase</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-gray-500 text-sm mt-1">Latest updates and actions from all active events</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Protocols */}
      <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-red-600 p-3 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Emergency Response Protocols</h3>
            <p className="text-red-700 mt-1">
              For immediate emergencies, call 911. This platform coordinates ongoing disaster response efforts.
            </p>
            <div className="flex space-x-4 mt-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Emergency Contacts
              </button>
              <button className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                Response Guidelines
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 