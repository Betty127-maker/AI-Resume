
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition, BorderStyle, ImageRun } from "docx";
import saveAs from "file-saver";
import { ResumeData, Skill } from "../types";

export const exportService = {
  exportToPdf: async (data: ResumeData) => {
    const element = document.getElementById('resume-preview-container');
    if (!element) return;

    // Check if html2pdf is available (loaded via CDN in index.html)
    // @ts-ignore
    if (typeof window.html2pdf !== 'undefined') {
      const opt = {
        margin: 0,
        filename: `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      try {
        // @ts-ignore
        await window.html2pdf().set(opt).from(element).save();
      } catch (e) {
        console.error("PDF generation failed, falling back to print", e);
        // Fallback to native print if library fails
        const originalTitle = document.title;
        document.title = `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume`;
        window.print();
        document.title = originalTitle;
      }
    } else {
      // Fallback to native print if library fails to load
      const originalTitle = document.title;
      document.title = `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume`;
      window.print();
      document.title = originalTitle;
    }
  },

  exportToHtml: (data: ResumeData, elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Create a standalone HTML file with necessary styles embedded
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.personalInfo.fullName} - Resume</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Roboto+Mono:wght@400;500&display=swap');
          body { 
            background-color: white; 
            margin: 0; 
            padding: 20px; 
            font-family: '${data.settings?.font || 'Inter'}', sans-serif;
            display: flex;
            justify-content: center;
          }
          /* Ensure the container behaves like a page */
          #resume-preview-container {
             width: 210mm;
             min-height: 297mm;
             background: white;
             box-shadow: none;
             margin: 0 auto;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.html`);
  },

  exportToDocx: async (data: ResumeData) => {
    const children: any[] = [];
    const themeColor = data.settings?.themeColor || '#2563eb';
    const font = data.settings?.font || 'Inter';
    // Ensure all sections are covered in export even if settings are old
    const defaultSections = ['summary', 'experience', 'education', 'skills', 'certifications'];
    const sectionOrder = data.settings?.sectionOrder 
       ? [...new Set([...data.settings.sectionOrder, ...defaultSections])] 
       : defaultSections;

    // Logo (if exists)
    if (data.personalInfo.logoUrl) {
      try {
        const response = await fetch(data.personalInfo.logoUrl);
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        
        let imageType: "png" | "jpg" | "gif" | "bmp" = "png";
        const mimeType = blob.type.toLowerCase();
        if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
          imageType = "jpg";
        } else if (mimeType.includes("gif")) {
          imageType = "gif";
        } else if (mimeType.includes("bmp")) {
          imageType = "bmp";
        }

        children.push(new Paragraph({
          children: [
            new ImageRun({
              data: new Uint8Array(buffer),
              transformation: {
                width: 100,
                height: 100,
              },
              type: imageType,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }));
      } catch (e) {
        console.warn("Could not add logo to DOCX", e);
      }
    }

    // Name
    children.push(new Paragraph({
      children: [
        new TextRun({
          text: data.personalInfo.fullName,
          font: font,
          color: themeColor,
          bold: true,
          size: 48, // 24pt
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }));

    // Contact Info & Years of Experience
    const contactParts = [
      new TextRun({ text: data.personalInfo.email || '', font: font }),
      new TextRun({ text: " | ", font: font }),
      new TextRun({ text: data.personalInfo.phone || '', font: font }),
      ...(data.personalInfo.location ? [
        new TextRun({ text: " | ", font: font }), 
        new TextRun({ text: data.personalInfo.location, font: font })
      ] : []),
      ...(data.personalInfo.yearsOfExperience && data.personalInfo.yearsOfExperience > 0 ? [
        new TextRun({ text: " | ", font: font }),
        new TextRun({ text: `${data.personalInfo.yearsOfExperience} Years Exp.`, font: font, bold: true })
      ] : [])
    ];

    children.push(new Paragraph({
      children: contactParts,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }));

    // Links
    children.push(new Paragraph({
      children: [
        ...(data.personalInfo.linkedin ? [new TextRun({ text: `LinkedIn: ${data.personalInfo.linkedin}`, font: font })] : []),
        ...(data.personalInfo.linkedin && data.personalInfo.website ? [new TextRun({ text: " | ", font: font })] : []),
        ...(data.personalInfo.website ? [new TextRun({ text: `Portfolio: ${data.personalInfo.website}`, font: font })] : []),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }));

    // Iterate through dynamic section order
    // We use a set to track printed sections to avoid duplicates if sectionOrder logic is loose
    const printedSections = new Set();

    sectionOrder.forEach(section => {
      if (printedSections.has(section)) return;
      printedSections.add(section);

      if (section === 'summary' && data.personalInfo.summary) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: "Professional Summary", font: font, color: themeColor, bold: true, size: 28 })],
            heading: HeadingLevel.HEADING_2,
            border: { bottom: { color: themeColor, space: 1, style: BorderStyle.SINGLE, size: 6 } },
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: data.personalInfo.summary, font: font })],
            spacing: { after: 300 },
          })
        );
      } else if (section === 'experience' && data.experience.length > 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: "Experience", font: font, color: themeColor, bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
          border: { bottom: { color: themeColor, space: 1, style: BorderStyle.SINGLE, size: 6 } },
          spacing: { before: 200, after: 100 },
        }));

        data.experience.forEach(exp => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: exp.role, bold: true, size: 24, font: font }), 
                new TextRun({
                   text: `\t${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
                   bold: true,
                   font: font
                }),
              ],
              tabStops: [
                { type: TabStopType.RIGHT, position: 9500 },
              ],
              spacing: { before: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: exp.company, italics: true, font: font, color: themeColor })
              ],
              spacing: { after: 50 },
            }),
            ...exp.description.split('\n').map(bullet => 
              new Paragraph({
                children: [new TextRun({ text: bullet.replace(/^[•-]\s*/, ''), font: font })],
                bullet: { level: 0 }, 
              })
            ),
             new Paragraph({ text: "", spacing: { after: 200 } })
          );
        });
      } else if (section === 'education' && data.education.length > 0) {
         children.push(new Paragraph({
          children: [new TextRun({ text: "Education", font: font, color: themeColor, bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
          border: { bottom: { color: themeColor, space: 1, style: BorderStyle.SINGLE, size: 6 } },
          spacing: { before: 200, after: 100 },
        }));

        data.education.forEach(edu => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: edu.school, bold: true, font: font }),
                new TextRun({ text: `\t${edu.year}`, font: font }),
              ],
               tabStops: [
                { type: TabStopType.RIGHT, position: 9500 },
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: edu.degree, font: font })],
              spacing: { after: 200 },
            })
          );
        });
      } else if (section === 'skills' && data.skills.length > 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: "Skills", font: font, color: themeColor, bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
          border: { bottom: { color: themeColor, space: 1, style: BorderStyle.SINGLE, size: 6 } },
          spacing: { before: 200, after: 100 },
        }));

        const technical = data.skills.filter(s => s.category === 'Technical' || !s.category);
        const soft = data.skills.filter(s => s.category === 'Soft');

        if (technical.length > 0) {
           children.push(new Paragraph({
             children: [
               new TextRun({ text: "Technical Skills: ", bold: true, font: font }),
               new TextRun({ text: technical.map(s => s.name).join(' • '), font: font })
             ],
             spacing: { after: 100 }
           }));
        }

        if (soft.length > 0) {
           children.push(new Paragraph({
             children: [
               new TextRun({ text: "Soft Skills: ", bold: true, font: font }),
               new TextRun({ text: soft.map(s => s.name).join(' • '), font: font })
             ],
             spacing: { after: 100 }
           }));
        }
      } else if (section === 'certifications' && data.certifications && data.certifications.length > 0) {
         children.push(new Paragraph({
          children: [new TextRun({ text: "Certifications", font: font, color: themeColor, bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
          border: { bottom: { color: themeColor, space: 1, style: BorderStyle.SINGLE, size: 6 } },
          spacing: { before: 200, after: 100 },
        }));

        data.certifications.forEach(cert => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: cert.name, bold: true, font: font }),
                new TextRun({ text: `\t${cert.year}`, font: font }),
              ],
               tabStops: [
                { type: TabStopType.RIGHT, position: 9500 },
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: cert.issuer, font: font, italics: true })],
              spacing: { after: 100 },
            })
          );
        });
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.docx`);
  }
};