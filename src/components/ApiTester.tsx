import React, { useState } from 'react';
import { Task, ApiEndpoint } from '../types';
import { taskService, getApiConfig } from '../services/taskService';
import {
  Terminal,
  Send,
  Copy,
  Check,
  Code2,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ApiTesterProps {
  tasks: Task[];
  onTasksChanged: () => Promise<void>;
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'health',
    method: 'GET',
    path: '/health',
    description: 'API health check & MongoDB Atlas connectivity status',
  },
  {
    id: 'get_all',
    method: 'GET',
    path: '/tasks',
    description: 'Retrieve all tasks sorted by newest first',
  },
  {
    id: 'get_one',
    method: 'GET',
    path: '/tasks/:id',
    description: 'Retrieve single task document by MongoDB ObjectId',
    requiresId: true,
  },
  {
    id: 'create',
    method: 'POST',
    path: '/tasks',
    description: 'Create a new task with title and optional description',
    sampleBody: {
      title: 'Prepare DBMS Practical No. 10',
      description: 'Revise MongoDB aggregation pipeline and index creation',
      priority: 'high',
      category: 'Lab Practical',
      dueDate: '2026-10-25',
    },
  },
  {
    id: 'update',
    method: 'PUT',
    path: '/tasks/:id',
    description: 'Update full task title, description, and completion status',
    requiresId: true,
    sampleBody: {
      title: 'Prepare DBMS Practical No. 10 (Updated)',
      description: 'Completed joins, indexes, and Atlas deployment verify',
      completed: true,
      priority: 'medium',
      category: 'Lab Practical',
    },
  },
  {
    id: 'toggle',
    method: 'PATCH',
    path: '/tasks/:id/toggle',
    description: 'Quick toggle completed boolean flag on task',
    requiresId: true,
  },
  {
    id: 'delete',
    method: 'DELETE',
    path: '/tasks/:id',
    description: 'Delete task from MongoDB database by ID',
    requiresId: true,
  },
];

export const ApiTester: React.FC<ApiTesterProps> = ({ tasks, onTasksChanged }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(ENDPOINTS[0]);
  const [targetId, setTargetId] = useState<string>(tasks[0]?._id || 'task_001');
  const [requestBodyText, setRequestBodyText] = useState<string>(
    JSON.stringify(ENDPOINTS[3].sampleBody, null, 2)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState<{
    status: number;
    statusText: string;
    latencyMs: number;
    headers: Record<string, string>;
    data: any;
  } | null>(null);
  const [codeSnippetTab, setCodeSnippetTab] = useState<'curl' | 'fetch' | 'axios' | 'postman'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  const config = getApiConfig();
  const baseUrl = config.mode === 'remote' ? config.remoteUrl : 'http://localhost:5000/api';

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    if (ep.sampleBody) {
      setRequestBodyText(JSON.stringify(ep.sampleBody, null, 2));
    }
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponseOutput(null);

    try {
      let res: any;
      const effectiveId = targetId || tasks[0]?._id || 'task_001';

      switch (selectedEndpoint.id) {
        case 'health':
          res = await taskService.getHealth();
          break;
        case 'get_all':
          res = await taskService.getAllTasks();
          break;
        case 'get_one':
          res = await taskService.getTaskById(effectiveId);
          break;
        case 'create': {
          let parsedBody = {};
          try {
            parsedBody = JSON.parse(requestBodyText);
          } catch {
            parsedBody = { title: 'New Task' };
          }
          res = await taskService.createTask(parsedBody as any);
          await onTasksChanged();
          break;
        }
        case 'update': {
          let parsedBody = {};
          try {
            parsedBody = JSON.parse(requestBodyText);
          } catch {
            parsedBody = {};
          }
          res = await taskService.updateTask(effectiveId, parsedBody as any);
          await onTasksChanged();
          break;
        }
        case 'toggle':
          res = await taskService.toggleTask(effectiveId);
          await onTasksChanged();
          break;
        case 'delete':
          res = await taskService.deleteTask(effectiveId);
          await onTasksChanged();
          break;
        default:
          res = await taskService.getHealth();
      }

      setResponseOutput(res);
    } catch (err: any) {
      setResponseOutput({
        status: 500,
        statusText: 'Internal Error',
        latencyMs: 12,
        headers: { 'content-type': 'application/json' },
        data: { error: err.message },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resolvedPath = selectedEndpoint.requiresId
    ? selectedEndpoint.path.replace(':id', targetId || '{id}')
    : selectedEndpoint.path;

  const fullUrl = `${baseUrl}${resolvedPath}`;

  // Generate code snippet
  const getCodeSnippet = () => {
    switch (codeSnippetTab) {
      case 'curl': {
        let cmd = `curl -X ${selectedEndpoint.method} "${fullUrl}" \\\n  -H "Content-Type: application/json"`;
        if (selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') {
          cmd += ` \\\n  -d '${requestBodyText.replace(/\n/g, '')}'`;
        }
        return cmd;
      }
      case 'fetch': {
        const options: any = {
          method: selectedEndpoint.method,
          headers: { 'Content-Type': 'application/json' },
        };
        if (selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') {
          options.body = 'JSON.parse(...)';
        }
        return `// JavaScript Fetch (ES6)\nconst response = await fetch("${fullUrl}", {\n  method: "${selectedEndpoint.method}",\n  headers: { "Content-Type": "application/json" }${
          selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT'
            ? `,\n  body: JSON.stringify(${requestBodyText})`
            : ''
        }\n});\nconst data = await response.json();\nconsole.log(data);`;
      }
      case 'axios': {
        if (selectedEndpoint.method === 'GET' || selectedEndpoint.method === 'DELETE') {
          return `// Axios Client\nimport axios from 'axios';\n\nconst res = await axios.${selectedEndpoint.method.toLowerCase()}("${fullUrl}");\nconsole.log(res.data);`;
        }
        return `// Axios Client\nimport axios from 'axios';\n\nconst payload = ${requestBodyText};\nconst res = await axios.${selectedEndpoint.method.toLowerCase()}("${fullUrl}", payload);\nconsole.log(res.data);`;
      }
      case 'postman': {
        return JSON.stringify(
          {
            info: { name: 'MERN Task Manager Practical 10', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
            item: [
              {
                name: `${selectedEndpoint.method} ${selectedEndpoint.path}`,
                request: {
                  method: selectedEndpoint.method,
                  header: [{ key: 'Content-Type', value: 'application/json' }],
                  url: { raw: fullUrl },
                  body:
                    selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT'
                      ? { mode: 'raw', raw: requestBodyText }
                      : undefined,
                },
              },
            ],
          },
          null,
          2
        );
      }
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const methodBadgeColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700 border-blue-200',
    POST: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    PUT: 'bg-amber-100 text-amber-700 border-amber-200',
    PATCH: 'bg-purple-100 text-purple-700 border-purple-200',
    DELETE: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-emerald-600" />
              Interactive REST API Explorer
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Test and inspect all 7 endpoints defined in Practical No. 10 Section 5 against Express and MongoDB Atlas
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            <span>Base URL:</span>
            <span className="font-semibold text-slate-800">{baseUrl}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Endpoints Directory */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Standard Practical 10 Endpoints (7)
          </h2>

          <div className="space-y-2">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-sky-50/50 border-sky-400 shadow-xs ring-1 ring-sky-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                      methodBadgeColors[ep.method]
                    }`}
                  >
                    {ep.method}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs font-semibold text-slate-900 truncate">
                      {ep.path}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ep.description}</p>
                  </div>
                  {isSelected && <ArrowRight className="w-4 h-4 text-sky-600 shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>

          {/* Quick info box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              REST API Lab Requirement
            </div>
            <p>
              Express router mounts these controllers at <code className="text-slate-800">/api/tasks</code>.
              Health check lives at <code className="text-slate-800">/api/health</code>.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Console & Response Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Request Configurator Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-1 rounded border ${
                    methodBadgeColors[selectedEndpoint.method]
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800 truncate">
                  {resolvedPath}
                </span>
              </div>

              <button
                onClick={handleSendRequest}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Executing...' : 'Send Request'}</span>
              </button>
            </div>

            {/* Target ID Selector if required */}
            {selectedEndpoint.requiresId && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Task ID (<code className="text-sky-700">:id</code> parameter)
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                  >
                    {tasks.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t._id} — {t.title.slice(0, 35)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Body Payload Editor for POST/PUT */}
            {(selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">Request Body (JSON)</label>
                  <button
                    type="button"
                    onClick={() =>
                      setRequestBodyText(
                        JSON.stringify(selectedEndpoint.sampleBody || {}, null, 2)
                      )
                    }
                    className="text-[11px] text-sky-600 hover:text-sky-800"
                  >
                    Reset Sample Body
                  </button>
                </div>
                <textarea
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  rows={6}
                  className="w-full font-mono text-xs p-3 bg-slate-900 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}
          </div>

          {/* Response Viewer Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  HTTP Response Inspector
                </h3>
              </div>

              {responseOutput && (
                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      responseOutput.status >= 200 && responseOutput.status < 300
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {responseOutput.status} {responseOutput.statusText}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-500 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {responseOutput.latencyMs}ms
                  </span>
                </div>
              )}
            </div>

            {responseOutput ? (
              <div className="space-y-3">
                {/* Headers bar */}
                <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 flex flex-wrap gap-x-4 gap-y-1">
                  <span>content-type: application/json</span>
                  <span>x-powered-by: Express</span>
                  <span>access-control-allow-origin: *</span>
                </div>

                {/* Formatted JSON */}
                <pre className="font-mono text-xs bg-slate-950 text-emerald-400 p-4 rounded-lg overflow-x-auto max-h-80 border border-slate-900 shadow-inner">
                  {JSON.stringify(responseOutput.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs">Click "Send Request" to invoke this endpoint and inspect the live JSON response.</p>
              </div>
            )}
          </div>

          {/* Code Snippets Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                {(['curl', 'fetch', 'axios', 'postman'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCodeSnippetTab(tab)}
                    className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                      codeSnippetTab === tab
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'curl' ? 'cURL' : tab}
                  </button>
                ))}
              </div>

              <button
                onClick={copyCode}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <pre className="font-mono text-xs bg-slate-900 text-sky-300 p-3.5 rounded-lg overflow-x-auto max-h-48 border border-slate-800">
              {getCodeSnippet()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
