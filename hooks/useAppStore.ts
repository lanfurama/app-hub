import { useState, useEffect, useCallback } from 'react';
import { AppData, Feedback } from '../types';
import { appsApi, feedbackApi } from '../services/apiService';

export const useAppStore = () => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Load data from API with retry logic
  useEffect(() => {
    const loadData = async (retryCount = 0) => {
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000; // Start with 1 second
      
      try {
        setError(null);
        setLoadingStates(prev => ({ ...prev, initialLoad: true }));
        const [appsData, feedbacksData] = await Promise.all([
          appsApi.getAll(),
          feedbackApi.getAll()
        ]);
        // Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 100));
        setApps(appsData);
        setFeedbacks(feedbacksData);
        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading data:', err);
        
        // Retry logic for network errors
        if (retryCount < MAX_RETRIES && (
          err instanceof TypeError || // Network error
          (err instanceof Error && err.message.includes('Failed to fetch')) ||
          (err instanceof Error && err.message.includes('Network error'))
        )) {
          const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
          console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => {
            loadData(retryCount + 1);
          }, delay);
          return;
        }
        
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setIsLoaded(true); // Still set loaded to true to show error state
      } finally {
        setLoadingStates(prev => ({ ...prev, initialLoad: false }));
      }
    };

    loadData();
  }, []);

  const addApp = async (app: Omit<AppData, 'id' | 'createdAt'>) => {
    const loadingKey = 'addApp';
    try {
      setError(null);
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      const newApp = await appsApi.create({
        ...app,
        thumbnailUrl: app.thumbnailUrl || undefined,
        imageUrl: app.imageUrl || undefined
      });
      setApps([newApp, ...apps]);
      return newApp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create app';
      setError(errorMessage);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const updateApp = async (id: string, app: Partial<AppData>) => {
    const loadingKey = `updateApp-${id}`;
    try {
      setError(null);
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      const updatedApp = await appsApi.update(id, app);
      setApps(apps.map(a => a.id === id ? updatedApp : a));
      return updatedApp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update app';
      setError(errorMessage);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
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
    const loadingKey = `voteFeedback-${id}`;
    try {
      setError(null);
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      
      // Optimistic update
      const currentFeedback = feedbacks.find(f => f.id === id);
      if (currentFeedback) {
        setFeedbacks(feedbacks.map(f => 
          f.id === id ? { ...f, votes: f.votes + 1 } : f
        ));
      }
      
      const updatedFeedback = await feedbackApi.vote(id, 1);
      setFeedbacks(feedbacks.map(f => 
        f.id === id ? updatedFeedback : f
      ));
      return updatedFeedback;
    } catch (err) {
      // Revert optimistic update on error
      const currentFeedback = feedbacks.find(f => f.id === id);
      if (currentFeedback) {
        setFeedbacks(feedbacks.map(f => 
          f.id === id ? { ...f, votes: Math.max(0, f.votes - 1) } : f
        ));
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote feedback';
      setError(errorMessage);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
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
    loadingStates,
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
