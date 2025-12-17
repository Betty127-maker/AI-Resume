import React, { useState } from 'react';
import { AtsAnalysis, JobMatchAnalysis, ResumeData } from '../types';
import { geminiService } from '../services/gemini';
import { AlertCircle, CheckCircle, Loader2, Target, FileSearch, Wand2, ArrowLeft, XCircle, FileWarning, X } from 'lucide-react';

interface Props {
  data: ResumeData;
  onUpdate: (data: ResumeData) => void;
  onClose: () => void;
}

export const AnalysisPanel: React.FC<Props> = ({ data, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ats' | 'match'>('ats');
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState<AtsAnalysis | null>(null);
  const [matchResult, setMatchResult] = useState<JobMatchAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [tailorSuccess, setTailorSuccess] = useState(false);

  const runAtsCheck = async () => {
    setLoading(true);
    try {
      const result = await geminiService.analyzeATS(data);
      setAtsResult(result);
    } finally {
      setLoading(false);
    }
  };

  const runJobMatch = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setTailorSuccess(false);
    try {
      const result = await geminiService.analyzeJobMatch(data, jobDescription);
      setMatchResult(result);
    } finally {
      setLoading(false);
    }
  };

  const handleTailorSummary = async () => {
    if (!jobDescription) return;
    setTailoring(true);
    try {
      const newSummary = await geminiService.generateSummary(data, jobDescription);
      onUpdate({
        ...data,
        personalInfo: {
          ...data.personalInfo,
          summary: newSummary
        }
      });
      setTailorSuccess(true);
    } catch (e) {
      console.error(e);
      alert("Failed to tailor summary");
    } finally {
      setTailoring(false);
    }
  };

  const ScoreRing = ({ score }: { score: number }) => (
    <div className="relative w-32 h-32 mx-auto mb-8">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={score > 80 ? "#10b981" : score > 50 ? "#f59e0b" : "#ef4444"} strokeWidth="3" strokeDasharray={`${score}, 100`} className="animate-[spin_1.5s_ease-out_reverse]" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-slate-800">{score}</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );

  return (
    <div className="bg-transparent h-full flex flex-col">
      <div className="p-6 pb-0">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">AI Assistant</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Exit Assistant"
            >
              <X size={20} />
            </button>
         </div>
         
         {/* Segmented Control */}
         <div className="flex p-1.5 bg-slate-100/50 border border-slate-100 rounded-2xl mb-8">
            <button 
              onClick={() => setActiveTab('ats')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl transition-all duration-200 ${
                activeTab === 'ats' 
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              ATS Checker
            </button>
            <button 
              onClick={() => setActiveTab('match')}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl transition-all duration-200 ${
                activeTab === 'match' 
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Job Match
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-thumb-slate-200">
        {activeTab === 'ats' && (
          <div className="space-y-6 animate-fadeIn">
            {!atsResult ? (
              <div className="text-center py-12 px-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-indigo-500">
                  <FileSearch size={32} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Scan for ATS Issues</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">Ensure your resume is readable by bots. We'll check keywords, formatting, and density.</p>
                <button 
                  onClick={runAtsCheck} 
                  disabled={loading} 
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold hover:shadow-xl hover:shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Run Scan'}
                </button>
              </div>
            ) : (
              <div>
                <ScoreRing score={atsResult.score} />
                
                <div className="space-y-6">
                  {atsResult.formattingIssues && atsResult.formattingIssues.length > 0 && (
                    <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-4 flex items-center gap-2 text-sm">
                        <FileWarning size={18} /> Formatting Alerts
                      </h4>
                      <div className="space-y-3">
                        {atsResult.formattingIssues.map((item, i) => (
                          <div key={i} className="bg-white/60 p-3 rounded-xl border border-orange-100">
                             <div className="flex gap-2 items-start mb-1">
                                <span className="block w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                                <span className="font-bold text-slate-800 text-sm">{item.issue}</span>
                             </div>
                             <p className="text-xs text-slate-600 pl-3.5 leading-relaxed">
                               <span className="font-bold text-orange-700/80">Fix:</span> {item.solution}
                             </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-4 flex items-center gap-2 text-sm">
                      <AlertCircle size={18} /> Improvements
                    </h4>
                    <ul className="text-sm space-y-3 text-amber-900/80 font-medium">
                      {atsResult.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-3 items-start">
                           <span className="block w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                           {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-emerald-500" /> Detected Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {atsResult.keywordsPresent.map((k, i) => (
                        <span key={i} className="text-xs font-bold bg-white text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                      <XCircle size={16} className="text-rose-500" /> Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {atsResult.keywordsMissing.map((k, i) => (
                        <span key={i} className="text-xs font-bold bg-white text-rose-700 px-3 py-1.5 rounded-lg border border-rose-100 shadow-sm">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={runAtsCheck} disabled={loading} className="mt-10 py-3 w-full text-sm font-bold text-slate-500 hover:text-slate-800 border-2 border-slate-100 rounded-xl hover:bg-white transition-all">Re-scan Resume</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'match' && (
          <div className="space-y-6 animate-fadeIn">
             {!matchResult ? (
               <div className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Job Description</label>
                   <textarea 
                     value={jobDescription}
                     onChange={(e) => setJobDescription(e.target.value)}
                     className="w-full h-56 p-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-500/50 focus:outline-none transition-all resize-none placeholder:text-slate-400"
                     placeholder="Paste the full JD text here..."
                   />
                 </div>
                 <button 
                  onClick={runJobMatch} 
                  disabled={loading || !jobDescription} 
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold hover:shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <> <Target size={18} /> Compare Match </>}
                </button>
               </div>
             ) : (
               <div>
                  <button onClick={() => setMatchResult(null)} className="mb-6 text-xs font-bold flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-wider">
                    <ArrowLeft size={14} /> Back
                  </button>

                  <ScoreRing score={matchResult.matchScore} />
                  
                  {/* Tailor Resume Action */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 mb-8">
                    <h4 className="font-bold text-indigo-900 mb-2 text-sm flex items-center gap-2">
                       <Wand2 size={16} className="text-indigo-600"/> Smart Tailoring
                    </h4>
                    <p className="text-xs text-indigo-800/70 mb-5 leading-relaxed font-medium">
                      Rewrite summary to highlight skills mentioned in this job description.
                    </p>
                    {tailorSuccess ? (
                       <div className="bg-white p-3 rounded-xl border border-emerald-100 text-emerald-700 text-sm font-bold flex items-center gap-2 justify-center shadow-sm">
                         <CheckCircle size={18} /> Summary Updated
                       </div>
                    ) : (
                      <button 
                        onClick={handleTailorSummary}
                        disabled={tailoring}
                        className="w-full py-3 bg-white text-indigo-600 border-2 border-indigo-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-bold transition-all"
                      >
                        {tailoring ? <Loader2 className="animate-spin" size={16} /> : "Auto-Tailor Summary"}
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-4 text-sm">Advice</h4>
                      <ul className="text-sm space-y-3 text-slate-600 font-medium">
                        {matchResult.recommendations.map((r, i) => (
                          <li key={i} className="flex gap-3 items-start">
                             <span className="block w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                             {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                         <XCircle size={16} className="text-rose-500" /> Critical Gaps
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.missingKeywords.map((k, i) => (
                           <span key={i} className="text-xs font-bold bg-white text-rose-700 px-3 py-1.5 rounded-lg border border-rose-100 shadow-sm">
                             {k}
                           </span>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};