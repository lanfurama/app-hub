export enum FeedbackType {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  IMPROVEMENT = 'IMPROVEMENT',
  OTHER = 'OTHER'
}

export interface Feedback {
  id: string;
  appId: string;
  type: FeedbackType;
  title: string;
  description: string;
  createdAt: number;
  votes: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  author: string;
}

export interface AppData {
  id: string;
  name: string;
  description: string;
  githubUrl?: string;
  demoUrl?: string;
  techStack: string[];
  createdAt: number;
  thumbnailUrl?: string;
  imageUrl?: string; // URL của ảnh app
}