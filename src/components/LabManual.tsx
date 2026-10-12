import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ShieldAlert,
  Server,
  Cloud,
  Layers,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const LabManual: React.FC = () => {
  // Student customized inputs for helper generators
  const [githubUser, setGithubUser] = useState('student-mca');
  const [dbUser, setDbUser] = useState('mca_admin');
  const [dbPass, setDbPass] = useState('SecurePass123');
  const [clusterName, setClusterName] = useState('cluster0.abcde');

  // Submission report generator state
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [prnNo, setPrnNo] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveFrontendUrl, setLiveFrontendUrl] = useState('');
  const [liveBackendUrl, setLiveBackendUrl] = useState('');

  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sec3: true,
    sec4: true,
    sec7: true,
    sec8: true,
    sec9: true,
    sec11: true,
    sec12: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const atlasConnectionString = `mongodb+srv://${dbUser}:${dbPass}@${clusterName}.mongodb.net/task_manager?retryWrites=true&w=majority`;

  const gitCommands = `# Open CMD at project root
git init
git add .
git commit -m "Initial MERN Task Manager - Practical No. 10"
git branch -M main
git remote add origin https://github.com/${githubUser}/mern-task-manager.git
git push -u origin main`;

  const generateReport = () => {
    return `# SY MCA Full Stack Development Lab
## Practical No. 10: MERN Stack Task Manager Application and Mini Project

**Student Name:** ${studentName || '[Student Name]'}
**Roll No:** ${rollNo || '[Roll No]'}
**PRN:** ${prnNo || '[PRN No]'}
**Date of Submission:** 2026-10-12

---

### 1. Project Links
- **GitHub Repository:** ${repoUrl || `https://github.com/${githubUser}/mern-task-manager`}
- **Live Frontend (Vercel):** ${liveFrontendUrl || 'https://mern-task-manager-client.vercel.app'}
- **Live Backend Health API:** ${liveBackendUrl || 'https://mern-task-manager-server.vercel.app/api/health'}

---

### 2. Architecture & Tech Stack
- **Database:** MongoDB Atlas (M0 Shared Cloud Cluster, Mongoose ODM)
- **Backend:** Node.js, Express.js REST API with CORS & JSON body parser
- **Frontend:** React 18, Vite, Single Page Application with filter tabs
- **Deployment:** Vercel (Express Serverless via @vercel/node & Vite static SPA)

---

### 3. REST API Test Results
| Endpoint | Method | Status | Verified Functionality |
|---|---|---|---|
| /api/health | GET | 200 OK | Database connection & service health verified |
| /api/tasks | GET | 200 OK | Fetched all tasks sorted by createdAt desc |
| /api/tasks | POST | 201 Created | Created task with title and priority |
| /api/tasks/:id | PUT | 200 OK | Full update of task title and description |
| /api/tasks/:id/toggle | PATCH | 200 OK | Toggled task completion boolean flag |
| /api/tasks/:id | DELETE | 200 OK | Deleted task document by MongoDB ObjectId |

---

### 4. Learning Outcome & Conclusion
Successfully designed, implemented, and deployed a complete full-stack MERN application with cloud persistence on MongoDB Atlas and serverless hosting on Vercel. Handled CORS restrictions, environment variables security, and RESTful API conventions.`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Practical No. 10 — Lab Manual & Deployment Reference
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Full Stack Development Lab | Reference guide by Prof. Ashish Dhananjay Kulkarni (RIT India)
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Prerequisites */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div
          onClick={() => toggleSection('sec1')}
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>1. Prerequisites & Environment Verification</span>
          </h2>
          {openSections.sec1 ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>

        {openSections.sec1 && (
          <div className="p-5 space-y-4 text-sm text-slate-700">
            <p>Verify that the required development tools are installed on your machine via Command Prompt (CMD):</p>
            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-lg relative">
              <pre>{`node -v     # Must be LTS (Node 18 or 20/22)
npm -v      # Node Package Manager
git --version`}</pre>
            </div>
            <p className="text-xs text-slate-500">
              Ensure you also have active accounts on <strong className="text-slate-800">GitHub</strong>,{' '}
              <strong className="text-slate-800">MongoDB Atlas</strong>, and <strong className="text-slate-800">Vercel</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Section 3: MongoDB Atlas Interactive Setup */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div
          onClick={() => toggleSection('sec3')}
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            <span>3. Set up MongoDB Atlas (Cloud Database)</span>
          </h2>
          {openSections.sec3 ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>

        {openSections.sec3 && (
          <div className="p-5 space-y-4 text-sm text-slate-700">
            <ol className="list-decimal pl-5 space-y-2 text-xs leading-relaxed">
              <li>
                Visit <strong>https://www.mongodb.com/atlas/database</strong> and sign in.
              </li>
              <li>Create a free shared cluster (M0 Sandbox).</li>
              <li>
                Under <strong>Security → Database Access</strong>: Add new Database User with Read & Write privileges.
              </li>
              <li>
                Under <strong>Security → Network Access</strong>: Click <em>Add IP Address</em> and allow{' '}
                <code className="text-emerald-700 font-bold">0.0.0.0/0</code> (Allow Access from Anywhere) so Vercel serverless functions can connect.
              </li>
              <li>Under <strong>Database → Connect → Drivers</strong>: Copy the connection string.</li>
            </ol>

            {/* Interactive URI Builder */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="text-xs font-semibold text-slate-900">
                Interactive Connection String Builder
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Database Username</label>
                  <input
                    type="text"
                    value={dbUser}
                    onChange={(e) => setDbUser(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">User Password</label>
                  <input
                    type="text"
                    value={dbPass}
                    onChange={(e) => setDbPass(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Cluster Host</label>
                  <input
                    type="text"
                    value={clusterName}
                    onChange={(e) => setClusterName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded text-emerald-400 font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto">
                <span className="truncate">{atlasConnectionString}</span>
                <button
                  onClick={() => copyToClipboard(atlasConnectionString, 'atlas_uri')}
                  className="px-2 py-1 bg-slate-800 text-white rounded text-[11px] shrink-0 hover:bg-slate-700"
                >
                  {copiedSection === 'atlas_uri' ? 'Copied' : 'Copy URI'}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-rose-700 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Never share passwords or commit your .env file to GitHub.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Install & Run Locally */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div
          onClick={() => toggleSection('sec4')}
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-sky-600" />
            <span>4. Install and Run Locally (Two Terminals)</span>
          </h2>
          {openSections.sec4 ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>

        {openSections.sec4 && (
          <div className="p-5 space-y-4 text-xs text-slate-700">
            <div>
              <div className="font-semibold text-slate-900 mb-1">Terminal 1: Express Backend</div>
              <div className="bg-slate-950 text-slate-200 font-mono p-3 rounded-lg">
                <pre>{`cd server
npm install
# Ensure .env contains PORT=5000 and your MONGODB_URI
npm run dev`}</pre>
              </div>
              <p className="text-slate-500 mt-1">Backend runs on http://localhost:5000. Verify health at /api/health.</p>
            </div>

            <div>
              <div className="font-semibold text-slate-900 mb-1">Terminal 2: React Frontend</div>
              <div className="bg-slate-950 text-slate-200 font-mono p-3 rounded-lg">
                <pre>{`cd client
npm install
# Ensure client/.env contains: VITE_API_URL=http://localhost:5000/api
npm run dev`}</pre>
              </div>
              <p className="text-slate-500 mt-1">Vite opens frontend on http://localhost:5173.</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 7: GitHub Push Commands */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div
          onClick={() => toggleSection('sec7')}
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>7. Push Project to GitHub</span>
          </h2>
          {openSections.sec7 ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>

        {openSections.sec7 && (
          <div className="p-5 space-y-4 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <label className="text-slate-600 font-medium">Your GitHub Username:</label>
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded font-mono text-xs"
              />
            </div>

            <div className="bg-slate-950 text-slate-200 font-mono p-3.5 rounded-lg relative">
              <pre>{gitCommands}</pre>
              <button
                onClick={() => copyToClipboard(gitCommands, 'git_cmds')}
                className="absolute right-3 top-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px]"
              >
                {copiedSection === 'git_cmds' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 8 & 9: Vercel Deployment */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div
          onClick={() => toggleSection('sec8')}
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-600" />
            <span>8 & 9. Step-by-Step Vercel Deployment</span>
          </h2>
          {openSections.sec8 ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>

        {openSections.sec8 && (
          <div className="p-5 space-y-6 text-xs text-slate-700">
            {/* Backend deploy */}
            <div className="space-y-2 border-l-2 border-indigo-400 pl-3">
              <div className="font-bold text-slate-900 text-sm">Step 1: Deploy Backend to Vercel</div>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Log in to <strong>vercel.com</strong> with GitHub.</li>
                <li>Import your GitHub repository <code>mern-task-manager</code>.</li>
                <li>
                  Set <strong>Root Directory</strong> to: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">server</code>.
                </li>
                <li>
                  Add Environment Variables in Vercel:
                  <ul className="list-disc pl-4 mt-1 font-mono text-[11px] text-slate-600">
                    <li>MONGODB_URI = your full MongoDB Atlas connection string</li>
                    <li>NODE_ENV = production</li>
                  </ul>
                </li>
                <li>Click <strong>Deploy</strong> and note your backend URL (e.g. <code>https://your-backend.vercel.app</code>).</li>
                <li>Test <code>https://your-backend.vercel.app/api/health</code> in your browser.</li>
              </ol>
            </div>

            {/* Frontend deploy */}
            <div className="space-y-2 border-l-2 border-sky-400 pl-3">
              <div className="font-bold text-slate-900 text-sm">Step 2: Deploy Frontend to Vercel</div>
              <ol className="list-decimal pl-4 space-y-1">
                <li>In Vercel dashboard, click <strong>Add New... → Project</strong>.</li>
                <li>Select the <em>same repository</em>.</li>
                <li>
                  Set <strong>Root Directory</strong> to: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">client</code>.
                </li>
                <li>Framework preset will automatically detect <strong>Vite</strong>.</li>
                <li>
                  Add Environment Variable:
                  <ul className="list-disc pl-4 mt-1 font-mono text-[11px] text-slate-600">
                    <li>VITE_API_URL = https://your-backend.vercel.app/api (no trailing slash)</li>
                  </ul>
                </li>
                <li>Click <strong>Deploy</strong>.</li>
              </ol>
            </div>

            {/* CORS configuration */}
            <div className="space-y-2 border-l-2 border-emerald-400 pl-3">
              <div className="font-bold text-slate-900 text-sm">Step 3: Update CORS on Backend</div>
              <p>
                In your backend project on Vercel, go to <strong>Settings → Environment Variables</strong> and add:
              </p>
              <div className="font-mono bg-slate-100 p-2 rounded text-[11px]">
                FRONTEND_URL = https://your-frontend.vercel.app
              </div>
              <p>Then redeploy the backend so it accepts requests from the frontend domain.</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 11: Troubleshooting Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div
          onClick={() => toggleSection('sec11')}
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>11. Practical Troubleshooting Matrix</span>
          </h2>
          {openSections.sec11 ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>

        {openSections.sec11 && (
          <div className="p-5 space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900">PowerShell: Scripts disabled error</div>
                <div className="text-slate-600 mt-1">
                  Cause: Windows Restricted ExecutionPolicy.
                  <br />
                  Fix: Use regular CMD, or run <code className="font-mono text-sky-700">npm.cmd run dev</code>.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900">node:util / styleText error</div>
                <div className="text-slate-600 mt-1">
                  Cause: Outdated Node.js version.
                  <br />
                  Fix: Update to latest LTS release (Node 20 or 22).
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900">MongoDB connection timeout</div>
                <div className="text-slate-600 mt-1">
                  Cause: Network IP access restricted in Atlas.
                  <br />
                  Fix: Add <code className="font-mono text-emerald-700">0.0.0.0/0</code> in Atlas Network Access.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900">Frontend loads but tasks fail to fetch</div>
                <div className="text-slate-600 mt-1">
                  Cause: Mismatched VITE_API_URL or CORS blocked.
                  <br />
                  Fix: Inspect browser Network tab; ensure VITE_API_URL points to deployed backend /api.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 12: Submission Report Generator */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div
          onClick={() => toggleSection('sec12')}
          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-100"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>12. Practical 10 Submission Report Generator</span>
          </h2>
          {openSections.sec12 ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>

        {openSections.sec12 && (
          <div className="p-5 space-y-4 text-xs text-slate-700">
            <p>Fill in your details below to generate a formatted submission report ready for your lab journal:</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Roll No.</label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. 24MCA042"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">PRN No.</label>
                <input
                  type="text"
                  value={prnNo}
                  onChange={(e) => setPrnNo(e.target.value)}
                  placeholder="e.g. 2024010192"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">GitHub Repo URL</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/user/repo"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Live Frontend URL</label>
                <input
                  type="text"
                  value={liveFrontendUrl}
                  onChange={(e) => setLiveFrontendUrl(e.target.value)}
                  placeholder="https://my-app.vercel.app"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Backend Health URL</label>
                <input
                  type="text"
                  value={liveBackendUrl}
                  onChange={(e) => setLiveBackendUrl(e.target.value)}
                  placeholder="https://my-api.vercel.app/api/health"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">Generated Markdown Submission Report</span>
                <button
                  onClick={() => copyToClipboard(generateReport(), 'report')}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded text-xs hover:bg-slate-800"
                >
                  {copiedSection === 'report' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'report' ? 'Report Copied!' : 'Copy Report'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap">
                {generateReport()}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
