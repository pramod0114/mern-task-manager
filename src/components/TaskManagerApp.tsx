import React, { useState, useMemo } from 'react';
import { Task, TaskFilter, Priority, Category } from '../types';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit3,
  Calendar,
  AlertCircle,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';

interface TaskManagerAppProps {
  tasks: Task[];
  loading: boolean;
  onToggleTask: (id: string) => Promise<void>;
  onCreateTask: (payload: {
    title: string;
    description?: string;
    priority?: Priority;
    category?: Category;
    dueDate?: string;
  }) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onResetTasks: () => Promise<void>;
  onClearCompleted: () => Promise<void>;
  onMarkAllCompleted: () => Promise<void>;
}

export const TaskManagerApp: React.FC<TaskManagerAppProps> = ({
  tasks,
  loading,
  onToggleTask,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onResetTasks,
  onClearCompleted,
  onMarkAllCompleted,
}) => {
  // Filters & Search
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'dueDate'>('newest');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newCategory, setNewCategory] = useState<Category>('Project');
  const [newDueDate, setNewDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editCategory, setEditCategory] = useState<Category>('General');
  const [editDueDate, setEditDueDate] = useState('');

  // Undo Notification
  const [undoBanner, setUndoBanner] = useState<{ visible: boolean; task?: Task } | null>(null);

  // Compute Statistics
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (filter === 'pending' && task.completed) return false;
        if (filter === 'completed' && !task.completed) return false;

        // Category filter
        if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;

        // Priority filter
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description.toLowerCase().includes(q);
          const matchCat = task.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'priority') {
          const weight = { high: 3, medium: 2, low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        return 0;
      });
  }, [tasks, filter, selectedCategory, selectedPriority, searchQuery, sortBy]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreateTask({
        title: newTitle.trim(),
        description: newDescription.trim(),
        priority: newPriority,
        category: newCategory,
        dueDate: newDueDate || undefined,
      });

      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewPriority('medium');
      setNewCategory('Project');
      setNewDueDate('');
      setShowAddForm(false);
    } catch (err: any) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditDueDate(task.dueDate || '');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
  };

  const saveEditing = async (id: string) => {
    if (!editTitle.trim()) return;
    await onUpdateTask(id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      category: editCategory,
      dueDate: editDueDate || undefined,
    });
    setEditingTaskId(null);
  };

  const handleDeleteWithUndo = async (task: Task) => {
    await onDeleteTask(task._id);
    setUndoBanner({ visible: true, task });
    setTimeout(() => {
      setUndoBanner((prev) => (prev?.task?._id === task._id ? null : prev));
    }, 5000);
  };

  const handleUndo = async () => {
    if (undoBanner?.task) {
      const t = undoBanner.task;
      await onCreateTask({
        title: t.title,
        description: t.description,
        priority: t.priority,
        category: t.category,
        dueDate: t.dueDate,
      });
      setUndoBanner(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const priorityClasses = {
    high: 'text-rose-700 font-medium',
    medium: 'text-amber-700 font-medium',
    low: 'text-slate-600 font-medium',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Undo Notification Banner */}
      {undoBanner?.visible && (
        <div className="mb-6 p-3 bg-slate-900 text-white text-sm rounded-lg flex items-center justify-between shadow-md transition-all">
          <span>Task "{undoBanner.task?.title}" deleted.</span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold px-2 py-0.5 rounded text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo
          </button>
        </div>
      )}

      {/* Main Header Card / KPI Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Task Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Keep track of your tasks, priority items, and project milestones
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Close Form' : 'New Task'}</span>
            </button>

            <button
              onClick={onResetTasks}
              title="Reset to Sample Tasks"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Tasks</span>
            </button>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Tasks</span>
              <span className="text-xs text-slate-400">All registered</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-slate-900">{totalCount}</span>
              <span className="text-xs text-slate-500">items</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-800">Pending Tasks</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-amber-900">{pendingCount}</span>
              <span className="text-xs text-amber-700">active</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-emerald-900">{completedCount}</span>
              <span className="text-xs text-emerald-700">finished</span>
            </div>
          </div>

          <div className="p-4 bg-sky-50/50 rounded-lg border border-sky-100/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-sky-800">Completion Rate</span>
              <span className="text-xs tabular-nums font-semibold text-sky-700">{completionPercentage}%</span>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Add Task Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white border border-sky-200 rounded-xl p-6 mb-8 shadow-xs transition-all"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Add New Task (POST /api/tasks)
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Implement PATCH endpoint for task completion toggle"
                required
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description / Details
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add sub-tasks, lab criteria, or technical details..."
                rows={2}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Project">Project</option>
                  <option value="Database">Database</option>
                  <option value="Study">Study</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newTitle.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Saving to Database...' : 'Save Task'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Control Bar: Filters, Search & Bulk Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tasks ({totalCount})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'completed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by keyword..."
              className="w-full pl-9 pr-8 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Selectors for Category & Sort */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Project">Project</option>
              <option value="Database">Database</option>
              <option value="Study">Study</option>
              <option value="General">General</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">High Priority</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Buttons Row */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
          <div className="text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filteredTasks.length}</span> of {totalCount} tasks
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <button
                onClick={onMarkAllCompleted}
                className="text-sky-700 hover:text-sky-900 font-medium"
              >
                Mark All Done
              </button>
            )}
            {completedCount > 0 && (
              <button
                onClick={onClearCompleted}
                className="text-rose-700 hover:text-rose-900 font-medium"
              >
                Clear Completed
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
            <p className="text-sm">Fetching tasks from MongoDB...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No tasks found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search query or category filter.'
                : filter === 'completed'
                ? 'No completed tasks yet. Mark tasks as finished using the checkbox.'
                : 'All caught up! Add a new task using the button above.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
              >
                Create Task
              </button>
              <button
                onClick={onResetTasks}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Load Sample Tasks
              </button>
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isEditing = editingTaskId === task._id;

            if (isEditing) {
              return (
                <div
                  key={task._id}
                  className="bg-white border-2 border-sky-400 rounded-xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-sky-700">Editing Task Details</span>
                    <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Task title"
                  />

                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Description"
                    rows={2}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as Priority)}
                      className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>

                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as Category)}
                      className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Project">Project</option>
                      <option value="Database">Database</option>
                      <option value="Study">Study</option>
                      <option value="General">General</option>
                    </select>

                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEditing(task._id)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Changes
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={task._id}
                className={`bg-white border rounded-xl p-4 transition-all duration-200 flex items-start gap-3.5 hover:shadow-xs ${
                  task.completed
                    ? 'border-slate-200/80 bg-slate-50/40 text-slate-500'
                    : 'border-slate-200 text-slate-900'
                }`}
              >
                {/* Checkbox Button */}
                <button
                  type="button"
                  onClick={() => onToggleTask(task._id)}
                  title={task.completed ? 'Mark pending' : 'Mark completed'}
                  className="mt-0.5 text-slate-400 hover:text-sky-600 transition-colors focus-visible:outline-none shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : (
                    <Circle className="w-5 h-5 hover:text-sky-600" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-sm font-semibold leading-snug break-words ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p
                      className={`text-xs mt-1 leading-relaxed break-words ${
                        task.completed ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Clean unboxed metadata with typographic separators (Zero-Pill Discipline) */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2.5">
                    <span className={priorityClasses[task.priority]}>
                      {task.priority.toUpperCase()} PRIORITY
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{task.category}</span>

                    {task.dueDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Due {formatDate(task.dueDate)}
                        </span>
                      </>
                    )}

                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {formatDate(task.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditing(task)}
                    title="Edit task (PUT /api/tasks/:id)"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWithUndo(task)}
                    title="Delete task (DELETE /api/tasks/:id)"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
