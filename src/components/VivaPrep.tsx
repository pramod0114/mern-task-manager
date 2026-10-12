import React, { useState } from 'react';
import { VIVA_QUESTIONS } from '../data/vivaQuestions';
import { VivaQuestion } from '../types';
import {
  GraduationCap,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Search,
  BookOpen,
  Filter,
  RotateCcw,
} from 'lucide-react';

export const VivaPrep: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});
  const [masteredIds, setMasteredIds] = useState<Record<number, boolean>>({});

  const toggleReveal = (id: number) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMastered = (id: number) => {
    setMasteredIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const revealAll = () => {
    const all: Record<number, boolean> = {};
    VIVA_QUESTIONS.forEach((q) => (all[q.id] = true));
    setRevealedIds(all);
  };

  const hideAll = () => {
    setRevealedIds({});
  };

  const filteredQuestions = VIVA_QUESTIONS.filter((q) => {
    if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchQ = q.question.toLowerCase().includes(query);
      const matchA = q.answer.toLowerCase().includes(query);
      if (!matchQ && !matchA) return false;
    }
    return true;
  });

  const masteredCount = Object.values(masteredIds).filter(Boolean).length;
  const masteryPercentage = Math.round((masteredCount / VIVA_QUESTIONS.length) * 100);

  const difficultyColors = {
    Basic: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
    Advanced: 'text-rose-700 bg-rose-50 border-rose-200',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-violet-600" />
              SY MCA Viva Voce & Practical Exam Simulator
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Key theoretical and practical questions asked by examiners during Full Stack Lab evaluations
            </p>
          </div>

          {/* Mastery Counter */}
          <div className="p-3.5 bg-violet-50/60 border border-violet-100 rounded-xl flex items-center gap-4 shrink-0">
            <div>
              <div className="text-xs text-violet-700 font-medium">Exam Readiness</div>
              <div className="text-xl font-bold tabular-nums text-violet-950">
                {masteredCount} / {VIVA_QUESTIONS.length}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 flex items-center justify-center font-bold text-xs text-violet-900 tabular-nums">
              {masteryPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search viva questions (e.g. CORS, PUT, BSON, Vercel)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Selectors */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="Architecture">Architecture</option>
              <option value="MongoDB">MongoDB</option>
              <option value="Express & Node">Express & Node</option>
              <option value="React">React</option>
              <option value="Deployment & Security">Deployment & Security</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-white"
            >
              <option value="all">All Levels</option>
              <option value="Basic">Basic</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Action strip */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Showing {filteredQuestions.length} questions</span>
          <div className="flex items-center gap-2">
            <button
              onClick={revealAll}
              className="text-violet-700 hover:text-violet-900 font-medium"
            >
              Reveal All Answers
            </button>
            <span>·</span>
            <button
              onClick={hideAll}
              className="text-slate-600 hover:text-slate-800 font-medium"
            >
              Hide All Answers
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isRevealed = !!revealedIds[q.id];
          const isMastered = !!masteredIds[q.id];

          return (
            <div
              key={q.id}
              className={`bg-white border rounded-xl p-5 transition-all shadow-xs ${
                isMastered ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-400">Q{q.id}.</span>
                    <span className="font-medium text-slate-500">{q.category}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] border font-medium ${
                        difficultyColors[q.difficulty]
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {q.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleMastered(q.id)}
                    title={isMastered ? 'Mark unmastered' : 'Mark mastered'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isMastered
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                        : 'border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleReveal(q.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-violet-600" />
                        <span>Answer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isRevealed && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-lg">
                  <span className="font-semibold text-slate-900 block mb-1">Model Answer:</span>
                  <p>{q.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
