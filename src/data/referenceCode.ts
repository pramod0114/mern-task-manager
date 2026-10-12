import JSZip from 'jszip';
import { ProjectFile } from '../types';

export const REFERENCE_FILES: ProjectFile[] = [
  // SERVER FILES
  {
    path: 'server/package.json',
    name: 'package.json',
    directory: 'server',
    description: 'Server dependencies, scripts, and type configuration for Express and Mongoose.',
    language: 'json',
    content: `{
  "name": "mern-task-manager-server",
  "version": "1.0.0",
  "description": "Express REST API backend for SY MCA Practical No. 10",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mongoose": "^8.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}`,
  },
  {
    path: 'server/models/Task.js',
    name: 'Task.js',
    directory: 'server',
    description: 'Mongoose schema and model definition with validation and timestamps.',
    language: 'javascript',
    content: `const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    category: {
      type: String,
      default: 'General'
    },
    dueDate: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task', taskSchema);`,
  },
  {
    path: 'server/routes/taskRoutes.js',
    name: 'taskRoutes.js',
    directory: 'server',
    description: 'REST API routes handling CRUD operations for tasks (GET, POST, PUT, PATCH, DELETE).',
    language: 'javascript',
    content: `const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// 1. GET /api/tasks - Retrieve all tasks (sorted by newest first)
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
  }
});

// 2. GET /api/tasks/:id - Retrieve single task by MongoDB _id
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task', details: error.message });
  }
});

// 3. POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, category, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTask = new Task({
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      category: category || 'General',
      dueDate: dueDate || ''
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create task', details: error.message });
  }
});

// 4. PUT /api/tasks/:id - Update full task details
router.put('/:id', async (req, res) => {
  try {
    const { title, description, completed, priority, category, dueDate } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed, priority, category, dueDate },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update task', details: error.message });
  }
});

// 5. PATCH /api/tasks/:id/toggle - Toggle completion status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed;
    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle task', details: error.message });
  }
});

// 6. DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task', details: error.message });
  }
});

module.exports = router;`,
  },
  {
    path: 'server/app.js',
    name: 'app.js',
    directory: 'server',
    description: 'Express application config, CORS rules, JSON parser, and routes.',
    language: 'javascript',
    content: `const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Allowed origins: allow local Vite and deployed Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked origin: ' + origin));
  },
  credentials: true
}));

app.use(express.json());

// Health check endpoint for lab verification
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'MERN Task Manager API (Practical No. 10)'
  });
});

// Mount task CRUD routes
app.use('/api/tasks', taskRoutes);

// Root path fallback
app.get('/', (req, res) => {
  res.send('MERN Task Manager API is running. Check /api/health or /api/tasks');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

module.exports = app;`,
  },
  {
    path: 'server/server.js',
    name: 'server.js',
    directory: 'server',
    description: 'Entry point that connects to MongoDB Atlas using Mongoose and listens on PORT.',
    language: 'javascript',
    content: `require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not set in environment variables!');
  process.exit(1);
}

// Connect to MongoDB Atlas
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✓ Successfully connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(\`✓ Server listening on http://localhost:\${PORT}\`);
      console.log(\`✓ Health check: http://localhost:\${PORT}/api/health\`);
    });
  })
  .catch((err) => {
    console.error('✗ MongoDB Atlas connection failed:', err.message);
    process.exit(1);
  });`,
  },
  {
    path: 'server/vercel.json',
    name: 'vercel.json',
    directory: 'server',
    description: 'Vercel serverless build configuration and route rewriting to server.js / app.js.',
    language: 'json',
    content: `{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js"
    }
  ]
}`,
  },
  {
    path: 'server/.env.example',
    name: '.env.example',
    directory: 'server',
    description: 'Template for environment variables. Never commit the actual .env file.',
    language: 'env',
    content: `# Port for local backend execution
PORT=5000

# MongoDB Atlas Connection String
# Replace DB_USER, DB_PASSWORD, and cluster-name with your real Atlas values
MONGODB_URI=mongodb+srv://<DB_USER>:<DB_PASSWORD>@<cluster-name>.mongodb.net/task_manager?retryWrites=true&w=majority

# Frontend URL for CORS configuration (no trailing slash)
FRONTEND_URL=http://localhost:5173

# Node environment
NODE_ENV=development`,
  },
  {
    path: 'server/.gitignore',
    name: '.gitignore',
    directory: 'server',
    description: 'Git ignore rules for backend node_modules and .env files.',
    language: 'markdown',
    content: `node_modules
.env
.DS_Store
npm-debug.log*`,
  },

  // CLIENT FILES
  {
    path: 'client/package.json',
    name: 'package.json',
    directory: 'client',
    description: 'Frontend dependencies (React, Vite, Axios, Lucide icons).',
    language: 'json',
    content: `{
  "name": "mern-task-manager-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.8",
    "lucide-react": "^0.363.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0"
  }
}`,
  },
  {
    path: 'client/src/api.js',
    name: 'api.js',
    directory: 'client',
    description: 'Axios HTTP client configured with baseURL from VITE_API_URL.',
    language: 'javascript',
    content: `import axios from 'axios';

// The base URL is configured via .env (VITE_API_URL) or defaults to local server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// REST API calls mapped to backend routes
export const getHealth = () => api.get('/health');
export const getTasks = () => api.get('/tasks');
export const getTask = (id) => api.get(\`/tasks/\${id}\`);
export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (id, taskData) => api.put(\`/tasks/\${id}\`, taskData);
export const toggleTask = (id) => api.patch(\`/tasks/\${id}/toggle\`);
export const deleteTask = (id) => api.delete(\`/tasks/\${id}\`);

export default api;`,
  },
  {
    path: 'client/src/App.jsx',
    name: 'App.jsx',
    directory: 'client',
    description: 'Core React component managing tasks, filter tabs, counters, and modal inputs.',
    language: 'javascript',
    content: `import React, { useState, useEffect } from 'react';
import { getTasks, createTask, toggleTask, deleteTask, updateTask } from './api';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks();
      setTasks(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to connect to backend API: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await createTask({ title, description });
      setTasks([res.data, ...tasks]);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleTask(id);
      setTasks(tasks.map(t => t._id === id ? res.data : t));
    } catch (err) {
      alert('Error toggling task: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="container">
      <header className="header">
        <h1>MERN Task Manager</h1>
        <p className="subtitle">Practical No. 10 — Full Stack Development Lab</p>
      </header>

      {/* Counters */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{totalCount}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{pendingCount}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      {/* Create Task Form */}
      <form onSubmit={handleCreate} className="task-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input-title"
        />
        <textarea
          placeholder="Optional description / details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="input-desc"
        />
        <button type="submit" className="btn-submit">Add Task</button>
      </form>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All ({totalCount})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''} 
          onClick={() => setFilter('completed')}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <p className="text-muted">Loading tasks from MongoDB Atlas...</p>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : filteredTasks.length === 0 ? (
        <p className="text-muted">No tasks found in this view.</p>
      ) : (
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <li key={task._id} className={\`task-item \${task.completed ? 'completed' : ''}\`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task._id)}
              />
              <div className="task-content">
                <span className="task-title">{task.title}</span>
                {task.description && <p className="task-desc">{task.description}</p>}
              </div>
              <button onClick={() => handleDelete(task._id)} className="btn-delete">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}`,
  },
  {
    path: 'client/src/App.css',
    name: 'App.css',
    directory: 'client',
    description: 'Clean modern CSS styling for client UI and responsive layout.',
    language: 'css',
    content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8fafc;
  color: #0f172a;
  padding: 2rem 1rem;
}

.container {
  max-width: 680px;
  margin: 0 auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
}

.subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0284c7;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.input-title, .input-desc {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
}

.btn-submit {
  background: #0284c7;
  color: #ffffff;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit:hover {
  background: #0369a1;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.filter-tabs button {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
}

.filter-tabs button.active {
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 600;
}

.task-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #94a3b8;
}

.task-content {
  flex: 1;
}

.task-title {
  font-weight: 500;
}

.task-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.2rem;
}

.btn-delete {
  background: #fee2e2;
  color: #b91c1c;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-delete:hover {
  background: #fecaca;
}

.error-box {
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 6px;
  font-size: 0.875rem;
}`,
  },
  {
    path: 'client/src/main.jsx',
    name: 'main.jsx',
    directory: 'client',
    description: 'React client entry point rendering App root.',
    language: 'javascript',
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  },
  {
    path: 'client/index.html',
    name: 'index.html',
    directory: 'client',
    description: 'HTML entry point with title and viewport meta.',
    language: 'html',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MERN Task Manager — SY MCA Lab</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  },
  {
    path: 'client/.env.example',
    name: '.env.example',
    directory: 'client',
    description: 'Vite frontend environment template specifying VITE_API_URL.',
    language: 'env',
    content: `# Backend API URL (without trailing slash)
# For local development:
VITE_API_URL=http://localhost:5000/api

# For production on Vercel:
# VITE_API_URL=https://YOUR-BACKEND.vercel.app/api`,
  },
  {
    path: 'README.md',
    name: 'README.md',
    directory: 'root',
    description: 'Practical No. 10 complete documentation and step-by-step instructions.',
    language: 'markdown',
    content: `# MERN Task Manager — SY MCA Practical No. 10

Full Stack Development Lab Practical Reference Implementation.

## Features
- Complete CRUD operations (Create, Read, Update, Delete)
- Filter by All, Pending, Completed tasks
- Real-time counters & progress
- MongoDB Atlas cloud database
- Express REST API with CORS
- React + Vite single page application
- Vercel cloud deployment for frontend & backend

## Quick Start Local
1. **Server**:
   \`\`\`bash
   cd server
   npm install
   cp .env.example .env # edit MONGODB_URI
   npm run dev
   \`\`\`
2. **Client**:
   \`\`\`bash
   cd client
   npm install
   npm run dev
   \`\`\`
`,
  },
];

export async function downloadProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  REFERENCE_FILES.forEach((file) => {
    zip.file(file.path, file.content);
  });

  return await zip.generateAsync({ type: 'blob' });
}
