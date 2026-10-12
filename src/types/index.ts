export type Priority = 'low' | 'medium' | 'high';

export type Category = 'Work' | 'Personal' | 'Project' | 'Database' | 'Study' | 'General';

export interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskFilter = 'all' | 'pending' | 'completed';

export type ActiveTab = 'app' | 'api' | 'code' | 'guide' | 'viva' | 'settings';

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  sampleBody?: Record<string, unknown>;
  requiresId?: boolean;
}

export interface ApiResponse<T = unknown> {
  status: number;
  statusText: string;
  latencyMs: number;
  headers: Record<string, string>;
  data: T;
}

export interface ProjectFile {
  path: string;
  name: string;
  directory: 'server' | 'client' | 'root';
  description: string;
  content: string;
  language: 'javascript' | 'json' | 'css' | 'html' | 'markdown' | 'env';
}

export interface VivaQuestion {
  id: number;
  question: string;
  answer: string;
  category: 'Architecture' | 'MongoDB' | 'Express & Node' | 'React' | 'Deployment & Security';
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
}
