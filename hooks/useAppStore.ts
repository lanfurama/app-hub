import { useState, useEffect, useCallback } from 'react';
import { AppData, Feedback } from '../types';
import { appsApi, feedbackApi } from '../services/apiService';

export const useAppStore = () => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const [appsData, feedbacksData] = await Promise.all([
          appsApi.getAll(),
          feedbackApi.getAll()
        ]);
        setApps(appsData);
        setFeedbacks(feedbacksData);
        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setIsLoaded(true); // Still set loaded to true to show error state
      }
    };

    loadData();
  }, []);

  const addApp = async (app: Omit<AppData, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newApp = await appsApi.create({
        ...app,
        thumbnailUrl: app.thumbnailUrl || `https://picsum.photos/400/200?random=${Date.now()}`
      });
      setApps([newApp, ...apps]);
      return newApp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create app';
      setError(errorMessage);
      throw err;
    }
  };

  const updateApp = async (id: string, app: Partial<AppData>) => {
    try {
      setError(null);
      const updatedApp = await appsApi.update(id, app);
      setApps(apps.map(a => a.id === id ? updatedApp : a));
      return updatedApp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update app';
      setError(errorMessage);
      throw err;
    }
  };

  const addFeedback = async (feedback: Omit<Feedback, 'id' | 'createdAt' | 'votes' | 'status'>) => {
    try {
      setError(null);
      const newFeedback = await feedbackApi.create(feedback);
      setFeedbacks([newFeedback, ...feedbacks]);
      return newFeedback;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create feedback';
      setError(errorMessage);
      throw err;
    }
  };

  const voteFeedback = async (id: string) => {
    try {
      setError(null);
      const updatedFeedback = await feedbackApi.vote(id, 1);
      setFeedbacks(feedbacks.map(f => 
        f.id === id ? updatedFeedback : f
      ));
      return updatedFeedback;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote feedback';
      setError(errorMessage);
      throw err;
    }
  };

  const getAppFeedbacks = useCallback((appId: string) => {
    return feedbacks.filter(f => f.appId === appId);
  }, [feedbacks]);

  const getApp = useCallback((id: string) => {
    return apps.find(a => a.id === id);
  }, [apps]);

  const refreshApps = async () => {
    try {
      setError(null);
      const appsData = await appsApi.getAll();
      setApps(appsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh apps';
      setError(errorMessage);
    }
  };

  const refreshFeedbacks = async (appId?: string) => {
    try {
      setError(null);
      const feedbacksData = await feedbackApi.getAll(appId);
      if (appId) {
        // Update only feedbacks for this app
        setFeedbacks(feedbacks.map(f => 
          f.appId === appId ? feedbacksData.find(nf => nf.id === f.id) || f : f
        ));
      } else {
        setFeedbacks(feedbacksData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh feedbacks';
      setError(errorMessage);
    }
  };

  return {
    apps,
    feedbacks,
    isLoaded,
    error,
    addApp,
    updateApp,
    addFeedback,
    voteFeedback,
    getAppFeedbacks,
    getApp,
    refreshApps,
    refreshFeedbacks
  };
};
