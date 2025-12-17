import React from 'react';
import { ResumeData, TemplateType, Skill } from '../types';
import { MapPin, Mail, Phone, Link as LinkIcon, Linkedin, Briefcase, GraduationCap, Code, Clock, Globe, Sparkles, Award } from 'lucide-react';

interface Props {
  data: ResumeData;
  template: TemplateType;
  previewRef?: React.RefObject<HTMLDivElement>;
  activeSection?: string;
}

const SectionWrapper = ({ id, children, activeSection }: { id: string, children: React.ReactNode, activeSection?: string }) => {
  const isActive = activeSection === id;
  return (
    <div className={`transition-all duration-300 ${isActive ? 'ring-2 ring-blue-400/50 bg-blue-50/20 rounded -m-2 p-2 print:ring-0 print:bg-transparent print:p-0 print:m-0' : ''}`}>
      {children}
    </div>
  );
};

const SkillsDisplay = ({ skills, themeColor, lightMode = false }: { skills: Skill[], themeColor: string, lightMode?: boolean }) => {
  const technical = skills.filter(s => s.category === 'Technical' || !s.category);
  const soft = skills.filter(s => s.category === 'Soft');
  
  const SkillTag = ({ skill }: { skill: Skill }) => (
    <span className={`${lightMode ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/10 text-white border-white/20'} px-2.5 py-1.5 rounded-lg text-xs font-bold border print:border-slate-300 print:bg-white print:text-black flex items-center gap-1.5 shadow-sm`}>
      <span>{skill.name}</span>
      {skill.level && skill.level !== 'Intermediate' && (
        <span className={`text-[9px] uppercase tracking-wider opacity-60 font-semibold ${skill.level === 'Expert' ? (lightMode ? 'text-emerald-500' : 'text-emerald-300') : ''}`}>
           {skill.level === 'Expert' ? '★' : '•'} {skill.level}
        </span>
      )}
    </span>
  );

  return (
    <div className="space-y-4">
      {technical.length > 0 && (
        <div>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${lightMode ? 'text-slate-500' : 'text-white/60'}`}>Technical</h4>
          <div className="flex flex-wrap gap-2">
            {technical.map(s => <SkillTag key={s.id} skill={s} />)}
          </div>
        </div>
      )}
      {soft.length > 0 && (
        <div>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${lightMode ? 'text-slate-500' : 'text-white/60'}`}>Soft Skills</h4>
          <div className="flex flex-wrap gap-2">
            {soft.map(s => <SkillTag key={s.id} skill={s} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const SectionContent = ({ id, data, themeColor, activeSection }: { id: string, data: ResumeData, themeColor: string, activeSection?: string }) => {
  const content = (() => {
    switch (id) {
      case 'summary':
        return data.personalInfo.summary ? (
          <div className="mb-6 break-inside-avoid">
            <h2 className="text-lg font-bold uppercase mb-2" style={{ color: themeColor }}>Summary</h2>
            <p className="leading-relaxed text-sm">{data.personalInfo.summary}</p>
          </div>
        ) : null;
      
      case 'experience':
        return data.experience.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase mb-4 border-b pb-1" style={{ borderColor: themeColor, color: themeColor }}>Experience</h2>
            <div className="space-y-5">
              {data.experience.map(exp => (
                <div key={exp.id} className="break-inside-avoid relative pl-4 border-l-2 border-slate-100">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-base">{exp.role}</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-700 mb-2">{exp.company}</div>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600 pl-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div className="mb-6 break-inside-avoid">
            <h2 className="text-lg font-bold uppercase mb-4 border-b pb-1" style={{ borderColor: themeColor, color: themeColor }}>Education</h2>
            <div className="space-y-3">
              {data.education.map(edu => (
                <div key={edu.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-slate-800">{edu.school}</span>
                    <span className="text-xs text-slate-500 font-bold">{edu.year}</span>
                  </div>
                  <div className="text-sm text-slate-600">{edu.degree}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'skills':
        return data.skills.length > 0 ? (
          <div className="mb-6 break-inside-avoid">
            <h2 className="text-lg font-bold uppercase mb-2 border-b pb-1" style={{ borderColor: themeColor, color: themeColor }}>Skills</h2>
            <SkillsDisplay skills={data.skills} themeColor={themeColor} lightMode={true} />
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
           <div className="mb-6 break-inside-avoid">
             <h2 className="text-lg font-bold uppercase mb-4 border-b pb-1" style={{ borderColor: themeColor, color: themeColor }}>Certifications</h2>
             <div className="space-y-3">
               {data.certifications.map(cert => (
                 <div key={cert.id} className="flex justify-between items-baseline border-b border-dashed border-slate-200 pb-2">
                   <div>
                     <span className="font-bold text-sm block">{cert.name}</span>
                     <span className="text-sm text-slate-600 italic">{cert.issuer}</span>
                   </div>
                   <span className="text-xs text-slate-500 font-bold">{cert.year}</span>
                 </div>
               ))}
             </div>
           </div>
        ) : null;

      default:
        return null;
    }
  })();

  if (!content) return null;
  return <SectionWrapper id={id} activeSection={activeSection}>{content}</SectionWrapper>;
};

const ModernTemplate: React.FC<{ data: ResumeData; activeSection?: string }> = ({ data, activeSection }) => {
  const { themeColor, sectionOrder } = data.settings || { themeColor: '#2563eb', sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications'] };
  
  // Ensure migration
  const safeSectionOrder = sectionOrder || ['summary', 'experience', 'education', 'skills', 'certifications'];

  return (
    <div className="flex h-full bg-white text-slate-800">
      <div 
        className="w-1/3 text-white p-6 flex flex-col gap-6 print:w-[33%] print:bg-[#1e293b] print-color-adjust-exact"
        style={{ backgroundColor: '#1e293b' }} 
      >
        <SectionWrapper id="personal" activeSection={activeSection}>
          <div className="text-center break-inside-avoid">
            {data.personalInfo.logoUrl && (
              <div className="mb-4 flex justify-center">
                <img src={data.personalInfo.logoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white/10 bg-white shadow-xl" />
              </div>
            )}
            <h1 className="text-2xl font-bold uppercase tracking-widest leading-tight" style={{ color: themeColor }}>
              {data.personalInfo.fullName}
            </h1>
            {data.personalInfo.yearsOfExperience && data.personalInfo.yearsOfExperience > 0 ? (
              <p className="mt-2 inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white/90">
                {data.personalInfo.yearsOfExperience}+ Years Exp.
              </p>
            ) : null}
            {data.personalInfo.location && (
              <p className="flex items-center justify-center gap-2 mt-2 text-slate-300 text-sm">
                <MapPin size={14} /> {data.personalInfo.location}
              </p>
            )}
          </div>

          <div className="space-y-4 text-sm mt-8 break-inside-avoid">
            <div className="border-b border-white/10 pb-2 mb-2 font-bold uppercase tracking-wider text-slate-400 text-xs">Contact</div>
            {data.personalInfo.email && <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-lg border border-white/5"><Mail size={16} className="text-slate-300" /> <span className="font-medium">{data.personalInfo.email}</span></div>}
            {data.personalInfo.phone && <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-lg border border-white/5"><Phone size={16} className="text-slate-300" /> <span className="font-medium">{data.personalInfo.phone}</span></div>}
            {data.personalInfo.linkedin && <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-lg border border-white/5"><Linkedin size={16} className="text-slate-300" /> <span className="font-medium">{data.personalInfo.linkedin}</span></div>}
            {data.personalInfo.website && <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-lg border border-white/5"><LinkIcon size={16} className="text-slate-300" /> <span className="font-medium">{data.personalInfo.website}</span></div>}
          </div>
        </SectionWrapper>

        <div className="flex-1 space-y-6">
          <SectionWrapper id="skills" activeSection={activeSection}>
            <div className="border-b border-white/10 pb-2 mb-2 font-bold uppercase tracking-wider text-slate-400 text-xs">Skills</div>
            <SkillsDisplay skills={data.skills} themeColor={themeColor} lightMode={false} />
          </SectionWrapper>
        </div>
      </div>

      <div className="w-2/3 p-8 print:w-[67%]">
        {/* Render main sections. Exclude skills if handled in sidebar. */}
        {safeSectionOrder.filter(id => id !== 'skills').map(id => (
           <SectionContent key={id} id={id} data={data} themeColor={themeColor} activeSection={activeSection} />
        ))}
      </div>
    </div>
  );
};

const ClassicTemplate: React.FC<{ data: ResumeData; activeSection?: string }> = ({ data, activeSection }) => {
  const { themeColor, sectionOrder } = data.settings || { themeColor: '#000000', sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications'] };
  
  return (
    <div className="h-full bg-white text-black p-10 font-serif print:p-8">
      <SectionWrapper id="personal" activeSection={activeSection}>
        <div className="text-center border-b-2 pb-6 mb-6 break-inside-avoid" style={{ borderColor: themeColor }}>
          {data.personalInfo.logoUrl && (
            <img src={data.personalInfo.logoUrl} alt="Profile" className="w-20 h-20 mx-auto mb-4 object-contain rounded-full border border-gray-200" />
          )}
          <h1 className="text-4xl font-bold mb-2" style={{ color: themeColor }}>{data.personalInfo.fullName}</h1>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 items-center">
            {data.personalInfo.yearsOfExperience && data.personalInfo.yearsOfExperience > 0 ? (
               <span className="font-semibold text-black bg-slate-100 px-2 rounded">{data.personalInfo.yearsOfExperience} Years Exp.</span>
            ) : null}
            {data.personalInfo.email && <span className="flex items-center gap-1"><Mail size={12}/>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span className="flex items-center gap-1">• <Phone size={12}/>{data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span className="flex items-center gap-1">• <MapPin size={12}/>{data.personalInfo.location}</span>}
            {data.personalInfo.linkedin && <span className="flex items-center gap-1">• <Linkedin size={12}/>{data.personalInfo.linkedin}</span>}
          </div>
        </div>
      </SectionWrapper>

      {(sectionOrder || ['summary', 'experience', 'education', 'skills', 'certifications']).map(id => (
        <SectionContent key={id} id={id} data={data} themeColor={themeColor} activeSection={activeSection} />
      ))}
    </div>
  );
};

const MinimalistTemplate: React.FC<{ data: ResumeData; activeSection?: string }> = ({ data, activeSection }) => {
  const { themeColor, sectionOrder } = data.settings || { themeColor: '#475569', sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications'] };
  const safeOrder = sectionOrder || ['summary', 'experience', 'education', 'skills', 'certifications'];

  return (
    <div className="h-full bg-white text-gray-800 p-12 font-mono text-sm print:p-8">
      <SectionWrapper id="personal" activeSection={activeSection}>
        <header className="mb-12 flex gap-8 items-start break-inside-avoid">
          {data.personalInfo.logoUrl && (
            <img src={data.personalInfo.logoUrl} alt="Profile" className="w-24 h-24 rounded-lg object-cover grayscale opacity-90" />
          )}
          <div>
            <h1 className="text-3xl font-bold text-black mb-4" style={{ color: themeColor }}>{data.personalInfo.fullName}</h1>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-gray-600">
              <div className="flex items-center gap-2"><Mail size={14}/> {data.personalInfo.email}</div>
              <div className="flex items-center gap-2"><Phone size={14}/> {data.personalInfo.phone}</div>
              <div className="flex items-center gap-2"><MapPin size={14}/> {data.personalInfo.location}</div>
              <div className="flex items-center gap-2"><LinkIcon size={14}/> {data.personalInfo.website}</div>
              {data.personalInfo.yearsOfExperience && data.personalInfo.yearsOfExperience > 0 ? (
                 <div className="font-bold text-slate-800 col-span-2 mt-2">{data.personalInfo.yearsOfExperience} Years Experience</div>
              ) : null}
            </div>
          </div>
        </header>
      </SectionWrapper>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-8">
           {safeOrder.filter(id => id !== 'skills' && id !== 'education').map(id => (
             <SectionContent key={id} id={id} data={data} themeColor={themeColor} activeSection={activeSection} />
           ))}
        </div>

        <div className="col-span-4 space-y-8">
          <SectionContent id="education" data={data} themeColor={themeColor} activeSection={activeSection} />
          <SectionContent id="skills" data={data} themeColor={themeColor} activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
};

const ProfessionalTemplate: React.FC<{ data: ResumeData; activeSection?: string }> = ({ data, activeSection }) => {
  const { themeColor, sectionOrder } = data.settings || { themeColor: '#0f172a', sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications'] };

  return (
    <div className="h-full bg-white text-slate-800">
      <SectionWrapper id="personal" activeSection={activeSection}>
        <div className="w-full text-white p-8 mb-6 print-color-adjust-exact break-inside-avoid" style={{ backgroundColor: themeColor }}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{data.personalInfo.fullName}</h1>
              <div className="text-white/80 flex gap-6 text-sm items-center mt-4">
                <span className="flex items-center gap-1.5"><Mail size={14}/> {data.personalInfo.email}</span>
                <span className="flex items-center gap-1.5"><Phone size={14}/> {data.personalInfo.phone}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14}/> {data.personalInfo.location}</span>
                {data.personalInfo.yearsOfExperience && data.personalInfo.yearsOfExperience > 0 ? (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-white">{data.personalInfo.yearsOfExperience}y Exp</span>
                ) : null}
              </div>
            </div>
            {data.personalInfo.logoUrl && (
              <img src={data.personalInfo.logoUrl} alt="Profile" className="w-24 h-24 rounded bg-white p-1 object-cover" />
            )}
          </div>
        </div>
      </SectionWrapper>
      
      <div className="px-8 pb-8">
        {(sectionOrder || ['summary', 'experience', 'education', 'skills', 'certifications']).map(id => (
          <div key={id} className="mb-6">
            {id === 'skills' ? (
              data.skills.length > 0 && (
                <SectionWrapper id="skills" activeSection={activeSection}>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b-2 border-slate-200 pb-1 break-inside-avoid" style={{ color: themeColor }}>Skills</h3>
                  <div className="grid grid-cols-1 gap-4">
                     <SkillsDisplay skills={data.skills} themeColor={themeColor} lightMode={true} />
                  </div>
                </SectionWrapper>
              )
            ) : (
              <SectionContent id={id} data={data} themeColor={themeColor} activeSection={activeSection} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const CreativeTemplate: React.FC<{ data: ResumeData; activeSection?: string }> = ({ data, activeSection }) => {
  const { themeColor, sectionOrder } = data.settings || { themeColor: '#e11d48', sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications'] };
  const safeOrder = sectionOrder || ['summary', 'experience', 'education', 'skills', 'certifications'];
  const sidebarSections = ['skills', 'certifications', 'personal'];

  return (
    <div className="h-full bg-white flex">
      {/* Sidebar background is now dynamic based on theme color for extra creativity */}
      <div className="w-1/3 relative print:w-[33%] print-color-adjust-exact">
         <div className="absolute inset-0" style={{ backgroundColor: themeColor }}></div>
         {/* Decorative Overlay */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30"></div>
         
         <div className="relative z-10 p-8 text-white h-full flex flex-col">
            <SectionWrapper id="personal" activeSection={activeSection}>
              <div className="mb-8 text-center break-inside-avoid">
                {data.personalInfo.logoUrl ? (
                  <img src={data.personalInfo.logoUrl} className="w-36 h-36 rounded-full mx-auto border-[6px] border-white/20 mb-6 object-cover shadow-2xl" />
                ) : <div className="w-36 h-36 rounded-full mx-auto border-[6px] border-white/20 mb-6 bg-white/10 flex items-center justify-center"><Sparkles size={32} className="opacity-50"/></div>}
                
                <h1 className="text-3xl font-black uppercase leading-none mb-3 tracking-tight">{data.personalInfo.fullName}</h1>
                <p className="text-white/80 text-sm mb-4 font-medium flex items-center justify-center gap-1"><MapPin size={14}/> {data.personalInfo.location}</p>
                 {data.personalInfo.yearsOfExperience && data.personalInfo.yearsOfExperience > 0 ? (
                  <span className="inline-block bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    {data.personalInfo.yearsOfExperience} Years Experience
                  </span>
                ) : null}
              </div>

              <div className="space-y-6 flex-1 break-inside-avoid mt-8">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 border-b border-white/10 pb-2">Contact</h3>
                  <div className="space-y-3 text-sm text-white font-medium">
                    {data.personalInfo.email && (
                      <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 transition-transform hover:scale-105">
                        <Mail size={18} className="text-white/90" /> 
                        <span className="break-all">{data.personalInfo.email}</span>
                      </div>
                    )}
                    {data.personalInfo.phone && (
                      <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 transition-transform hover:scale-105">
                        <Phone size={18} className="text-white/90" /> 
                        <span>{data.personalInfo.phone}</span>
                      </div>
                    )}
                    {data.personalInfo.website && (
                      <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 transition-transform hover:scale-105">
                        <LinkIcon size={18} className="text-white/90" /> 
                        <span className="text-xs">{data.personalInfo.website}</span>
                      </div>
                    )}
                     {data.personalInfo.linkedin && (
                      <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 transition-transform hover:scale-105">
                        <Linkedin size={18} className="text-white/90" /> 
                        <span className="text-xs">{data.personalInfo.linkedin}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SectionWrapper>

             <div className="mt-8 break-inside-avoid space-y-8">
                 {data.skills.length > 0 && (
                    <SectionWrapper id="skills" activeSection={activeSection}>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 border-b border-white/10 pb-2">Skills</h3>
                      <div className="flex flex-col gap-4">
                          {(() => {
                            const technical = data.skills.filter(s => s.category === 'Technical' || !s.category);
                            const soft = data.skills.filter(s => s.category === 'Soft');
                            return (
                              <>
                                {technical.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {technical.map(s => (
                                      <span key={s.id} className="bg-white text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-md print-color-adjust-exact border-2 border-white/50">
                                        {s.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {soft.length > 0 && (
                                  <div>
                                    <h4 className="text-[10px] uppercase text-white/50 mb-2 font-bold tracking-wider">Soft Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {soft.map(s => (
                                        <span key={s.id} className="bg-black/20 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-medium print-color-adjust-exact">
                                          {s.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )
                          })()}
                      </div>
                    </SectionWrapper>
                 )}

                 {data.certifications && data.certifications.length > 0 && (
                    <SectionWrapper id="certifications" activeSection={activeSection}>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 border-b border-white/10 pb-2">Certifications</h3>
                      <div className="space-y-3">
                        {data.certifications.map(cert => (
                          <div key={cert.id} className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                            <div className="font-bold text-sm text-white mb-0.5">{cert.name}</div>
                            <div className="flex justify-between items-center text-xs text-white/70">
                               <span>{cert.issuer}</span>
                               <span className="font-mono opacity-80 bg-black/20 px-1.5 py-0.5 rounded">{cert.year}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionWrapper>
                 )}
              </div>
         </div>
      </div>

      <div className="w-2/3 p-10 pt-16 print:w-[67%] print:p-8">
        {safeOrder.filter(id => !sidebarSections.includes(id)).map(id => (
           <div key={id} className="mb-10 relative pl-8 border-l-4 border-slate-100 break-inside-avoid">
              <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm print-color-adjust-exact" style={{ backgroundColor: themeColor }}></div>
              <SectionContent id={id} data={data} themeColor={themeColor} activeSection={activeSection} />
           </div>
        ))}
      </div>
    </div>
  );
};

export const ResumePreview: React.FC<Props> = ({ data, template, previewRef, activeSection }) => {
  const { font } = data.settings || { font: 'Inter' };

  const renderTemplate = () => {
    switch (template) {
      case TemplateType.CLASSIC:
        return <ClassicTemplate data={data} activeSection={activeSection} />;
      case TemplateType.MINIMALIST:
        return <MinimalistTemplate data={data} activeSection={activeSection} />;
      case TemplateType.PROFESSIONAL:
        return <ProfessionalTemplate data={data} activeSection={activeSection} />;
      case TemplateType.CREATIVE:
        return <CreativeTemplate data={data} activeSection={activeSection} />;
      case TemplateType.MODERN:
      default:
        return <ModernTemplate data={data} activeSection={activeSection} />;
    }
  };

  return (
    <div 
      id="resume-preview-container" 
      ref={previewRef} 
      className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg overflow-hidden relative print:shadow-none print:m-0 print:w-full print:h-auto print:overflow-visible"
      style={{ fontFamily: font }}
    >
      {renderTemplate()}
    </div>
  );
};