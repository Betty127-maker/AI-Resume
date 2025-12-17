import React, { useState, useEffect } from 'react';
import { ResumeData, WorkExperience, Education, TemplateType, Skill, Certification, JobMatchAnalysis } from '../types';
import { Plus, Trash2, Wand2, ChevronDown, ChevronRight, Upload, X, Palette, Layout, ArrowUp, ArrowDown, Download, HelpCircle, Info, CheckCircle, AlertCircle, Loader2, Sparkles, User, Briefcase, GraduationCap, GripVertical, Cpu, HeartHandshake, Minus, Award, Target, Edit2, Linkedin } from 'lucide-react';
import { geminiService } from '../services/gemini';

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  activeTemplate: TemplateType;
  onTemplateChange: (t: TemplateType) => void;
  onActiveSectionChange?: (section: string) => void;
}

const COLORS = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Slate', value: '#475569' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Black', value: '#000000' },
  { name: 'Teal', value: '#0d9488' },
];

const FONTS = ['Inter', 'Merriweather', 'Roboto Mono'];

// Dark Theme Input Style - distinct borders and high contrast text
// Increased border lightness (border-slate-600) for better visibility
const INPUT_BASE = "w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-xl text-sm font-bold text-slate-100 placeholder:text-slate-400 focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300 hover:border-indigo-400 shadow-sm";
const LABEL_BASE = "block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1";

// Select input style needs specific tweaking for dark mode options
const SELECT_BASE = "w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded-xl text-sm font-bold text-slate-100 focus:bg-slate-900 focus:border-indigo-500 focus:outline-none cursor-pointer transition-all shadow-sm";

// Row Item Container - makes list items pop out
const ROW_ITEM_BASE = "p-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-center gap-2 mb-3 hover:border-indigo-500/30 hover:bg-slate-800 transition-all";

export const Editor: React.FC<Props> = ({ data, onChange, activeTemplate, onTemplateChange, onActiveSectionChange }) => {
  const [expandedSection, setExpandedSection] = useState<string>('personal');
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Job Match State
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState<JobMatchAnalysis | null>(null);
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);

  useEffect(() => {
    if (onActiveSectionChange) {
      let section = expandedSection;
      if (section.startsWith('exp-')) section = 'experience';
      onActiveSectionChange(section);
    }
  }, [expandedSection, onActiveSectionChange]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updatePersonal = (field: string, value: any) => {
    onChange({ ...data, personalInfo: { ...data.personalInfo, [field]: value } });
  };

  const updateSettings = (field: string, value: string | string[]) => {
    onChange({ ...data, settings: { ...data.settings, [field]: value } });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonal('logoUrl', reader.result as string);
        showToast('Logo updated successfully', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: crypto.randomUUID(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    onChange({ ...data, experience: [newExp, ...data.experience] });
    setExpandedSection(`exp-${newExp.id}`);
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    onChange({
      ...data,
      experience: data.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    });
  };

  const deleteExperience = (id: string) => {
    onChange({ ...data, experience: data.experience.filter(exp => exp.id !== id) });
    showToast('Experience removed', 'info');
  };

  const addEducation = () => {
    onChange({
      ...data,
      education: [...data.education, { id: crypto.randomUUID(), school: '', degree: '', year: '' }]
    });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange({
      ...data,
      education: data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    });
  };

  const deleteEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter(edu => edu.id !== id) });
    showToast('Education removed', 'info');
  };

  const addSkill = (category: 'Technical' | 'Soft' = 'Technical') => {
    onChange({
      ...data,
      skills: [...data.skills, { id: crypto.randomUUID(), name: '', level: 'Intermediate', category }]
    });
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    onChange({
      ...data,
      skills: data.skills.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const deleteSkill = (id: string) => {
    onChange({ ...data, skills: data.skills.filter(s => s.id !== id) });
  };

  const addCertification = () => {
    const currentCerts = data.certifications || [];
    onChange({
      ...data,
      certifications: [...currentCerts, { id: crypto.randomUUID(), name: '', issuer: '', year: '' }]
    });
  };

  const updateCertification = (id: string, field: keyof Certification, value: any) => {
    onChange({
      ...data,
      certifications: (data.certifications || []).map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const deleteCertification = (id: string) => {
    onChange({ ...data, certifications: (data.certifications || []).filter(c => c.id !== id) });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const currentOrder = data.settings.sectionOrder || ['summary', 'experience', 'education', 'skills', 'certifications'];
    const allSections = ['summary', 'experience', 'education', 'skills', 'certifications'];
    const newOrder = [...new Set([...currentOrder, ...allSections])];

    if (direction === 'up' && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }
    updateSettings('sectionOrder', newOrder);
  };

  const handleImportDesign = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string);
          if (imported.settings && imported.template) {
            onChange({ ...data, settings: imported.settings });
            onTemplateChange(imported.template);
            showToast('Design imported successfully!', 'success');
          } else {
            showToast('Invalid design file', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to parse design file', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportDesign = () => {
    const design = {
      template: activeTemplate,
      settings: data.settings
    };
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-design.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Design config downloaded', 'success');
  };

  const handleRunJobMatch = async () => {
    if (!jobDescription.trim()) {
      showToast('Please paste a job description first', 'info');
      return;
    }
    setIsAnalyzingJob(true);
    try {
      const result = await geminiService.analyzeJobMatch(data, jobDescription);
      setMatchResult(result);
      showToast('Analysis complete!', 'success');
    } catch (e) {
      showToast('Analysis failed. Check API key.', 'error');
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  // AI Actions
  const handleGenerateSummary = async () => {
    setLoadingAI('summary');
    try {
      const summary = await geminiService.generateSummary(data);
      updatePersonal('summary', summary);
      showToast('Summary generated!', 'success');
    } catch (e) {
      showToast('Generation failed. Check API Key.', 'error');
    } finally {
      setLoadingAI(null);
    }
  };

  const handleGenerateExperience = async (id: string, role: string, company: string) => {
    if (!role || !company) return showToast("Please fill in Role and Company first.", 'info');
    setLoadingAI(id);
    try {
        const bullets = await geminiService.generateExperienceContent(role, company);
        updateExperience(id, 'description', bullets.join('\n'));
        showToast('Draft content generated!', 'success');
    } catch (e) {
        showToast('Generation failed', 'error');
    } finally {
        setLoadingAI(null);
    }
  };

  const handleOptimizeExperience = async (id: string, role: string, desc: string) => {
    if (!role || !desc) return showToast("Please fill in role and description first.", 'info');
    setLoadingAI(id);

    const otherDescriptions = data.experience
      .filter(e => e.id !== id && e.description.trim().length > 15)
      .map(e => e.description)
      .slice(0, 3);

    try {
      const bullets = await geminiService.optimizeExperience(role, desc, otherDescriptions);
      updateExperience(id, 'description', bullets.join('\n'));
      showToast('Content optimized with keywords!', 'success');
    } catch (e) {
      showToast('Optimization failed', 'error');
    } finally {
      setLoadingAI(null);
    }
  };

  const handleSuggestSkills = async () => {
    // PASS CURRENT ROLE and SUMMARY CONTEXT as requested
    const currentRole = data.experience[0]?.role || data.personalInfo.summary || "Professional";
    
    // Create a summarized resume context string
    const summaryContext = `
      Summary: ${data.personalInfo.summary || ''}
      Experience: ${data.experience.map(e => `${e.role} at ${e.company}: ${e.description}`).join('; ')}
    `.trim();

    setLoadingAI('skills');
    try {
      const suggestedSkills = await geminiService.suggestSkills(currentRole, summaryContext);
      
      const newSkills: Skill[] = suggestedSkills.map(name => ({
        id: crypto.randomUUID(),
        name,
        level: 'Intermediate',
        category: 'Technical' 
      }));
      
      const uniqueNewSkills = newSkills.filter(
        ns => !data.skills.some(es => es.name.toLowerCase() === ns.name.toLowerCase())
      );
      
      if (uniqueNewSkills.length === 0) {
         showToast('No new skills found to add.', 'info');
      } else {
         onChange({ ...data, skills: [...data.skills, ...uniqueNewSkills] });
         showToast(`Added ${uniqueNewSkills.length} relevant skills`, 'success');
      }
    } catch (e) {
      showToast('Failed to suggest skills.', 'error');
    } finally {
      setLoadingAI(null);
    }
  };

  // Card Style Section Header
  const SectionHeader = ({ title, id, isOpen, onClick, icon: Icon }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border-2 mb-3 group ${
        isOpen 
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-900/20 scale-[1.01]' 
          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800/80 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl transition-colors ${isOpen ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-500 group-hover:text-indigo-400'}`}>
           {Icon && <Icon size={18} strokeWidth={2.5} />}
        </div>
        <span className="font-extrabold text-sm tracking-tight">{title}</span>
      </div>
      <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
        <ChevronDown size={18} className={isOpen ? 'text-white/70' : 'text-slate-500 group-hover:text-indigo-400'} />
      </div>
    </button>
  );

  const technicalSkills = data.skills.filter(s => s.category === 'Technical' || !s.category);
  const softSkills = data.skills.filter(s => s.category === 'Soft');

  return (
    <div className="flex flex-col h-full bg-transparent relative custom-scrollbar px-4 pb-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-full shadow-xl shadow-indigo-500/20 text-xs font-bold flex items-center gap-3 animate-fadeIn backdrop-blur-md border border-white/10
          ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 
            toast.type === 'error' ? 'bg-rose-500/90 text-white' : 'bg-slate-800/90 text-white'}`}
        >
          {toast.type === 'success' && <CheckCircle size={14} className="text-white" />}
          {toast.type === 'error' && <AlertCircle size={14} className="text-white" />}
          {toast.type === 'info' && <Info size={14} className="text-white" />}
          {toast.message}
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="absolute inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[32px] shadow-2xl max-w-sm w-full p-8 animate-scaleIn ring-1 ring-white/10 text-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                <Info size={24} className="text-indigo-500" /> Guide
              </h3>
              <button onClick={() => setShowHelp(false)} className="p-2 rounded-full hover:bg-slate-800 transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4 text-sm text-slate-400 leading-relaxed font-medium">
              <p className="bg-slate-800 p-4 rounded-2xl border border-slate-700"><strong>🔒 Privacy First:</strong> Data stored locally on device.</p>
              <p><strong>✨ AI Assistance:</strong> Use "wand" icons to auto-generate content.</p>
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full mt-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">Got it</button>
          </div>
        </div>
      )}

      {/* Header Info Button */}
      <div className="py-4 flex justify-between items-center sticky top-0 z-10 bg-transparent mb-2">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Section Editor</h2>
        <button 
          onClick={() => setShowHelp(true)}
          className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors bg-slate-800/50 px-3 py-1.5 rounded-full hover:bg-slate-800"
        >
          <HelpCircle size={12} /> Tips
        </button>
      </div>

      <div className="space-y-1 pb-10">
        {/* Design Settings */}
        <div>
          <SectionHeader 
            title="Design & Appearance" 
            id="design" 
            icon={Palette}
            isOpen={expandedSection === 'design'} 
            onClick={() => setExpandedSection(expandedSection === 'design' ? '' : 'design')}
          />
          {expandedSection === 'design' && (
            <div className="p-1 mb-6 animate-slideDown">
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-8">
                {/* Template Selection */}
                <div>
                  <label className={LABEL_BASE}>Template Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(TemplateType).map((t) => (
                      <button
                        key={t}
                        onClick={() => onTemplateChange(t)}
                        className={`px-4 py-3 text-xs font-bold rounded-xl capitalize transition-all duration-300 border-2 ${
                          activeTemplate === t 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20 transform scale-[1.02]' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:bg-slate-800 hover:text-indigo-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className={LABEL_BASE}>Accent Color</label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => updateSettings('themeColor', c.value)}
                        className={`w-10 h-10 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center border-2 border-transparent ${data.settings?.themeColor === c.value ? 'scale-110 ring-2 ring-offset-2 ring-offset-slate-900 ring-white' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      >
                         {data.settings?.themeColor === c.value && <CheckCircle size={14} className="text-white mix-blend-plus-lighter" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fonts */}
                <div>
                  <label className={LABEL_BASE}>Typography</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FONTS.map(font => (
                      <button
                        key={font}
                        onClick={() => updateSettings('font', font)}
                        className={`px-3 py-2.5 text-xs font-bold rounded-xl transition-all border-2 ${data.settings?.font === font ? 'bg-slate-100 border-slate-100 text-slate-900 shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                        style={{ fontFamily: font }}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layout Manager */}
        <div>
          <SectionHeader 
            title="Section Layout" 
            id="layout" 
            icon={Layout}
            isOpen={expandedSection === 'layout'} 
            onClick={() => setExpandedSection(expandedSection === 'layout' ? '' : 'layout')}
          />
          {expandedSection === 'layout' && (
            <div className="p-1 mb-6 animate-slideDown">
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-6">
                <div>
                    <label className={LABEL_BASE}>Reorder Sections</label>
                    <div className="space-y-2.5">
                      {[...new Set([...(data.settings.sectionOrder || ['summary', 'experience', 'education', 'skills']), 'certifications'])].map((section, index, arr) => (
                        <div key={section} className="flex items-center justify-between bg-slate-800 px-4 py-3 rounded-2xl border-2 border-slate-700/50 hover:border-indigo-500/50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <GripVertical size={14} className="text-slate-500 group-hover:text-indigo-400" />
                            <span className="text-sm capitalize font-bold text-slate-300 group-hover:text-white">{section}</span>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => moveSection(index, 'up')}
                              disabled={index === 0}
                              className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-200 disabled:opacity-20 transition-colors"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button 
                              onClick={() => moveSection(index, 'down')}
                              disabled={index === arr.length - 1}
                              className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-200 disabled:opacity-20 transition-colors"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                    <label className={LABEL_BASE}>Data Management</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-700 hover:border-indigo-500/50 hover:text-white transition-all shadow-sm">
                        <Upload size={14} />
                        Import
                        <input type="file" className="hidden" accept=".json" onChange={handleImportDesign} />
                      </label>
                      <button 
                        onClick={handleExportDesign}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-700 hover:border-indigo-500/50 hover:text-white transition-all shadow-sm"
                      >
                        <Download size={14} />
                        Export
                      </button>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Job Match Analysis */}
        <div>
          <SectionHeader 
            title="Job Match Analysis" 
            id="jobmatch" 
            icon={Target}
            isOpen={expandedSection === 'jobmatch'} 
            onClick={() => setExpandedSection(expandedSection === 'jobmatch' ? '' : 'jobmatch')}
          />
          {expandedSection === 'jobmatch' && (
            <div className="p-1 mb-6 animate-slideDown">
               <div className="bg-slate-900/50 p-1 rounded-3xl border border-slate-800 overflow-hidden">
                 <div className="relative group">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                   <div className="relative bg-slate-900 rounded-[20px] p-1">
                     <textarea 
                       rows={6}
                       className="w-full px-5 py-4 bg-slate-800 rounded-2xl text-sm font-medium text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed selection:bg-indigo-500/30 selection:text-indigo-200" 
                       value={jobDescription}
                       onChange={(e) => setJobDescription(e.target.value)}
                       placeholder="Paste the target job description here..."
                     />
                   </div>
                 </div>
                 
                 <div className="p-5">
                   <div className="flex justify-end">
                      <button 
                        onClick={handleRunJobMatch}
                        disabled={isAnalyzingJob || !jobDescription.trim()}
                        className="group relative inline-flex items-center justify-center px-6 py-2.5 font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40"
                      >
                        {isAnalyzingJob ? <Loader2 size={16} className="animate-spin mr-2" /> : <Sparkles size={16} className="mr-2 text-indigo-200" />}
                        {isAnalyzingJob ? 'Scanning...' : 'Analyze Match'}
                      </button>
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Personal Info */}
        <div>
          <SectionHeader 
            title="Personal Info" 
            id="personal" 
            icon={User}
            isOpen={expandedSection === 'personal'} 
            onClick={() => setExpandedSection(expandedSection === 'personal' ? '' : 'personal')}
          />
          {expandedSection === 'personal' && (
            <div className="p-1 mb-6 animate-slideDown">
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-8">
                <div className="flex items-start gap-6">
                    {data.personalInfo.logoUrl ? (
                      <div className="relative group shrink-0">
                        <img src={data.personalInfo.logoUrl} alt="Logo" className="w-24 h-24 rounded-2xl object-cover shadow-md ring-4 ring-slate-700" />
                        <button 
                          onClick={() => updatePersonal('logoUrl', '')}
                          className="absolute -top-2 -right-2 bg-slate-800 text-rose-500 border border-slate-700 rounded-full p-1.5 shadow-sm hover:bg-rose-950 transition-colors transform hover:scale-110"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 shrink-0 rounded-2xl bg-slate-800 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 text-slate-500 gap-1 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors group">
                        <Upload size={24} className="group-hover:scale-110 transition-transform"/>
                        <span className="text-[10px] font-bold uppercase">Photo</span>
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-3 pt-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 transform active:scale-95">
                        <Upload size={14} />
                        Upload Profile Photo
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                      </label>
                      <p className="text-[11px] font-medium text-slate-500 leading-snug">
                        Professional headshots recommended. <br/>Supported: JPG, PNG.
                      </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className={LABEL_BASE}>Full Name</label>
                    <input type="text" className={INPUT_BASE} placeholder="e.g. John Doe" value={data.personalInfo.fullName} onChange={e => updatePersonal('fullName', e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL_BASE}>Email</label>
                    <input type="email" className={INPUT_BASE} placeholder="john@example.com" value={data.personalInfo.email} onChange={e => updatePersonal('email', e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL_BASE}>Phone</label>
                    <input type="text" className={INPUT_BASE} placeholder="+1 234 567 890" value={data.personalInfo.phone} onChange={e => updatePersonal('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL_BASE}>Years of Exp.</label>
                    <div className="flex items-center h-[46px] bg-slate-800 border-2 border-slate-700 rounded-xl overflow-hidden group focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm focus-within:bg-slate-900 hover:border-indigo-500/50">
                        <button 
                            onClick={() => {
                                const val = (data.personalInfo.yearsOfExperience || 0) - 1;
                                updatePersonal('yearsOfExperience', val < 0 ? 0 : val);
                            }}
                            className="px-3 h-full text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            <Minus size={14} />
                        </button>
                        <input 
                            type="number" 
                            min="0" 
                            className="flex-1 w-full bg-transparent text-center text-sm text-slate-200 focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none font-bold"
                            placeholder="0" 
                            value={data.personalInfo.yearsOfExperience || ''} 
                            onChange={e => updatePersonal('yearsOfExperience', e.target.value ? parseInt(e.target.value) : 0)} 
                        />
                        <button 
                            onClick={() => {
                                const val = (data.personalInfo.yearsOfExperience || 0) + 1;
                                updatePersonal('yearsOfExperience', val);
                            }}
                            className="px-3 h-full text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_BASE}>Location</label>
                    <input type="text" className={INPUT_BASE} placeholder="New York, NY" value={data.personalInfo.location} onChange={e => updatePersonal('location', e.target.value)} />
                  </div>
                  <div>
                     <label className={LABEL_BASE}>LinkedIn</label>
                     <div className="relative">
                       <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                       <input type="text" className={`${INPUT_BASE} pl-10`} placeholder="linkedin.com/in/..." value={data.personalInfo.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} />
                     </div>
                  </div>
                  <div>
                     <label className={LABEL_BASE}>Portfolio / Site</label>
                     <input type="text" className={INPUT_BASE} placeholder="mysite.com" value={data.personalInfo.website} onChange={e => updatePersonal('website', e.target.value)} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className={LABEL_BASE} style={{marginBottom:0}}>Professional Summary</label>
                    <button 
                      onClick={handleGenerateSummary}
                      disabled={loadingAI === 'summary'}
                      className="text-[10px] flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all font-bold disabled:opacity-50 shadow-md"
                    >
                       {loadingAI === 'summary' ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                       {loadingAI === 'summary' ? 'Writing...' : 'Auto-Write'}
                    </button>
                  </div>
                  <textarea 
                    rows={4} 
                    className={`${INPUT_BASE} resize-none leading-relaxed`} 
                    value={data.personalInfo.summary} 
                    onChange={e => updatePersonal('summary', e.target.value)} 
                    placeholder="Summarize your professional background..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Experience */}
        <div>
          <SectionHeader 
            title="Experience" 
            id="experience" 
            icon={Briefcase}
            isOpen={expandedSection === 'experience'} 
            onClick={() => setExpandedSection(expandedSection === 'experience' ? '' : 'experience')}
          />
          {expandedSection === 'experience' && (
            <div className="p-1 mb-6 space-y-4 animate-slideDown">
              {data.experience.map((exp, index) => (
                <div key={exp.id} className="group relative bg-slate-900/50 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300">
                  <button 
                    onClick={() => deleteExperience(exp.id)} 
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-950/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16}/>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className={LABEL_BASE}>Role & Company</label>
                      <div className="flex gap-2">
                         <input placeholder="Job Title" className={`${INPUT_BASE} font-bold`} value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} />
                         <input placeholder="Company Name" className={INPUT_BASE} value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} />
                      </div>
                    </div>
                    <div>
                       <label className={LABEL_BASE}>Start Date</label>
                       <input type="text" placeholder="MM/YYYY" className={INPUT_BASE} value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} />
                    </div>
                    <div>
                       <label className={LABEL_BASE}>End Date</label>
                       <div className="flex gap-2">
                        <input type="text" placeholder="MM/YYYY" disabled={exp.current} className={`${INPUT_BASE} disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800`} value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} />
                        <label className="flex items-center justify-center px-4 bg-slate-800 border-2 border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700 hover:border-indigo-500/50 transition-colors group/check" title="Currently working here">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500" checked={exp.current} onChange={e => updateExperience(exp.id, 'current', e.target.checked)} />
                        </label>
                       </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={LABEL_BASE} style={{marginBottom:0}}>Achievements</label>
                      {exp.description ? (
                        <button 
                          onClick={() => handleOptimizeExperience(exp.id, exp.role, exp.description)}
                          disabled={loadingAI === exp.id}
                          className="text-[10px] flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all font-bold disabled:opacity-50 shadow-md"
                        >
                          {loadingAI === exp.id ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                          {loadingAI === exp.id ? 'Optimizing...' : 'Optimize'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleGenerateExperience(exp.id, exp.role, exp.company)}
                          disabled={loadingAI === exp.id}
                          className="text-[10px] flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105 transition-all font-bold disabled:opacity-50 shadow-md"
                        >
                          {loadingAI === exp.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          {loadingAI === exp.id ? 'Drafting...' : 'Generate Draft'}
                        </button>
                      )}
                    </div>
                    <textarea 
                      rows={5} 
                      className={`${INPUT_BASE} font-mono text-xs leading-relaxed`} 
                      value={exp.description} 
                      onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                      placeholder={exp.description ? "" : "• Achieved X by doing Y..."}
                    />
                  </div>
                </div>
              ))}
              <button onClick={addExperience} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-800 flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 group relative overflow-hidden">
                <div className="p-1 bg-slate-800 rounded-full group-hover:bg-indigo-900 text-slate-400 group-hover:text-indigo-400 transition-colors">
                   <Plus size={16} />
                </div>
                Add Experience
              </button>
            </div>
          )}
        </div>

        {/* Education */}
        <div>
          <SectionHeader 
            title="Education" 
            id="education" 
            icon={GraduationCap}
            isOpen={expandedSection === 'education'} 
            onClick={() => setExpandedSection(expandedSection === 'education' ? '' : 'education')}
          />
          {expandedSection === 'education' && (
            <div className="p-1 mb-6 space-y-4 animate-slideDown">
              {data.education.map((edu) => (
                <div key={edu.id} className="relative bg-slate-900/50 p-6 rounded-3xl border border-slate-800 group hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300">
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-6 sm:col-span-4">
                       <label className={LABEL_BASE}>School</label>
                       <input className={`${INPUT_BASE} font-bold`} value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} placeholder="University Name" />
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                       <label className={LABEL_BASE}>Year</label>
                       <input className={INPUT_BASE} value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} placeholder="2024" />
                    </div>
                    <div className="col-span-6">
                       <label className={LABEL_BASE}>Degree</label>
                       <input className={INPUT_BASE} value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Science" />
                    </div>
                  </div>
                   <button onClick={() => deleteEducation(edu.id)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-950/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))}
              <button onClick={addEducation} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-800 flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 group relative overflow-hidden">
                <div className="p-1 bg-slate-800 rounded-full group-hover:bg-indigo-900 text-slate-400 group-hover:text-indigo-400 transition-colors">
                   <Plus size={16} />
                </div>
                Add Education
              </button>
            </div>
          )}
        </div>

         {/* Skills */}
         <div>
          <SectionHeader 
            title="Skills" 
            id="skills" 
            icon={Sparkles}
            isOpen={expandedSection === 'skills'} 
            onClick={() => setExpandedSection(expandedSection === 'skills' ? '' : 'skills')}
          />
          {expandedSection === 'skills' && (
            <div className="p-1 mb-6 animate-slideDown">
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <label className={LABEL_BASE} style={{marginBottom:0}}>Skills List</label>
                    <button 
                       onClick={handleSuggestSkills}
                       disabled={loadingAI === 'skills'}
                       className="text-[10px] flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all font-bold disabled:opacity-50 shadow-md"
                    >
                      {loadingAI === 'skills' ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                      {loadingAI === 'skills' ? 'Analyzing...' : 'AI Suggestions'}
                    </button>
                  </div>
                  
                  {/* Technical Skills Section */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu size={14} className="text-slate-500"/>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Technical Skills</span>
                    </div>
                    <div className="flex flex-col gap-2 mb-3">
                      {technicalSkills.map((skill) => (
                        <div key={skill.id} className={ROW_ITEM_BASE}>
                           <input 
                             className="bg-transparent border-none text-slate-200 text-sm font-bold placeholder:text-slate-500 focus:ring-0 w-full"
                             value={skill.name}
                             onChange={e => updateSkill(skill.id, 'name', e.target.value)}
                             placeholder="e.g. React.js"
                           />
                           <div className="h-6 w-px bg-slate-700 mx-2"></div>
                           <select 
                             value={skill.level}
                             onChange={e => updateSkill(skill.id, 'level', e.target.value)}
                             className="bg-transparent text-xs font-bold text-slate-400 focus:text-indigo-400 outline-none cursor-pointer hover:text-indigo-300 uppercase tracking-wide py-1"
                           >
                             <option value="Beginner">Beginner</option>
                             <option value="Intermediate">Intermediate</option>
                             <option value="Expert">Expert</option>
                           </select>
                           <button onClick={() => deleteSkill(skill.id)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-800/50 rounded-lg transition-colors shrink-0">
                             <Trash2 size={16}/>
                           </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addSkill('Technical')} className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                       <Plus size={14} /> Add Technical Skill
                    </button>
                  </div>

                  {/* Soft Skills Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <HeartHandshake size={14} className="text-slate-500"/>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Soft Skills</span>
                    </div>
                    <div className="flex flex-col gap-2 mb-3">
                      {softSkills.map((skill) => (
                        <div key={skill.id} className={ROW_ITEM_BASE}>
                           <input 
                             className="bg-transparent border-none text-slate-200 text-sm font-bold placeholder:text-slate-500 focus:ring-0 w-full"
                             value={skill.name}
                             onChange={e => updateSkill(skill.id, 'name', e.target.value)}
                             placeholder="e.g. Leadership"
                           />
                           <div className="h-6 w-px bg-slate-700 mx-2"></div>
                           <select 
                             value={skill.level}
                             onChange={e => updateSkill(skill.id, 'level', e.target.value)}
                             className="bg-transparent text-xs font-bold text-slate-400 focus:text-indigo-400 outline-none cursor-pointer hover:text-indigo-300 uppercase tracking-wide py-1"
                           >
                             <option value="Beginner">Beginner</option>
                             <option value="Intermediate">Intermediate</option>
                             <option value="Expert">Expert</option>
                           </select>
                           <button onClick={() => deleteSkill(skill.id)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-800/50 rounded-lg transition-colors shrink-0">
                             <Trash2 size={16}/>
                           </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addSkill('Soft')} className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                       <Plus size={14} /> Add Soft Skill
                    </button>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* Certifications */}
        <div>
          <SectionHeader 
            title="Certifications" 
            id="certifications" 
            icon={Award}
            isOpen={expandedSection === 'certifications'} 
            onClick={() => setExpandedSection(expandedSection === 'certifications' ? '' : 'certifications')}
          />
          {expandedSection === 'certifications' && (
             <div className="p-1 mb-6 space-y-4 animate-slideDown">
              {(data.certifications || []).map((cert) => (
                <div key={cert.id} className="relative bg-slate-900/50 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-300">
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-6">
                       <label className={LABEL_BASE}>Certificate Name</label>
                       <input className={`${INPUT_BASE} font-bold text-lg`} value={cert.name} onChange={e => updateCertification(cert.id, 'name', e.target.value)} placeholder="e.g. AWS Solutions Architect" />
                    </div>
                    <div className="col-span-4">
                       <label className={LABEL_BASE}>Issuer</label>
                       <input className={INPUT_BASE} value={cert.issuer} onChange={e => updateCertification(cert.id, 'issuer', e.target.value)} placeholder="Amazon Web Services" />
                    </div>
                    <div className="col-span-2">
                       <label className={LABEL_BASE}>Year</label>
                       <input className={INPUT_BASE} value={cert.year} onChange={e => updateCertification(cert.id, 'year', e.target.value)} placeholder="2023" />
                    </div>
                  </div>
                   <button onClick={() => deleteCertification(cert.id)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-800 rounded-lg transition-colors">
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))}
              <button onClick={addCertification} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-800 flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 group relative overflow-hidden">
                <div className="p-1 bg-slate-800 rounded-full group-hover:bg-indigo-900 text-slate-400 group-hover:text-indigo-400 transition-colors">
                   <Plus size={16} />
                </div>
                Add Certification
              </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};