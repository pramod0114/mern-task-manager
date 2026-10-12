import React, { useState } from 'react';
import { ProjectFile } from '../types';
import { REFERENCE_FILES, downloadProjectZip } from '../data/referenceCode';
import {
  FileCode,
  Folder,
  Copy,
  Check,
  Download,
  Terminal,
  FileText,
  Search,
  ExternalLink,
  Info,
} from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(REFERENCE_FILES[1]); // default to Task.js
  const [fileSearch, setFileSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await downloadProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mern-task-manager.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredFiles = REFERENCE_FILES.filter((file) =>
    file.path.toLowerCase().includes(fileSearch.toLowerCase())
  );

  const serverFiles = filteredFiles.filter((f) => f.directory === 'server');
  const clientFiles = filteredFiles.filter((f) => f.directory === 'client');
  const rootFiles = filteredFiles.filter((f) => f.directory === 'root');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileCode className="w-6 h-6 text-indigo-600" />
            Project Structure & Complete Source Code
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and download the exact production-ready files specified for Practical No. 10
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Generating ZIP...' : 'Download Project ZIP (Ready to Run)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: File Tree */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                placeholder="Filter files..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 text-xs font-mono">
              {/* Server directory */}
              {serverFiles.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 px-2 py-0.5">
                    <Folder className="w-3.5 h-3.5 text-amber-500" />
                    <span>server/</span>
                  </div>
                  <div className="space-y-1 pl-3">
                    {serverFiles.map((file) => {
                      const isSelected = selectedFile.path === file.path;
                      return (
                        <button
                          key={file.path}
                          onClick={() => setSelectedFile(file)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{file.path.replace('server/', '')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Client directory */}
              {clientFiles.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 px-2 py-0.5">
                    <Folder className="w-3.5 h-3.5 text-sky-500" />
                    <span>client/</span>
                  </div>
                  <div className="space-y-1 pl-3">
                    {clientFiles.map((file) => {
                      const isSelected = selectedFile.path === file.path;
                      return (
                        <button
                          key={file.path}
                          onClick={() => setSelectedFile(file)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{file.path.replace('client/', '')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Root directory */}
              {rootFiles.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 px-2 py-0.5">
                    <Folder className="w-3.5 h-3.5 text-slate-400" />
                    <span>root/</span>
                  </div>
                  <div className="space-y-1 pl-3">
                    {rootFiles.map((file) => {
                      const isSelected = selectedFile.path === file.path;
                      return (
                        <button
                          key={file.path}
                          onClick={() => setSelectedFile(file)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{file.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {/* File Info Bar */}
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span className="font-mono text-xs font-bold text-slate-900">{selectedFile.path}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* File Description note */}
            <div className="px-5 py-2.5 bg-indigo-50/40 border-b border-indigo-100/60 text-xs text-indigo-900 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>{selectedFile.description}</span>
            </div>

            {/* Code Content with Line Numbers */}
            <div className="relative font-mono text-xs bg-slate-950 text-slate-100 p-4 overflow-x-auto max-h-[580px] leading-relaxed">
              <pre className="flex">
                <span className="text-slate-600 select-none pr-4 text-right border-r border-slate-800 shrink-0">
                  {selectedFile.content.split('\n').map((_, i) => (
                    <span key={i} className="block">
                      {i + 1}
                    </span>
                  ))}
                </span>
                <code className="pl-4 text-slate-200 overflow-x-visible whitespace-pre">
                  {selectedFile.content}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
