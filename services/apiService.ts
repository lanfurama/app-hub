import { AppData, Feedback } from '../types';

// Auto-detect API URL: use Vercel URL in production, or custom VITE_API_URL, or localhost
const getApiUrl = () => {
  // Check for explicit API URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // On Vercel/production, API routes are on the same domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If not localhost, use relative path (same domain)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return '/api';
    }
  }
  
  // Default to localhost for local development
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiUrl();

// Debug log (remove in production if needed)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Apps API
export const appsApi = {
  getAll: async (): Promise<AppData[]> => {
    const response = await fetch(`${API_BASE_URL}/apps`);
    return handleResponse<AppData[]>(response);
  },

  getById: async (id: string): Promise<AppData> => {
    const response = await fetch(`${API_BASE_URL}/apps/${id}`);
    return handleResponse<AppData>(response);
  },

  create: async (app: Omit<AppData, 'id' | 'createdAt'>): Promise<AppData> => {
    const newApp: AppData = {
      ...app,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const response = await fetch(`${API_BASE_URL}/apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newApp),
    });
    return handleResponse<AppData>(response);
  },

  update: async (id: string, app: Partial<AppData>): Promise<AppData> => {
    const response = await fetch(`${API_BASE_URL}/apps/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(app),
    });
    return handleResponse<AppData>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/apps/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
  },
};

// Feedback API
export const feedbackApi = {
  getAll: async (appId?: string): Promise<Feedback[]> => {
    const url = appId 
      ? `${API_BASE_URL}/feedback?appId=${appId}`
      : `${API_BASE_URL}/feedback`;
    const response = await fetch(url);
    return handleResponse<Feedback[]>(response);
  },

  getById: async (id: string): Promise<Feedback> => {
    const response = await fetch(`${API_BASE_URL}/feedback/${id}`);
    return handleResponse<Feedback>(response);
  },

  create: async (feedback: Omit<Feedback, 'id' | 'createdAt' | 'votes' | 'status'>): Promise<Feedback> => {
    const newFeedback: Feedback = {
      ...feedback,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      votes: 0,
      status: 'OPEN',
    };
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newFeedback),
    });
    return handleResponse<Feedback>(response);
  },

  update: async (id: string, feedback: Partial<Feedback>): Promise<Feedback> => {
    const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });
    return handleResponse<Feedback>(response);
  },

  vote: async (id: string, increment: number = 1): Promise<Feedback> => {
    const response = await fetch(`${API_BASE_URL}/feedback/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ increment }),
    });
    return handleResponse<Feedback>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
  },
};

