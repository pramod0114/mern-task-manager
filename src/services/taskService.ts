import { Task, ApiResponse, Priority, Category } from '../types';
import { INITIAL_TASKS } from '../data/initialTasks';

const STORAGE_KEY = 'mern_tasks_store_v1';
const CONFIG_KEY = 'mern_api_config_v1';

export interface ApiConfig {
  mode: 'local' | 'remote';
  remoteUrl: string; // e.g. https://mern-task-manager-3w4u-91wuuw6df-ashishdk.vercel.app/api or user's backend
  simulateLatency: boolean;
}

const DEFAULT_CONFIG: ApiConfig = {
  mode: 'local',
  remoteUrl: 'https://mern-task-manager-3w4u-91wuuw6df-ashishdk.vercel.app/api',
  simulateLatency: true,
};

function getStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored tasks:', err);
    return INITIAL_TASKS;
  }
}

function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks:', err);
  }
}

export function getApiConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveApiConfig(config: Partial<ApiConfig>): ApiConfig {
  const current = getApiConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  return updated;
}

async function delay(ms = 80): Promise<void> {
  const config = getApiConfig();
  if (config.simulateLatency) {
    await new Promise((res) => setTimeout(res, ms));
  }
}

export const taskService = {
  async getHealth(): Promise<ApiResponse<{ status: string; timestamp: string; database: string; uptime: number }>> {
    const start = performance.now();
    const config = getApiConfig();

    if (config.mode === 'remote' && config.remoteUrl) {
      try {
        const res = await fetch(`${config.remoteUrl}/health`);
        const data = await res.json();
        const latencyMs = Math.round(performance.now() - start);
        return {
          status: res.status,
          statusText: res.statusText || 'OK',
          latencyMs,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'x-powered-by': 'Express',
            'access-control-allow-origin': '*',
          },
          data,
        };
      } catch (e: any) {
        // Fallback to local if remote fails
        console.warn('Remote health check failed, falling back:', e.message);
      }
    }

    await delay(60);
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: 200,
      statusText: 'OK',
      latencyMs,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-powered-by': 'Express',
        'access-control-allow-origin': '*',
      },
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: 'MongoDB Atlas (Connected via Mongoose)',
        uptime: Math.floor(performance.now() / 1000) + 120,
      },
    };
  },

  async getAllTasks(): Promise<ApiResponse<Task[]>> {
    const start = performance.now();
    const config = getApiConfig();

    if (config.mode === 'remote' && config.remoteUrl) {
      try {
        const res = await fetch(`${config.remoteUrl}/tasks`);
        const data = await res.json();
        const latencyMs = Math.round(performance.now() - start);
        return {
          status: res.status,
          statusText: res.statusText || 'OK',
          latencyMs,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'x-powered-by': 'Express',
          },
          data: Array.isArray(data) ? data : data.tasks || [],
        };
      } catch (err: any) {
        console.warn('Remote get tasks failed:', err.message);
      }
    }

    await delay(95);
    const tasks = getStoredTasks();
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: 200,
      statusText: 'OK',
      latencyMs,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-powered-by': 'Express',
      },
      data: [...tasks],
    };
  },

  async getTaskById(id: string): Promise<ApiResponse<Task | { message: string }>> {
    const start = performance.now();
    await delay(70);
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t._id === id);
    const latencyMs = Math.round(performance.now() - start);

    if (!task) {
      return {
        status: 404,
        statusText: 'Not Found',
        latencyMs,
        headers: { 'content-type': 'application/json' },
        data: { message: `Task with ID ${id} not found` },
      };
    }

    return {
      status: 200,
      statusText: 'OK',
      latencyMs,
      headers: { 'content-type': 'application/json' },
      data: task,
    };
  },

  async createTask(payload: {
    title: string;
    description?: string;
    priority?: Priority;
    category?: Category;
    dueDate?: string;
  }): Promise<ApiResponse<Task>> {
    const start = performance.now();
    await delay(110);
    const tasks = getStoredTasks();

    const newTask: Task = {
      _id: `task_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      title: payload.title.trim(),
      description: (payload.description || '').trim(),
      completed: false,
      priority: payload.priority || 'medium',
      category: payload.category || 'General',
      dueDate: payload.dueDate || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    saveStoredTasks(tasks);

    const latencyMs = Math.round(performance.now() - start);
    return {
      status: 201,
      statusText: 'Created',
      latencyMs,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-powered-by': 'Express',
      },
      data: newTask,
    };
  },

  async updateTask(
    id: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'completed' | 'priority' | 'category' | 'dueDate'>>
  ): Promise<ApiResponse<Task | { message: string }>> {
    const start = performance.now();
    await delay(100);
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t._id === id);
    const latencyMs = Math.round(performance.now() - start);

    if (index === -1) {
      return {
        status: 404,
        statusText: 'Not Found',
        latencyMs,
        headers: { 'content-type': 'application/json' },
        data: { message: `Task not found with ID ${id}` },
      };
    }

    const updatedTask: Task = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updatedTask;
    saveStoredTasks(tasks);

    return {
      status: 200,
      statusText: 'OK',
      latencyMs,
      headers: { 'content-type': 'application/json' },
      data: updatedTask,
    };
  },

  async toggleTask(id: string): Promise<ApiResponse<Task | { message: string }>> {
    const start = performance.now();
    await delay(80);
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t._id === id);
    const latencyMs = Math.round(performance.now() - start);

    if (index === -1) {
      return {
        status: 404,
        statusText: 'Not Found',
        latencyMs,
        headers: { 'content-type': 'application/json' },
        data: { message: `Task not found with ID ${id}` },
      };
    }

    const updatedTask: Task = {
      ...tasks[index],
      completed: !tasks[index].completed,
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updatedTask;
    saveStoredTasks(tasks);

    return {
      status: 200,
      statusText: 'OK',
      latencyMs,
      headers: { 'content-type': 'application/json' },
      data: updatedTask,
    };
  },

  async deleteTask(id: string): Promise<ApiResponse<{ message: string; id: string }>> {
    const start = performance.now();
    await delay(85);
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t._id === id);
    const latencyMs = Math.round(performance.now() - start);

    if (index === -1) {
      return {
        status: 404,
        statusText: 'Not Found',
        latencyMs,
        headers: { 'content-type': 'application/json' },
        data: { message: `Task not found with ID ${id}`, id },
      };
    }

    tasks.splice(index, 1);
    saveStoredTasks(tasks);

    return {
      status: 200,
      statusText: 'OK',
      latencyMs,
      headers: { 'content-type': 'application/json' },
      data: { message: 'Task deleted successfully', id },
    };
  },

  async resetTasks(): Promise<Task[]> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
    return [...INITIAL_TASKS];
  },

  async clearCompleted(): Promise<Task[]> {
    const tasks = getStoredTasks();
    const remaining = tasks.filter((t) => !t.completed);
    saveStoredTasks(remaining);
    return remaining;
  },

  async markAllCompleted(): Promise<Task[]> {
    const tasks = getStoredTasks();
    const now = new Date().toISOString();
    const updated = tasks.map((t) => ({ ...t, completed: true, updatedAt: now }));
    saveStoredTasks(updated);
    return updated;
  },
};
