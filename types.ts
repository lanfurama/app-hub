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

export type AppStatus = 'ACTIVE' | 'TRIAL' | 'MAINTENANCE';
export type AppCategory = 'DIGITAL_TOOLS' | 'OTHER';

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
  status?: AppStatus; // Trạng thái: ACTIVE (Hoạt động), TRIAL (Thử nghiệm), MAINTENANCE (Bảo trì)
  version?: string; // Phiên bản app (ví dụ: "1.0.0")
  category?: AppCategory; // Danh mục: DIGITAL_TOOLS, OTHER
  icon?: string; // Icon/emoji để hiển thị (ví dụ: "📊", "👥")
}