
export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  category?: 'Technical' | 'Soft';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface ResumeSettings {
  themeColor: string;
  font: 'Inter' | 'Merriweather' | 'Roboto Mono';
  sectionOrder: string[];
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    logoUrl?: string;
    summary: string;
    yearsOfExperience?: number;
  };
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  settings: ResumeSettings;
}

export interface AtsAnalysis {
  score: number;
  keywordsPresent: string[];
  keywordsMissing: string[];
  suggestions: string[];
  formattingIssues: { issue: string; solution: string }[];
}

export interface JobMatchAnalysis {
  matchScore: number;
  missingKeywords: string[];
  recommendations: string[];
}

export enum TemplateType {
  MODERN = 'modern',
  CLASSIC = 'classic',
  MINIMALIST = 'minimalist',
  PROFESSIONAL = 'professional',
  CREATIVE = 'creative',
}

export const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    logoUrl: '',
    summary: '',
    yearsOfExperience: 0,
  },
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  settings: {
    themeColor: '#2563eb', // Blue-600
    font: 'Inter',
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications'],
  },
};