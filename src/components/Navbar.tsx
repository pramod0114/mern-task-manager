import React from 'react';
import { CheckSquare, ExternalLink } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Zone */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              MERN Task Manager
            </span>
          </div>

          {/* Right Action: Clean Reference Link */}
          <div className="flex items-center gap-3">
            <a
              href="https://mern-task-manager-3w4u-91wuuw6df-ashishdk.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <span>Live Reference</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

