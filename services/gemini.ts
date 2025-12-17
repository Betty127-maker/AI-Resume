import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, AtsAnalysis, JobMatchAnalysis } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize JSON string if the model returns markdown code blocks
const cleanJson = (text: string) => {
  return text.replace(/```json\n?|\n?```/g, '').trim();
};

export const geminiService = {
  async generateSummary(data: ResumeData, context?: string): Promise<string> {
    // Exclude logoUrl from prompt to save tokens
    const { logoUrl, ...safePersonalInfo } = data.personalInfo;
    
    // Extract style references from experience
    const styleRefs = data.experience
      .filter(e => e.description.trim().length > 20)
      .map(e => e.description)
      .slice(0, 3); // Take up to 3 examples

    const prompt = `
      Create a professional resume summary for the following profile. 
      ${context ? `Target Job Context (Role or Description): ${context}` : ''}
      Current Profile: ${JSON.stringify(safePersonalInfo)}
      Experience: ${JSON.stringify(data.experience)}
      Skills: ${JSON.stringify(data.skills)}
      
      Style Guidance:
      Analyze the tone and structure of the user's existing experience descriptions:
      ${JSON.stringify(styleRefs)}
      Try to match this professional voice (e.g. metric-heavy, concise, or descriptive) in the summary.

      Keep it under 4 sentences. Focus on achievements and value proposition.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error("Gemini summary error:", error);
      throw error;
    }
  },

  async generateExperienceContent(role: string, company: string): Promise<string[]> {
    const prompt = `
      Act as an expert resume writer.
      Generate 4 professional, ATS-optimized resume bullet points for a professional with the role "${role}" at company "${company}".
      
      Requirements:
      - Include strong industry-specific keywords naturally (e.g. for software: "CI/CD", "Agile"; for marketing: "ROI", "Campaigns").
      - Focus on achievements and standard responsibilities for this role level.
      - Use active voice and strong action verbs.
      - Ensure the content is suitable for parsing by Applicant Tracking Systems (ATS).
      
      Return ONLY a JSON array of strings.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      return JSON.parse(cleanJson(response.text)) as string[];
    } catch (error) {
      console.error("Gemini content generation error:", error);
      throw error;
    }
  },

  async optimizeExperience(role: string, description: string, styleRefs: string[] = []): Promise<string[]> {
    let stylePrompt = "";
    if (styleRefs.length > 0) {
      stylePrompt = `
      Style Adaptation (CRITICAL):
      The user has manually written or approved the writing style found in these examples:
      ${JSON.stringify(styleRefs)}
      
      INSTRUCTION: Rewrite the target description to strictly mimic this style. 
      - If examples use dense metrics (e.g. "Increased X by Y%"), ensure the output uses metrics/placeholders.
      - If examples are short and punchy, keep output short.
      - Match the vocabulary level.
      `;
    }

    const prompt = `
      Act as an expert resume writer specializing in ATS optimization.
      Rewrite the following job description bullet points to be more impactful.
      
      Requirements:
      1. Integrate industry-specific keywords relevant to "${role}".
      2. Quantify results where possible (use placeholders like [X]% if needed).
      3. Ensure high ATS readability (standard formatting, clear keywords).
      
      ${stylePrompt}
      
      Target Role: ${role}
      Original Text: "${description}"
      
      Return ONLY a JSON array of strings (the improved bullet points).
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      return JSON.parse(cleanJson(response.text)) as string[];
    } catch (error) {
      console.error("Gemini optimization error:", error);
      return description.split('\n').filter(Boolean); // Fallback
    }
  },

  async suggestSkills(role: string, context?: string): Promise<string[]> {
    const prompt = `
      List 10 relevant technical and soft skills for a professional with the role: "${role}".
      ${context ? `Context from user's actual resume content: "${context.substring(0, 1000)}..."` : ''}
      
      INSTRUCTION:
      - If context is provided, prioritize specific skills, tools, or methodologies mentioned or implied in the text.
      - Suggest complementary skills that fit the user's profile level.
      - Include Industry Standard Keywords for ATS matching.
      
      Return ONLY a JSON array of strings.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      return JSON.parse(cleanJson(response.text)) as string[];
    } catch (error) {
      console.error("Gemini skills error:", error);
      return [];
    }
  },

  async analyzeATS(data: ResumeData): Promise<AtsAnalysis> {
    const { logoUrl, ...safePersonalInfo } = data.personalInfo;
    const safeData = { ...data, personalInfo: safePersonalInfo };

    const prompt = `
      Analyze this resume data for Applicant Tracking System (ATS) compatibility.
      Focus on keyword density, standard section headers, and content clarity.
      Resume Data: ${JSON.stringify(safeData)}
      
      Return a JSON object with:
      - score (number 0-100)
      - keywordsPresent (array of strings)
      - keywordsMissing (array of strings - identify the industry and list critical missing terms)
      - suggestions (array of strings - specific tips to improve parsing and ranking)
      - formattingIssues (array of objects: {issue: string, solution: string} - identify formatting red flags and how to fix them. If none, return empty array)
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              keywordsPresent: { type: Type.ARRAY, items: { type: Type.STRING } },
              keywordsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              formattingIssues: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    issue: { type: Type.STRING },
                    solution: { type: Type.STRING }
                  }
                } 
              }
            }
          }
        }
      });
      
      return JSON.parse(cleanJson(response.text)) as AtsAnalysis;
    } catch (error) {
      console.error("Gemini ATS error:", error);
      throw error;
    }
  },

  async analyzeJobMatch(data: ResumeData, jobDescription: string): Promise<JobMatchAnalysis> {
    const { logoUrl, ...safePersonalInfo } = data.personalInfo;
    const safeData = { ...data, personalInfo: safePersonalInfo };

    const prompt = `
      Compare this resume against the job description.
      Resume: ${JSON.stringify(safeData)}
      Job Description: "${jobDescription}"
      
      Return a JSON object with:
      - matchScore (number 0-100)
      - missingKeywords (array of strings - critical skills/terms in JD missing from resume)
      - recommendations (array of strings - specific advice to improve match)
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
           responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: { type: Type.INTEGER },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      
      return JSON.parse(cleanJson(response.text)) as JobMatchAnalysis;
    } catch (error) {
      console.error("Gemini Job Match error:", error);
      throw error;
    }
  }
};
