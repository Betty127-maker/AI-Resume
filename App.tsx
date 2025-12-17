import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ResumeData, TemplateType, INITIAL_RESUME_DATA } from './types';
import { Editor } from './components/Editor';
import { ResumePreview } from './components/ResumePreview';
import { AnalysisPanel } from './components/AnalysisPanel';
import { FileCode, PanelRightOpen, PanelRightClose, FileText, ChevronRight, Download, Wand2, Undo, Redo, Sparkles, Loader2 } from 'lucide-react';
import { exportService } from './services/export';

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('resumeData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_RESUME_DATA,
          ...parsed,
          skills: parsed.skills || [],
          certifications: parsed.certifications || [],
          settings: {
            ...INITIAL_RESUME_DATA.settings,
            ...parsed.settings,
            sectionOrder: [
              ...new Set([
                ...(parsed.settings?.sectionOrder || INITIAL_RESUME_DATA.settings.sectionOrder),
                'certifications'
              ])
            ]
          }
        };
      } catch (e) {
        console.error("Failed to migrate resume data:", e);
        return INITIAL_RESUME_DATA;
      }
    }
    return INITIAL_RESUME_DATA;
  });

  const [activeTemplate, setActiveTemplate] = useState<TemplateType>(TemplateType.CREATIVE);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('personal');
  const previewRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<ResumeData[]>([resumeData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedo = useRef(false);

  useEffect(() => {
    if (history.length === 0) setHistory([resumeData]);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
    }, 1000);
    return () => clearTimeout(handler);
  }, [resumeData]);

  useEffect(() => {
    if (isUndoRedo.current) {
        isUndoRedo.current = false;
        return;
    }

    const timer = setTimeout(() => {
        setHistory(prev => {
            const current = prev[historyIndex];
            if (JSON.stringify(current) === JSON.stringify(resumeData)) return prev;

            const newHistory = prev.slice(0, historyIndex + 1);
            const updatedHistory = [...newHistory, resumeData];
            if (updatedHistory.length > 50) updatedHistory.shift();
            return updatedHistory;
        });
        
        setHistoryIndex(prev => {
           return prev + 1;
        });
    }, 800);

    return () => clearTimeout(timer);
  }, [resumeData]); 

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setResumeData(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setResumeData(history[newIndex]);
    }
  }, [historyIndex, history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToDocx(resumeData);
    } catch (error) {
      console.error("Failed to export DOCX", error);
      alert("Failed to export DOCX");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHtml = () => {
    exportService.exportToHtml(resumeData, 'resume-preview-container');
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToPdf(resumeData);
    } catch (error) {
       console.error("PDF export error:", error);
       alert("Failed to generate PDF. Trying standard print...");
       window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans print:h-auto print:overflow-visible text-slate-200">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none no-print">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px] animate-blob"></div>
         <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar / Editor */}
      <div className="w-full md:w-[500px] flex-shrink-0 flex flex-col bg-slate-900/80 backdrop-blur-2xl border-r border-slate-800 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.5)] z-30 relative no-print">
        <header className="px-6 py-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={20} fill="currentColor" className="text-white" />
            </div>
            <div className="flex flex-col">
               <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 text-xl leading-none tracking-tight">Resume<span className="text-indigo-400">AI</span></h1>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Creative Suite</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center bg-slate-800/50 p-1 rounded-xl border border-slate-700 shadow-sm backdrop-blur-sm">
                <button 
                  onClick={handleUndo} 
                  disabled={historyIndex === 0}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all relative"
                  title="Undo"
                >
                  <Undo size={16} />
                </button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button 
                  onClick={handleRedo} 
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all"
                  title="Redo"
                >
                  <Redo size={16} />
                </button>
             </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden bg-transparent">
          <Editor 
            data={resumeData} 
            onChange={setResumeData} 
            activeTemplate={activeTemplate}
            onTemplateChange={setActiveTemplate}
            onActiveSectionChange={setActiveSection}
          />
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col relative min-w-0 print:bg-white print:h-auto print:overflow-visible">
        {/* Modern Floating Toolbar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 no-print w-full max-w-2xl px-4 pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] rounded-2xl p-2 pl-6 flex items-center justify-between gap-4 transition-all hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
             <div className="flex items-center gap-4">
                 <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Template</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="capitalize">{activeTemplate}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
                <div className="flex items-center text-xs font-bold text-slate-500">
                  <span className="bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700">A4 Format</span>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-bold text-xs shadow-lg hover:scale-105 active:scale-95 border border-transparent ${
                    showAnalysis 
                      ? 'bg-slate-800 text-white ring-2 ring-slate-600' 
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25'
                  }`}
                >
                  {showAnalysis ? <PanelRightClose size={16} /> : <Wand2 size={16} className="text-white" />}
                  <span>AI Assistant</span>
                </button>

                <div className="flex gap-1 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                  <button 
                    onClick={handleExportDocx}
                    disabled={isExporting}
                    className="p-2.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
                    title="Download DOCX"
                  >
                    <FileText size={18} />
                  </button>
                  <button 
                    onClick={handleExportHtml}
                    className="p-2.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                    title="Download HTML"
                  >
                    <FileCode size={18} />
                  </button>
                  <button 
                    onClick={handleDownloadPdf}
                    disabled={isExporting}
                    className="px-5 py-2.5 rounded-lg bg-slate-200 text-slate-900 hover:bg-white shadow-lg shadow-black/20 hover:shadow-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-70"
                  >
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    <span>PDF</span>
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Preview & Analysis Split */}
        <div className="flex-1 overflow-hidden relative flex print:overflow-visible print:block print:h-auto">
          <div className="flex-1 overflow-y-auto pt-32 pb-20 px-8 flex justify-center print:p-0 print:bg-white print:overflow-visible print:block print:h-auto scroll-smooth custom-scrollbar">
            <div className="origin-top scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.85] xl:scale-100 transition-transform duration-500 print:transform-none print:scale-100 print:w-full">
               <div className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/10 print:shadow-none print:ring-0 bg-white rounded-sm">
                 <ResumePreview 
                   data={resumeData} 
                   template={activeTemplate} 
                   previewRef={previewRef} 
                   activeSection={activeSection}
                 />
               </div>
            </div>
          </div>

          {/* Analysis Panel Slide-over */}
          <div 
            className={`absolute top-0 right-0 h-full w-[420px] bg-slate-900/95 backdrop-blur-2xl shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.5)] transform transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) border-l border-slate-800 no-print z-30 ${showAnalysis ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <AnalysisPanel data={resumeData} onUpdate={setResumeData} onClose={() => setShowAnalysis(false)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;