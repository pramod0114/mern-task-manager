import React, { useState, useEffect, useCallback } from 'react';
import { Task, Priority, Category } from './types';
import { taskService } from './services/taskService';
import { Navbar } from './components/Navbar';
import { TaskManagerApp } from './components/TaskManagerApp';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getAllTasks();
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleTask = async (id: string) => {
    try {
      const res = await taskService.toggleTask(id);
      if (res.status === 200) {
        setTasks((prev) => prev.map((t) => (t._id === id ? (res.data as Task) : t)));
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleCreateTask = async (payload: {
    title: string;
    description?: string;
    priority?: Priority;
    category?: Category;
    dueDate?: string;
  }) => {
    try {
      const res = await taskService.createTask(payload);
      if (res.status === 201) {
        setTasks((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const res = await taskService.updateTask(id, updates);
      if (res.status === 200) {
        setTasks((prev) => prev.map((t) => (t._id === id ? (res.data as Task) : t)));
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await taskService.deleteTask(id);
      if (res.status === 200) {
        setTasks((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleResetTasks = async () => {
    const defaultTasks = await taskService.resetTasks();
    setTasks(defaultTasks);
  };

  const handleClearCompleted = async () => {
    const remaining = await taskService.clearCompleted();
    setTasks(remaining);
  };

  const handleMarkAllCompleted = async () => {
    const updated = await taskService.markAllCompleted();
    setTasks(updated);
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Clean Navbar */}
      <Navbar />

      {/* Main Content Area: Task Manager */}
      <main className="flex-1 pb-16">
        <TaskManagerApp
          tasks={tasks}
          loading={loading}
          onToggleTask={handleToggleTask}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onResetTasks={handleResetTasks}
          onClearCompleted={handleClearCompleted}
          onMarkAllCompleted={handleMarkAllCompleted}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">MERN Task Manager</span>
            <span aria-hidden="true">·</span>
            <span>React, Express, Node.js & MongoDB</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <a
              href="https://mern-task-manager-3w4u-91wuuw6df-ashishdk.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 hover:underline"
            >
              Live Reference
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
