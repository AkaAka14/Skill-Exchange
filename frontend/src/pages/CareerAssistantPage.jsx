import React, { useState, useRef } from 'react';
import apiServerClient from '@/lib/apiServerClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload, FileText, Loader2, Sparkles, Target, TrendingUp,
  CheckCircle2, AlertCircle, ChevronRight, Briefcase, Clock,
  Star, Zap, BookOpen, ArrowRight, RotateCcw, User
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LEVEL_COLORS = {
  beginner:     'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  advanced:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const IMPORTANCE_COLORS = {
  high:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const PHASE_GRADIENTS = [
  'from-pink-500/20 to-purple-500/10 border-pink-500/20',
  'from-purple-500/20 to-blue-500/10 border-purple-500/20',
  'from-blue-500/20 to-teal-500/10 border-blue-500/20',
];

function StatCard({ icon: Icon, label, value, color = 'text-pink-400' }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-white leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFile, loading }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') onFile(file);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Hero */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-900/30">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">AI Career Assistant</h1>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Upload your resume and get an instant skill gap analysis,
          personalized roadmap, and role recommendations — powered by Gemini AI.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !loading && inputRef.current?.click()}
          className={`
            relative rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all duration-200
            ${dragging
              ? 'border-pink-500 bg-pink-500/10'
              : 'border-white/10 hover:border-pink-500/40 hover:bg-white/[0.02] bg-white/[0.01]'}
            ${loading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 text-pink-400 animate-spin" />
              <p className="text-white font-medium">Analyzing your resume…</p>
              <p className="text-xs text-muted-foreground">Gemini is reading your experience, skills, and trajectory</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-white font-medium">Drop your resume here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse · PDF only · max 10MB</p>
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={e => { const f = e.target.files[0]; if (f) onFile(f); }}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Your resume is sent directly to Gemini for analysis and is not stored on our servers.
        </p>
      </div>
    </div>
  );
}

// ─── Results view ─────────────────────────────────────────────────────────────
function Results({ analysis, onReset }) {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Cover */}
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-600/30 via-purple-900/60 to-background" />
        <div className="absolute -top-10 left-1/3 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-14 relative z-10 pb-16 space-y-5">

        {/* Header card */}
        <div className="rounded-2xl bg-card/90 backdrop-blur-md border border-white/8 p-6 shadow-xl shadow-black/20">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">{analysis.name || 'Your Profile'}</h1>
              <p className="text-sm text-pink-400 font-medium">{analysis.currentRole || 'Professional'}</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{analysis.summary}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={onReset} className="flex-shrink-0 text-muted-foreground hover:text-white">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> New
            </Button>
          </div>

          <div className="h-px bg-white/5 my-5" />

          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Briefcase} label="Experience" value={`${analysis.experienceYears ?? '?'} years`} color="text-pink-400" />
            <StatCard icon={Target}    label="Skill gaps" value={`${analysis.skillGaps?.length ?? 0} identified`} color="text-amber-400" />
            <StatCard icon={TrendingUp} label="Goal" value={analysis.careerGoal || 'Growth'} color="text-purple-400" />
          </div>
        </div>

        {/* Strengths */}
        {analysis.strengths?.length > 0 && (
          <div className="rounded-2xl bg-card border border-white/8 p-5">
            <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" /> Strengths
            </h2>
            <div className="flex flex-wrap gap-2">
              {analysis.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/8 border border-green-500/15">
                  <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-green-300">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted skills */}
        {analysis.extractedSkills?.length > 0 && (
          <div className="rounded-2xl bg-card border border-white/8 p-5">
            <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Skills Found in Resume
            </h2>
            <div className="flex flex-wrap gap-2">
              {analysis.extractedSkills.map((s, i) => (
                <Badge
                  key={i}
                  className={`text-xs border ${LEVEL_COLORS[s.level] || LEVEL_COLORS.intermediate}`}
                  title={s.source}
                >
                  {s.name}
                  {s.level && <span className="ml-1 opacity-60 text-[10px]">· {s.level}</span>}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skill gaps */}
        {analysis.skillGaps?.length > 0 && (
          <div className="rounded-2xl bg-card border border-white/8 p-5">
            <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> Skill Gaps to Address
            </h2>
            <div className="space-y-3">
              {analysis.skillGaps.map((gap, i) => (
                <div key={i} className="rounded-xl bg-white/[0.02] border border-white/6 p-4">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <span className="font-medium text-white text-sm">{gap.skill}</span>
                      {gap.category && <span className="text-xs text-muted-foreground ml-2">· {gap.category}</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {gap.importance && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${IMPORTANCE_COLORS[gap.importance] || IMPORTANCE_COLORS.medium}`}>
                          {gap.importance}
                        </span>
                      )}
                      {gap.timeToLearn && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />{gap.timeToLearn}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{gap.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap */}
        {analysis.roadmap?.length > 0 && (
          <div className="rounded-2xl bg-card border border-white/8 p-5">
            <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Your Learning Roadmap
            </h2>

            {/* Phase tabs */}
            <div className="flex gap-2 mb-4">
              {analysis.roadmap.map((phase, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhase(i)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 ${
                    activePhase === i
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-white/[0.03] border border-white/8 text-muted-foreground hover:text-white'
                  }`}
                >
                  Phase {phase.phase}
                </button>
              ))}
            </div>

            {/* Active phase detail */}
            {(() => {
              const phase = analysis.roadmap[activePhase];
              if (!phase) return null;
              return (
                <div className={`rounded-xl border bg-gradient-to-br p-5 ${PHASE_GRADIENTS[activePhase] || PHASE_GRADIENTS[0]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{phase.title}</h3>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{phase.duration}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{phase.description}</p>

                  {phase.skills?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills to build</p>
                      <div className="flex flex-wrap gap-1.5">
                        {phase.skills.map((s, j) => (
                          <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/10">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {phase.milestones?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Milestones</p>
                      <div className="space-y-1.5">
                        {phase.milestones.map((m, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-pink-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground">{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Phase flow */}
            <div className="flex items-center gap-2 mt-4">
              {analysis.roadmap.map((phase, i) => (
                <React.Fragment key={i}>
                  <button
                    onClick={() => setActivePhase(i)}
                    className={`flex-1 text-center py-2 rounded-lg text-[11px] font-medium transition-all ${
                      activePhase === i ? 'text-pink-400' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    {phase.title}
                  </button>
                  {i < analysis.roadmap.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Suggested roles */}
        {analysis.suggestedRoles?.length > 0 && (
          <div className="rounded-2xl bg-card border border-white/8 p-5">
            <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Roles You're Suited For
            </h2>
            <div className="space-y-3">
              {analysis.suggestedRoles.map((role, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/6">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{role.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{role.reason}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-lg font-bold ${role.matchScore >= 80 ? 'text-green-400' : role.matchScore >= 60 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                      {role.matchScore}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CareerAssistantPage() {
  const [loading, setLoading]     = useState(false);
  const [analysis, setAnalysis]   = useState(null);
  const [error, setError]         = useState('');

  const handleFile = async (file) => {
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const data = await apiServerClient.post('/career/analyze', fd);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (analysis) {
    return <Results analysis={analysis} onReset={() => setAnalysis(null)} />;
  }

  return (
    <>
      <UploadZone onFile={handleFile} loading={loading} />
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-destructive/90 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
          {error}
        </div>
      )}
    </>
  );
}