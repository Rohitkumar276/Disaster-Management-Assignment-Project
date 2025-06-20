"use client";

import { useState, useEffect } from 'react';
import { AdminLogin } from '@/components/AdminLogin';
import { Dashboard } from '@/components/Dashboard';
import { DisasterForm } from '@/components/DisasterForm';
import { DisasterList } from '@/components/DisasterList';
import { DisasterDetail } from '@/components/DisasterDetail';
import { useApi, Disaster } from '@/hooks/useApi';
import { useWebSocket } from '@/hooks/useWebSocket';

type View = 'dashboard' | 'list' | 'form' | 'detail';

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [selectedDisasterId, setSelectedDisasterId] = useState<string | null>(null);
  const [disasterToEdit, setDisasterToEdit] = useState<Disaster | null>(null);

  const { disasters, loading, error, refreshDisasters, deleteDisaster } = useApi();
  const { globalUpdate } = useWebSocket();

  useEffect(() => {
    // Check for admin user in localStorage
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      setIsAdmin(true);
    }
    // Fetch initial data
    refreshDisasters();
  }, [refreshDisasters]);

  useEffect(() => {
    if (globalUpdate) {
      console.log('Real-time update received, refreshing disasters...');
      refreshDisasters();
    }
  }, [globalUpdate, refreshDisasters]);

  const handleLogin = (username: string) => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminRole');
    setIsAdmin(false);
    setView('dashboard'); // Go back to dashboard on logout
  };

  const handleViewDisaster = (id: string) => {
    setSelectedDisasterId(id);
    setDisasterToEdit(null); // Clear any pending edit
    setView('detail');
  };

  const handleEditDisaster = (id: string) => {
    const disaster = disasters.find(d => d.id === id);
    if (disaster) {
      setDisasterToEdit(disaster);
      setView('form');
    }
  };

  const handleDeleteDisaster = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this disaster record? This action cannot be undone.')) {
      try {
        await deleteDisaster(id);
        await refreshDisasters(); // Refresh the list
        setView('list'); // Navigate back to the list
      } catch (err) {
        alert('Failed to delete disaster: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard 
                  disasters={disasters} 
                  isAdmin={isAdmin}
                  onReportDisaster={() => setView('form')}
                  onViewDisaster={handleViewDisaster}
                />;
      case 'list':
        return <DisasterList 
                  disasters={disasters}
                  loading={loading}
                  error={error}
                  onViewDisaster={handleViewDisaster}
                  onReportDisaster={() => setView('form')}
                />;
      case 'form':
        return <DisasterForm 
                  disasterToEdit={disasterToEdit}
                  onDisasterCreated={() => {
                    refreshDisasters();
                    setView('list');
                  }} 
                  onDisasterUpdated={() => {
                    refreshDisasters();
                    setDisasterToEdit(null);
                    setView('list');
                  }}
                />;
      case 'detail':
        if (selectedDisasterId) {
          return <DisasterDetail 
                    disasterId={selectedDisasterId} 
                    onBack={() => setView('list')} 
                    isAdmin={isAdmin}
                    onEdit={handleEditDisaster}
                    onDelete={handleDeleteDisaster}
                 />;
        }
        return <div>No disaster selected. Please go back to the list.</div>;
      default:
        return <Dashboard disasters={disasters} isAdmin={isAdmin} onViewDisaster={handleViewDisaster} />;
    }
  };

  if (!isAdmin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <h1 className="text-xl font-bold text-gray-900">Disaster Response Platform</h1>
                <nav className="flex items-center space-x-4">
                  <button onClick={() => setView('dashboard')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'dashboard' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-100'}`}>Dashboard</button>
                  <button onClick={() => setView('list')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'list' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-100'}`}>Disasters</button>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">Logout</button>
                </nav>
            </div>
        </div>
      </header>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </div>
    </main>
  );
} 