import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { AppData, Feedback } from '../types';
import { appsApi, feedbackApi } from '../services/apiService';

export interface AppStoreValue {
  apps: AppData[];
  feedbacks: Feedback[];
  isLoaded: boolean;
  error: string | null;
  loadingStates: Record<string, boolean>;
  addApp: (app: Omit<AppData, 'id' | 'createdAt'>) => Promise<AppData>;
  updateApp: (id: string, app: Partial<AppData>) => Promise<AppData>;
  deleteApp: (id: string) => Promise<void>;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'votes' | 'status'>) => Promise<Feedback>;
  voteFeedback: (id: string) => Promise<Feedback>;
  getAppFeedbacks: (appId: string) => Feedback[];
  getApp: (id: string) => AppData | undefined;
  refreshApps: () => Promise<void>;
  refreshFeedbacks: (appId?: string) => Promise<void>;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export const AppStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async (retryCount = 0) => {
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000;
      try {
        setError(null);
        setLoadingStates(prev => ({ ...prev, initialLoad: true }));
        const [appsData, feedbacksData] = await Promise.all([
          appsApi.getAll(),
          feedbackApi.getAll()
        ]);
        await new Promise(resolve => setTimeout(resolve, 100));
        setApps(appsData);
        setFeedbacks(feedbacksData);
        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading data:', err);
        if (retryCount < MAX_RETRIES && (
          err instanceof TypeError ||
          (err instanceof Error && err.message.includes('Failed to fetch')) ||
          (err instanceof Error && err.message.includes('Network error'))
        )) {
          const delay = RETRY_DELAY * Math.pow(2, retryCount);
          setTimeout(() => loadData(retryCount + 1), delay);
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setIsLoaded(true);
      } finally {
        setLoadingStates(prev => ({ ...prev, initialLoad: false }));
      }
    };
    loadData();
  }, []);

  const addApp = useCallback(async (app: Omit<AppData, 'id' | 'createdAt'>) => {
    const loadingKey = 'addApp';
    try {
      setError(null);
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      const newApp = await appsApi.create({
        ...app,
        thumbnailUrl: app.thumbnailUrl || undefined,
        imageUrl: app.imageUrl || undefined
      });
      setApps(prev => [newApp, ...prev]);
      return newApp;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create app');
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  const updateApp = useCallback(async (id: string, app: Partial<AppData>) => {
    const loadingKey = `updateApp-${id}`;
    try {
      setError(null);
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      const updatedApp = await appsApi.update(id, app);
      setApps(prev => prev.map(a => a.id === id ? updatedApp : a));
      return updatedApp;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update app');
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  const addFeedback = useCallback(async (feedback: Omit<Feedback, 'id' | 'createdAt' | 'votes' | 'status'>) => {
    try {
      setError(null);
      const newFeedback = await feedbackApi.create(feedback);
      setFeedbacks(prev => [newFeedback, ...prev]);
      return newFeedback;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create feedback');
      throw err;
    }
  }, []);

  const voteFeedback = useCallback(async (id: string) => {
    const loadingKey = `voteFeedback-${id}`;
    try {
      setError(null);
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      setFeedbacks(prev => {
        const current = prev.find(f => f.id === id);
        if (current) return prev.map(f => f.id === id ? { ...f, votes: f.votes + 1 } : f);
        return prev;
      });
      const updated = await feedbackApi.vote(id, 1);
      setFeedbacks(prev => prev.map(f => f.id === id ? updated : f));
      return updated;
    } catch (err) {
      setFeedbacks(prev => {
        const current = prev.find(f => f.id === id);
        if (current) return prev.map(f => f.id === id ? { ...f, votes: Math.max(0, f.votes - 1) } : f);
        return prev;
      });
      setError(err instanceof Error ? err.message : 'Failed to vote feedback');
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  const getAppFeedbacks = useCallback((appId: string) => {
    return feedbacks.filter(f => f.appId === appId);
  }, [feedbacks]);

  const getApp = useCallback((id: string) => apps.find(a => a.id === id), [apps]);

  const refreshApps = useCallback(async () => {
    try {
      setError(null);
      const data = await appsApi.getAll();
      setApps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh apps');
    }
  }, []);

  const refreshFeedbacks = useCallback(async (appId?: string) => {
    try {
      setError(null);
      const data = await feedbackApi.getAll(appId);
      if (appId) {
        setFeedbacks(prev => prev.map(f =>
          f.appId === appId ? (data.find(n => n.id === f.id) ?? f) : f
        ));
      } else {
        setFeedbacks(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh feedbacks');
    }
  }, []);

  const deleteApp = useCallback(async (id: string) => {
    const loadingKey = `deleteApp-${id}`;
    try {
      setError(null);
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      await appsApi.delete(id);
      setApps(prev => prev.filter(a => a.id !== id));
      setFeedbacks(prev => prev.filter(f => f.appId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete app');
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  const value: AppStoreValue = {
    apps,
    feedbacks,
    isLoaded,
    error,
    loadingStates,
    addApp,
    updateApp,
    deleteApp,
    addFeedback,
    voteFeedback,
    getAppFeedbacks,
    getApp,
    refreshApps,
    refreshFeedbacks
  };

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
};

export const useAppStore = (): AppStoreValue => {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return ctx;
};
