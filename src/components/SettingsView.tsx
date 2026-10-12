import React, { useState, useEffect } from 'react';
import { getApiConfig, saveApiConfig, ApiConfig } from '../services/taskService';
import { Settings, Server, Globe, Check, RefreshCw, HardDrive, Shield } from 'lucide-react';

interface SettingsViewProps {
  onResetTasks: () => Promise<void>;
  onRefreshData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetTasks, onRefreshData }) => {
  const [config, setConfig] = useState<ApiConfig>(getApiConfig());
  const [remoteUrlInput, setRemoteUrlInput] = useState(config.remoteUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const current = getApiConfig();
    setConfig(current);
    setRemoteUrlInput(current.remoteUrl);
  }, []);

  const handleSave = () => {
    const updated = saveApiConfig({
      mode: config.mode,
      remoteUrl: remoteUrlInput.trim().replace(/\/$/, ''),
      simulateLatency: config.simulateLatency,
    });
    setConfig(updated);
    setSavedSuccess(true);
    onRefreshData();
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-600" />
          Environment & Backend Connection Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure whether the application connects to the built-in local REST engine or an external deployed Vercel/Node backend
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">API Backend Execution Mode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setConfig({ ...config, mode: 'local' })}
              className={`p-4 rounded-xl border text-left transition-all ${
                config.mode === 'local'
                  ? 'border-sky-500 bg-sky-50/40 ring-1 ring-sky-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-sky-600" />
                  Local In-Browser Engine
                </span>
                {config.mode === 'local' && <Check className="w-4 h-4 text-sky-600" />}
              </div>
              <p className="text-xs text-slate-500">
                Self-contained, ultra-fast persistence in LocalStorage. Ideal for immediate testing, demonstrations, and offline practice.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setConfig({ ...config, mode: 'remote' })}
              className={`p-4 rounded-xl border text-left transition-all ${
                config.mode === 'remote'
                  ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  Remote Vercel Backend
                </span>
                {config.mode === 'remote' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-xs text-slate-500">
                Connect directly to your deployed Vercel backend or the professor's live reference backend on Vercel.
              </p>
            </button>
          </div>
        </div>

        {/* Remote URL input */}
        {config.mode === 'remote' && (
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Remote API Base URL (no trailing slash)
            </label>
            <input
              type="url"
              value={remoteUrlInput}
              onChange={(e) => setRemoteUrlInput(e.target.value)}
              placeholder="https://your-backend.vercel.app/api"
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Live Reference URL:{' '}
              <button
                type="button"
                onClick={() =>
                  setRemoteUrlInput('https://mern-task-manager-3w4u-91wuuw6df-ashishdk.vercel.app/api')
                }
                className="text-emerald-700 font-medium underline"
              >
                Use Prof. Ashish Kulkarni's Live Reference
              </button>
            </p>
          </div>
        )}

        {/* Latency toggle */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-800">Simulate Realistic Network Latency</div>
            <div className="text-[11px] text-slate-500">
              Adds 80–120ms artificial delay to simulate real client-server roundtrips in the API tester.
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.simulateLatency}
            onChange={(e) => setConfig({ ...config, simulateLatency: e.target.checked })}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
          />
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onResetTasks}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium"
          >
            Reset All Stored Tasks to Default
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Configuration Saved</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
