"use client";

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocialMediaReport, Resource, Report, ImageVerificationResult } from './useApi';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'https://disaster-management-assignment-proj-eight.vercel.app';

export const useWebSocket = (disasterId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

  // Global events
  const [globalUpdate, setGlobalUpdate] = useState<any>(null);

  // Real-time data states
  const [realtimeSocial, setRealtimeSocial] = useState<SocialMediaReport | null>(null);
  const [realtimeResources, setRealtimeResources] = useState<Resource[]>([]);
  const [newReport, setNewReport] = useState<Report | null>(null);
  const [imageVerification, setImageVerification] = useState<ImageVerificationResult | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
        return;
    }

    const newSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setConnected(true);
      if (disasterId) {
        newSocket.emit('join_disaster', disasterId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('online_users', (count) => {
      setOnlineUsers(count);
    });

    // Listen for global updates for the list view
    newSocket.on('disasters_updated', (data: any) => {
        console.log('Global disasters updated:', data);
        setGlobalUpdate(data);
    });

    // Listen for specific updates
    newSocket.on('social_media_updated', (data: SocialMediaReport) => {
      console.log('Social media updated:', data);
      setRealtimeSocial(data);
    });

    newSocket.on('resources_updated', (data: { action: 'create' | 'update' | 'delete', resource?: Resource, resource_id?: string }) => {
      console.log('Resources updated:', data);
      setRealtimeResources(prev => {
        if (data.action === 'delete') {
          return prev.filter(r => r.id !== data.resource_id);
        }
        if (data.resource) {
          const exists = prev.find(r => r.id === data.resource!.id);
          if (exists) {
            return prev.map(r => r.id === data.resource!.id ? data.resource! : r);
          } else {
            return [...prev, data.resource];
          }
        }
        return prev;
      });
    });
    
    newSocket.on('report_created', (data: Report) => {
        console.log('New report created:', data);
        setNewReport(data);
    });

    newSocket.on('image_verified', (data: { image_url: string, verification_result: ImageVerificationResult }) => {
      console.log('Image verified:', data);
      setImageVerification(data.verification_result);
    });

    return () => {
      newSocket.close();
    };
  }, [disasterId]);

  const joinDisaster = useCallback((id: string) => {
    if (socket) {
      socket.emit('join_disaster', id);
    }
  }, [socket]);

  const leaveDisaster = useCallback((id: string) => {
    if (socket) {
      socket.emit('leave_disaster', id);
    }
  }, [socket]);

  return {
    socket,
    connected,
    onlineUsers,
    joinDisaster,
    leaveDisaster,
    globalUpdate,
    realtimeSocial,
    realtimeResources,
    newReport,
    imageVerification,
  };
}; 