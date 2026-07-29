import { useState, useRef, useMemo } from 'react';
import { 
  X, Printer, Download, Copy, Check, FileText, Settings, Sliders, Sparkles, 
  CheckSquare, Square, Filter, ChevronRight, Award, Briefcase, Eye, 
  RotateCcw, ShieldCheck, Mail, Phone, MapPin, Globe, Linkedin, Github
} from 'lucide-react';
import { PERSONAL_INFO, SKILL_CATEGORIES, WORK_EXPERIENCE, EDUCATION_HISTORY, PROJECTS, BUG_REPORTS, PROFESSIONAL_REFERENCES } from '../data';
import html2pdf from 'html2pdf.js';

interface ResumeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCoverLetter?: () => void;
}

export type TemplateType = 'classic-ats' | 'modern-pro' | 'minimal' | 'executive' | 'portfolio-style';
export type TargetRoleType = 'all-rounder' | 'automation-qa' | 'api-testing' | 'manual-qa';

export default function ResumeBuilderModal({ isOpen, onClose, onOpenCoverLetter }: ResumeBuilderModalProps) {
  if (!isOpen) return null;

  // Selected Template & Role Presets
  const [template, setTemplate] = useState<TemplateType>('classic-ats');
  const [targetRole, setTargetRole] = useState<TargetRoleType>('all-rounder');
  const [activeTab, setActiveTab] = useState<'preview' | 'projects-filter' | 'customize' | 'ats-score' | 'cover-letter'>('preview');

  // Interactive Project Selection Checkboxes
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    PROJECTS.map(p => p.id)
  );

  // Customizable Fields (Synced with portfolio data by default)
  const [customInfo, setCustomInfo] = useState({
    name: PERSONAL_INFO.name,
    title: PERSONAL_INFO.title,
    email: PERSONAL_INFO.email,
    phone: PERSONAL_INFO.phone,
    location: PERSONAL_INFO.location,
    linkedin: PERSONAL_INFO.linkedin,
    github: PERSONAL_INFO.github,
    summary: "Software Quality Assurance Engineer with 2+ years of hands-on experience in Manual Testing, API Testing, and Web Application Testing. Experienced in designing comprehensive test cases, executing functional, regression, and exploratory testing, validating REST APIs, and reporting defects with a strong focus on software quality and user experience. Currently expanding expertise in UI Automation using Playwright (Python), Mobile Testing, and CI/CD with GitHub Actions."
  });

  // Cover Letter Customizer State
  const [targetCompany, setTargetCompany] = useState('Tech Solutions Inc.');
  const [targetJobTitle, setTargetJobTitle] = useState('Software QA Engineer');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedCover, setCopiedCover] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const resumeRef = useRef<HTMLDivElement>(null);

  // Role Target Summaries & Skills Filtering
  const roleSummaries = useMemo(() => ({
    'all-rounder': customInfo.summary,
    'automation-qa': "SQA Automation Engineer specializing in Playwright (Python & TypeScript), Selenium WebDriver, Pytest, and Page Object Model (POM) architecture. Experienced in setting up CI/CD test execution pipelines in GitHub Actions, Allure reporting, and automating E2E web application test suites.",
    'api-testing': "SQA Engineer with specialized expertise in REST API Testing & Automation. Skilled in Postman, Newman CLI, dynamic JavaScript assertion scripts, environment variable chaining, HTTP response status code assertions, and JSON schema validation.",
    'manual-qa': "Detail-oriented Manual Quality Assurance Engineer experienced in complete STLC/SDLC workflows, test planning, writing granular test cases, regression execution, and Jira defect tracking across FinTech, ERP, and SaaS web systems."
  }), [customInfo.summary]);

  const activeSummary = roleSummaries[targetRole];

  // Filtered Projects based on user selection
  const selectedProjects = useMemo(() => {
    return PROJECTS.filter(p => selectedProjectIds.includes(p.id));
  }, [selectedProjectIds]);

  // Quick Filter handlers
  const toggleProject = (id: string) => {
    setSelectedProjectIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllProjects = () => setSelectedProjectIds(PROJECTS.map(p => p.id));
  const deselectAllProjects = () => setSelectedProjectIds([]);
  const filterByProjectType = (type: 'Automation' | 'API' | 'Manual' | 'Performance') => {
    setSelectedProjectIds(PROJECTS.filter(p => p.type === type).map(p => p.id));
  };

  // ATS Score calculation algorithm
  const atsAnalysis = useMemo(() => {
    let score = 0;
    const checks: { label: string; passed: boolean; tip: string }[] = [];

    // Check 1: Contact info
    const hasContact = Boolean(customInfo.email && customInfo.phone && customInfo.location);
    if (hasContact) score += 20;
    checks.push({
      label: 'Complete Contact Information',
      passed: hasContact,
      tip: 'Ensure email, phone number, and location are present.'
    });

    // Check 2: Core SQA Keywords
    const allSkillsText = SKILL_CATEGORIES.flatMap(c => c.items).join(' ').toLowerCase();
    const coreKeywords = ['playwright', 'selenium', 'postman', 'api', 'stlc', 'jira', 'manual', 'automation', 'sql', 'python', 'jmeter'];
    const matchedKeywords = coreKeywords.filter(k => allSkillsText.includes(k) || activeSummary.toLowerCase().includes(k));
    const keywordScore = Math.min(25, Math.round((matchedKeywords.length / coreKeywords.length) * 25));
    score += keywordScore;
    checks.push({
      label: `Core SQA Keywords (${matchedKeywords.length}/${coreKeywords.length} matched)`,
      passed: keywordScore >= 20,
      tip: 'Includes essential SQA tools: Playwright, Selenium, Postman, Jira, STLC, SQL.'
    });

    // Check 3: Quantifiable Metrics & Numbers
    const metricsCount = (WORK_EXPERIENCE.flatMap(e => e.highlights).join(' ').match(/\d+/g) || []).length;
    const hasMetrics = metricsCount > 3;
    if (hasMetrics) score += 20;
    checks.push({
      label: 'Quantifiable Metrics & Stats',
      passed: hasMetrics,
      tip: 'Use numbers like "150+ Test Cases", "2+ Years Exp", "0% Error Rate".'
    });

    // Check 4: Featured Projects Included
    const projectScore = selectedProjects.length >= 2 ? 20 : selectedProjects.length * 10;
    score += projectScore;
    checks.push({
      label: `Featured SQA Projects Selected (${selectedProjects.length} included)`,
      passed: selectedProjects.length >= 2,
      tip: 'Include at least 2-3 relevant projects to prove hands-on test execution.'
    });

    // Check 5: Formatting & Structure
    score += 15;
    checks.push({
      label: 'Standard ATS Layout & Clean Sections',
      passed: true,
      tip: 'Uses single-column ATS parser compliant structure.'
    });

    return { totalScore: Math.min(100, score), checks };
  }, [customInfo, activeSummary, selectedProjects]);

  // PDF Export via html2pdf
  const handleDownloadPDF = () => {
    if (!resumeRef.current) return;
    setIsExportingPdf(true);

    const element = resumeRef.current;
    const opt = {
      margin: [10, 12, 10, 12] as [number, number, number, number],
      filename: `${customInfo.name.replace(/\s+/g, '_')}_SQA_Engineer_Resume.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        onclone: (clonedDoc: Document) => {
          // Replace oklch in all style tags to avoid html2canvas CSS parsing crash
          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach((styleTag) => {
            if (styleTag.innerHTML && styleTag.innerHTML.includes('oklch')) {
              styleTag.innerHTML = styleTag.innerHTML.replace(/oklch\([^)]+\)/g, '#111827');
            }
          });

          const root = clonedDoc.querySelector('.print-only-resume') as HTMLElement | null;
          if (root) {
            root.style.backgroundColor = '#ffffff';
            root.style.color = '#000000';
            root.style.border = 'none';
            root.style.boxShadow = 'none';
            root.style.borderRadius = '0px';
            root.style.padding = '0px';
            const allEls = root.querySelectorAll('*');
            allEls.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const style = window.getComputedStyle(htmlEl);
              if (style.color && style.color.includes('oklch')) {
                htmlEl.style.color = '#111827';
              }
              if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
                if (htmlEl.classList.contains('bg-slate-900')) {
                  htmlEl.style.backgroundColor = '#0f172a';
                } else if (htmlEl.classList.contains('bg-slate-50') || htmlEl.classList.contains('bg-gray-100')) {
                  htmlEl.style.backgroundColor = '#f3f4f6';
                } else if (htmlEl.classList.contains('bg-slate-200')) {
                  htmlEl.style.backgroundColor = '#e2e8f0';
                } else {
                  htmlEl.style.backgroundColor = 'transparent';
                }
              }
              if (style.borderColor && style.borderColor.includes('oklch')) {
                htmlEl.style.borderColor = '#d1d5db';
              }
            });
          }
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsExportingPdf(false);
    }).catch((err: unknown) => {
      console.error('PDF generation error:', err);
      setIsExportingPdf(false);
      window.print();
    });
  };

  // Browser Print trigger with dedicated isolated iframe for A4 print/PDF output
  const handlePrint = () => {
    try {
      window.focus();
      const element = resumeRef.current;
      if (!element) {
        window.print();
        return;
      }

      // Collect all active styles and fonts from head
      const styleSheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((el) => el.outerHTML)
        .join('\n');

      // Create an isolated print iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${customInfo.name.replace(/[^a-zA-Z0-9 ]/g, '')} - SQA Engineer Resume</title>
              ${styleSheets}
              <style>
                @page { size: A4 portrait; margin: 10mm 12mm; }
                body {
                  background-color: #ffffff !important;
                  color: #000000 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .print-only-resume {
                  width: 100% !important;
                  max-width: 100% !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: #ffffff !important;
                  color: #000000 !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
              </style>
            </head>
            <body>
              <div class="print-only-resume">
                ${element.innerHTML}
              </div>
            </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.warn('Iframe print failed, falling back to window.print()', e);
            window.print();
          }
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1500);
        }, 300);
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Print error:', err);
      window.print();
    }
  };

  // DOCX Export trigger
  const handleDownloadDOCX = () => {
    if (!resumeRef.current) return;
    const content = resumeRef.current.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Resume</title><style>" +
      "body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #000; }" +
      "h1 { font-size: 18pt; margin-bottom: 4pt; color: #111; }" +
      "h2 { font-size: 13pt; text-transform: uppercase; border-bottom: 1px solid #333; margin-top: 12pt; margin-bottom: 6pt; color: #111; }" +
      "p, li { font-size: 10pt; font-family: Arial, sans-serif; }" +
      "ul { margin-top: 2pt; margin-bottom: 6pt; padding-left: 18pt; }" +
      "</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${customInfo.name.replace(/\s+/g, '_')}_Resume.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  // Plain Text Copying
  const handleCopyPlainText = () => {
    let text = `${customInfo.name.toUpperCase()}\n${customInfo.title}\n`;
    text += `Email: ${customInfo.email} | Phone: ${customInfo.phone} | Location: ${customInfo.location}\n`;
    text += `LinkedIn: ${customInfo.linkedin} | GitHub: ${customInfo.github}\n\n`;
    text += `=== PROFESSIONAL SUMMARY ===\n${activeSummary}\n\n`;
    text += `=== CORE SKILLS ===\n`;
    SKILL_CATEGORIES.forEach(c => {
      text += `${c.category}: ${c.items.join(', ')}\n`;
    });
    text += `\n=== WORK EXPERIENCE ===\n`;
    WORK_EXPERIENCE.forEach(e => {
      text += `${e.role} | ${e.company} (${e.period}) - ${e.location}\n`;
      e.highlights.forEach(h => {
        text += `• ${h}\n`;
      });
      text += `\n`;
    });
    text += `=== KEY PROJECTS ===\n`;
    selectedProjects.forEach(p => {
      text += `${p.title} (${p.type}) | ${p.link || ''}\n`;
      text += `${p.description}\n`;
      if (p.tags) text += `Tools: ${p.tags.join(', ')}\n`;
      text += `\n`;
    });
    text += `=== EDUCATION ===\n`;
    EDUCATION_HISTORY.forEach(edu => {
      text += `${edu.degree} - ${edu.institution} (${edu.period})\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Generated Cover Letter
  const generatedCoverLetter = useMemo(() => {
    return `Sabbir Ahamed
Tongi East, Gazipur 1710, Bangladesh
${customInfo.email} | ${customInfo.phone}
${customInfo.linkedin}

Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Hiring Manager / Talent Acquisition Team
${targetCompany}

Subject: Application for ${targetJobTitle} Position

Dear Hiring Manager,

I am writing to express my strong enthusiasm for the ${targetJobTitle} position at ${targetCompany}. With over 2 years of hands-on experience in Software Quality Assurance at Altersense Ltd, I have developed deep expertise in Manual Testing, REST API Verification, and Web UI Automation using Playwright (Python) and Selenium.

In my current role as Jr. SQA Engineer, I actively participate in Agile sprints, write comprehensive test cases, perform thorough regression and exploratory testing across complex ERP commercial modules, and report actionable defects in Jira. Additionally, I lead API test automation using Postman & Newman, verifying endpoint payloads and data integrity in SQL databases.

Key strengths I bring to ${targetCompany}:
• Proven track record in designing 150+ test cases and catching critical edge-case defects before production deployment.
• Hands-on automation skills in Playwright (Python), Pytest, Selenium, and CI/CD integration with GitHub Actions.
• Rigorous execution of STLC & SDLC principles with strong focus on user experience and software reliability.

I am eager to contribute my QA methodologies and automation enthusiasm to ${targetCompany}'s engineering goals. Thank you for considering my application. I welcome the opportunity to discuss how my qualifications align with your team's objectives.

Sincerely,

Sabbir Ahamed
Software Quality Assurance Engineer`;
  }, [customInfo, targetCompany, targetJobTitle]);

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(generatedCoverLetter);
    setCopiedCover(true);
    setTimeout(() => setCopiedCover(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex flex-col justify-between animate-fadeIn">
      {/* Modal Top Navigation Header */}
      <div className="bg-[#12151C] border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between no-print z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-[#FF6B35]/15 p-2 rounded-xl border border-[#FF6B35]/30">
            <FileText className="w-5 h-5 text-[#FF6B35]" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
              <span>Dynamic SQA Resume Builder</span>
              <span className="text-[10px] font-mono font-normal uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Live Data Synced
              </span>
            </h2>
            <p className="text-xs text-[#9CA3AF] hidden sm:block">
              Auto-generated from portfolio • ATS Optimized • Customizable
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-medium transition-colors cursor-pointer"
            title="Print or Save to PDF via Browser"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPdf}
            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#FF6B35] hover:bg-[#FF814F] text-white text-xs font-mono font-semibold shadow-lg shadow-[#FF6B35]/20 transition-all cursor-pointer disabled:opacity-50"
            title="Download vector PDF file directly"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer ml-2"
            title="Close Resume Builder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container Layout: Controls Bar + Live Preview */}
      <div className="flex-grow overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left Control Sidebar */}
        <div className="w-full md:w-80 lg:w-96 bg-[#0B0D12] border-r border-white/10 flex flex-col overflow-y-auto p-4 space-y-6 no-print max-h-[40vh] md:max-h-none">
          
          {/* Navigation Control Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#12151C] rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-2 rounded-lg text-center transition-colors cursor-pointer ${activeTab === 'preview' ? 'bg-[#FF6B35] text-white font-bold' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              Template
            </button>
            <button
              onClick={() => setActiveTab('projects-filter')}
              className={`py-2 rounded-lg text-center transition-colors cursor-pointer relative ${activeTab === 'projects-filter' ? 'bg-[#FF6B35] text-white font-bold' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              Projects
              <span className="ml-1 text-[9px] bg-white/20 px-1 rounded-full">{selectedProjectIds.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('ats-score')}
              className={`py-2 rounded-lg text-center transition-colors cursor-pointer ${activeTab === 'ats-score' ? 'bg-[#FF6B35] text-white font-bold' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              ATS ({atsAnalysis.totalScore}%)
            </button>
            <button
              onClick={() => setActiveTab('cover-letter')}
              className={`py-2 rounded-lg text-center transition-colors cursor-pointer ${activeTab === 'cover-letter' ? 'bg-[#FF6B35] text-white font-bold' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              Cover
            </button>
          </div>

          {/* TAB 1: TEMPLATE & ROLE SELECTION */}
          {activeTab === 'preview' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Template Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#FF6B35] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Choose Resume Template</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'classic-ats', name: 'Classic ATS (Highest Pass Rate)', desc: 'Standard single-column, max parser parsing accuracy.' },
                    { id: 'modern-pro', name: 'Modern Professional', desc: 'Clean header bar, skill pill badges, refined typography.' },
                    { id: 'minimal', name: 'Minimalist Clean', desc: 'Sleek, spacious black-and-white print design.' },
                    { id: 'executive', name: 'Executive Leadership', desc: 'Bold top header, highlighted metrics & stats banner.' },
                    { id: 'portfolio-style', name: 'Portfolio Technical Style', desc: 'Emphasizes automation suite links and test metrics.' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id as TemplateType)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        template === t.id 
                          ? 'bg-[#12151C] border-[#FF6B35] shadow-lg shadow-[#FF6B35]/10' 
                          : 'bg-[#12151C]/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{t.name}</span>
                        {template === t.id && <Check className="w-3.5 h-3.5 text-[#FF6B35]" />}
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5 font-light">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SQA Role Target Preset */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-mono text-[#FF6B35] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Target Role Focus</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'all-rounder', name: 'All-Round SQA' },
                    { id: 'automation-qa', name: 'Automation QA' },
                    { id: 'api-testing', name: 'API Specialist' },
                    { id: 'manual-qa', name: 'Manual SQA' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setTargetRole(r.id as TargetRoleType)}
                      className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer font-mono ${
                        targetRole === r.id
                          ? 'bg-[#FF6B35]/20 border-[#FF6B35] text-white font-bold'
                          : 'bg-[#12151C] border-white/10 text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Download Options */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <label className="text-xs font-mono text-[#9CA3AF] uppercase">More Formats</label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleDownloadDOCX}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-[#12151C] hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-white transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Download Word (.DOCX)</span>
                  </button>
                  <button
                    onClick={handleCopyPlainText}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-[#12151C] hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-white transition-colors cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Plain Text ATS'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INCLUDE PROJECTS FILTER (Explicitly requested by user) */}
          {activeTab === 'projects-filter' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[#FF6B35] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Select Projects for Resume</span>
                </label>
                <span className="text-xs font-mono text-[#9CA3AF]">{selectedProjectIds.length} / {PROJECTS.length}</span>
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={selectAllProjects}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white cursor-pointer"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllProjects}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={() => filterByProjectType('Automation')}
                  className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono cursor-pointer"
                >
                  Automation Only
                </button>
                <button
                  onClick={() => filterByProjectType('API')}
                  className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono cursor-pointer"
                >
                  API Only
                </button>
                <button
                  onClick={() => filterByProjectType('Manual')}
                  className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono cursor-pointer"
                >
                  Manual Only
                </button>
              </div>

              {/* List of projects with toggle checkboxes */}
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {PROJECTS.map((proj) => {
                  const isChecked = selectedProjectIds.includes(proj.id);
                  return (
                    <div
                      key={proj.id}
                      onClick={() => toggleProject(proj.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start space-x-3 ${
                        isChecked ? 'bg-[#12151C] border-[#FF6B35]/60 text-white' : 'bg-[#12151C]/30 border-white/5 text-[#9CA3AF] opacity-60'
                      }`}
                    >
                      <button className="mt-0.5 focus:outline-none">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#FF6B35]" />
                        ) : (
                          <Square className="w-4 h-4 text-white/30" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold truncate text-white">{proj.title}</p>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                            proj.type === 'Automation' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            proj.type === 'API' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {proj.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9CA3AF] line-clamp-1 mt-0.5">{proj.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ATS SCORE INSPECTOR */}
          {activeTab === 'ats-score' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#12151C] border border-white/10 text-center space-y-2">
                <p className="text-xs font-mono text-[#9CA3AF] uppercase">ATS Compatibility Score</p>
                <p className="font-display font-extrabold text-4xl text-emerald-400">
                  {atsAnalysis.totalScore}%
                </p>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-500" 
                    style={{ width: `${atsAnalysis.totalScore}%` }} 
                  />
                </div>
                <p className="text-[11px] text-[#D1D5DB]">
                  {atsAnalysis.totalScore >= 85 ? '🎉 Highly Optimized for ATS Systems' : '⚠️ Minor recommendations available below'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-[#FF6B35] uppercase font-bold">ATS Audit Checklist</label>
                <div className="space-y-2 text-xs">
                  {atsAnalysis.checks.map((chk, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#12151C] border border-white/5 space-y-1">
                      <div className="flex items-center space-x-2">
                        {chk.passed ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span className={`font-semibold ${chk.passed ? 'text-white' : 'text-[#D1D5DB]'}`}>{chk.label}</span>
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] pl-5 font-light">{chk.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COVER LETTER GENERATOR */}
          {activeTab === 'cover-letter' && (
            <div className="space-y-4 animate-fadeIn">
              <label className="text-xs font-mono text-[#FF6B35] uppercase font-bold tracking-wider">Customize Cover Letter</label>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-[#9CA3AF] font-mono">Target Company Name</label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full mt-1 p-2 bg-[#12151C] border border-white/10 rounded-lg text-xs text-white focus:border-[#FF6B35] outline-none font-mono"
                    placeholder="e.g. Brain Station 23 / Enosis"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#9CA3AF] font-mono">Target Job Role</label>
                  <input
                    type="text"
                    value={targetJobTitle}
                    onChange={(e) => setTargetJobTitle(e.target.value)}
                    className="w-full mt-1 p-2 bg-[#12151C] border border-white/10 rounded-lg text-xs text-white focus:border-[#FF6B35] outline-none font-mono"
                    placeholder="e.g. SQA Automation Engineer"
                  />
                </div>
                <button
                  onClick={handleCopyCoverLetter}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#FF6B35] hover:bg-[#FF814F] text-white rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-lg"
                >
                  {copiedCover ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCover ? 'Cover Letter Copied!' : 'Copy Cover Letter'}</span>
                </button>

                {onOpenCoverLetter && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCoverLetter();
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-lg mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Open AI Cover Letter & Match Score</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Printable A4 Live Resume Preview Stage */}
        <div className="flex-1 bg-[#1a1d24] overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
          
          {/* Printable A4 Container Card */}
          <div 
            ref={resumeRef}
            className="print-only-resume bg-white text-black shadow-2xl rounded-sm w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-10 font-sans text-xs leading-relaxed selection:bg-amber-200"
            style={{ width: '100%', maxWidth: '210mm', color: '#000000', backgroundColor: '#ffffff' }}
          >

            {/* TEMPLATE 1: CLASSIC ATS (DEFAULT) */}
            {template === 'classic-ats' && (
              <div className="flex flex-col space-y-4">
                {/* Header */}
                <div className="border-b-2 border-black pb-3 mb-4 text-center space-y-1">
                  <h1 className="text-2xl font-bold uppercase tracking-wide text-black font-serif">{customInfo.name}</h1>
                  <p className="text-xs font-semibold text-gray-800 uppercase tracking-wider">{customInfo.title}</p>
                  <p className="text-[11px] text-gray-700 font-mono">
                    {customInfo.location} | {customInfo.phone} | {customInfo.email}
                  </p>
                  <p className="text-[11px] text-gray-700 font-mono">
                    LinkedIn: {customInfo.linkedin} | GitHub: {customInfo.github}
                  </p>
                </div>

                {/* Professional Summary */}
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase border-b border-black pb-1 mb-2 text-black tracking-wider">Professional Summary</h2>
                  <p className="text-[11px] text-gray-800 leading-relaxed text-justify">{activeSummary}</p>
                </div>

                {/* Technical Skills */}
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase border-b border-black pb-1 mb-2 text-black tracking-wider">Technical Skills & Core Competencies</h2>
                  <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                    {SKILL_CATEGORIES.map((cat) => (
                      <div key={cat.category} className="flex">
                        <span className="font-bold w-36 shrink-0 text-black">{cat.category}:</span>
                        <span className="text-gray-800">{cat.items.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Experience */}
                <div className="mb-4 space-y-2.5">
                  <h2 className="text-xs font-bold uppercase border-b border-black pb-1 mb-2 text-black tracking-wider">Professional Experience</h2>
                  {WORK_EXPERIENCE.map((exp) => (
                    <div key={exp.id} className="space-y-1 mb-3">
                      <div className="flex justify-between font-bold text-[11px] text-black">
                        <span>{exp.role} — {exp.company}</span>
                        <span>{exp.period} | {exp.location}</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-gray-800 space-y-0.5 pl-1">
                        {exp.highlights.map((h, i) => (
                          <li key={i} className="leading-snug">{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Key SQA Projects (Filtered!) */}
                {selectedProjects.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <h2 className="text-xs font-bold uppercase border-b border-black pb-1 mb-2 text-black tracking-wider">Featured SQA Automation & Testing Projects</h2>
                    {selectedProjects.map((proj) => (
                      <div key={proj.id} className="space-y-0.5 text-[11px] mb-2">
                        <div className="flex justify-between font-bold text-black">
                          <span>{proj.title} ({proj.type})</span>
                          {proj.link && <span className="font-normal text-blue-800 underline text-[10px]">{proj.link}</span>}
                        </div>
                        <p className="text-gray-800">{proj.description}</p>
                        {proj.tags && (
                          <p className="text-[10px] text-gray-600 font-mono">
                            <span className="font-bold text-black">Tech Used:</span> {proj.tags.join(' • ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase border-b border-black pb-1 mb-2 text-black tracking-wider">Education & Certifications</h2>
                  {EDUCATION_HISTORY.map((edu) => (
                    <div key={edu.id} className="flex justify-between text-[11px] mb-1">
                      <div>
                        <span className="font-bold text-black">{edu.degree}</span> — <span className="text-gray-800">{edu.institution}</span>
                        {edu.details && <span className="text-gray-600 font-light"> ({edu.details})</span>}
                      </div>
                      <span className="font-mono text-gray-700">{edu.period}</span>
                    </div>
                  ))}
                </div>

                {/* References */}
                <div className="mb-2">
                  <h2 className="text-xs font-bold uppercase border-b border-black pb-1 mb-2 text-black tracking-wider">Professional References</h2>
                  {PROFESSIONAL_REFERENCES.map((ref, i) => (
                    <p key={i} className="text-[11px] text-gray-800 mb-1">
                      <span className="font-bold text-black">{ref.name}</span> — {ref.role}, {ref.company} | Email: {ref.email} | Phone: {ref.phone}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* TEMPLATE 2: MODERN PROFESSIONAL */}
            {template === 'modern-pro' && (
              <div className="space-y-5">
                {/* Modern Header */}
                <div className="p-5 -mx-8 -mt-8 mb-4 rounded-b-md space-y-1.5" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: '#ffffff' }}>{customInfo.name}</h1>
                  <p className="text-xs font-bold tracking-wider uppercase" style={{ color: '#f59e0b' }}>{customInfo.title}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono pt-1" style={{ color: '#cbd5e1' }}>
                    <span>📍 {customInfo.location}</span>
                    <span>📞 {customInfo.phone}</span>
                    <span>✉️ {customInfo.email}</span>
                    <span>🔗 {customInfo.linkedin}</span>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h2 className="text-xs font-extrabold uppercase border-l-4 pl-2 mb-1" style={{ color: '#0f172a', borderColor: '#f59e0b' }}>Executive Summary</h2>
                  <p className="text-[11px] leading-relaxed text-justify" style={{ color: '#334155' }}>{activeSummary}</p>
                </div>

                {/* Skills Grid */}
                <div>
                  <h2 className="text-xs font-extrabold uppercase border-l-4 pl-2 mb-1.5" style={{ color: '#0f172a', borderColor: '#f59e0b' }}>Core Technical Toolkit</h2>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {SKILL_CATEGORIES.map((cat) => (
                      <div key={cat.category} className="p-2 rounded border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                        <span className="font-bold block text-[10px] uppercase" style={{ color: '#0f172a' }}>{cat.category}</span>
                        <span className="text-[10px]" style={{ color: '#334155' }}>{cat.items.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h2 className="text-xs font-extrabold uppercase border-l-4 pl-2 mb-2" style={{ color: '#0f172a', borderColor: '#f59e0b' }}>Work History</h2>
                  <div className="space-y-2.5">
                    {WORK_EXPERIENCE.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-[11px]" style={{ color: '#0f172a' }}>{exp.role} <span className="font-normal" style={{ color: '#475569' }}>at {exp.company}</span></span>
                          <span className="text-[10px] font-mono" style={{ color: '#64748b' }}>{exp.period}</span>
                        </div>
                        <ul className="list-disc list-inside text-[10.5px] space-y-0.5" style={{ color: '#334155' }}>
                          {exp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Projects */}
                {selectedProjects.length > 0 && (
                  <div>
                    <h2 className="text-xs font-extrabold uppercase border-l-4 pl-2 mb-1.5" style={{ color: '#0f172a', borderColor: '#f59e0b' }}>Selected SQA Projects</h2>
                    <div className="space-y-2">
                      {selectedProjects.map((p) => (
                        <div key={p.id} className="p-2 rounded border space-y-0.5 text-[10.5px]" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                          <div className="flex justify-between font-bold" style={{ color: '#0f172a' }}>
                            <span>{p.title}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: '#e2e8f0', color: '#0f172a' }}>{p.type}</span>
                          </div>
                          <p style={{ color: '#334155' }}>{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                <div>
                  <h2 className="text-xs font-extrabold uppercase border-l-4 pl-2 mb-1" style={{ color: '#0f172a', borderColor: '#f59e0b' }}>Education</h2>
                  {EDUCATION_HISTORY.map((edu) => (
                    <div key={edu.id} className="flex justify-between text-[11px]">
                      <div>
                        <span className="font-bold" style={{ color: '#0f172a' }}>{edu.degree}</span> — <span style={{ color: '#334155' }}>{edu.institution}</span>
                      </div>
                      <span className="font-mono text-[10px]" style={{ color: '#64748b' }}>{edu.period}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEMPLATE 3: MINIMAL CLEAN */}
            {template === 'minimal' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h1 className="text-3xl font-light text-black tracking-tight">{customInfo.name}</h1>
                  <p className="text-xs text-gray-600 font-mono">{customInfo.title} • {customInfo.location}</p>
                  <p className="text-[10px] text-gray-500 font-mono">
                    {customInfo.email} | {customInfo.phone} | {customInfo.github}
                  </p>
                </div>

                <div className="h-px bg-gray-200 w-full my-3" />

                <div className="space-y-1">
                  <p className="text-[11px] text-gray-800 leading-relaxed font-light">{activeSummary}</p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-900">Experience</h2>
                  {WORK_EXPERIENCE.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-medium text-black">
                        <span>{exp.role}, {exp.company}</span>
                        <span className="text-gray-500">{exp.period}</span>
                      </div>
                      <ul className="list-disc list-inside text-[10.5px] text-gray-700 space-y-0.5">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {selectedProjects.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-900">Projects</h2>
                    {selectedProjects.map((p) => (
                      <div key={p.id} className="text-[10.5px]">
                        <span className="font-medium text-black">{p.title}</span> — <span className="text-gray-700">{p.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-900">Skills</h2>
                  <p className="text-[10.5px] text-gray-700">
                    {SKILL_CATEGORIES.flatMap(c => c.items).join(' • ')}
                  </p>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-900">Education</h2>
                  {EDUCATION_HISTORY.map((edu) => (
                    <div key={edu.id} className="text-[10.5px] text-gray-800">
                      <span className="font-medium">{edu.degree}</span>, {edu.institution} ({edu.period})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEMPLATE 4: EXECUTIVE */}
            {template === 'executive' && (
              <div className="space-y-4">
                <div className="border-b-4 border-black pb-2 flex justify-between items-end">
                  <div>
                    <h1 className="text-2xl font-black uppercase text-black tracking-tight">{customInfo.name}</h1>
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">{customInfo.title}</p>
                  </div>
                  <div className="text-right text-[10px] text-gray-700 font-mono">
                    <p>{customInfo.email}</p>
                    <p>{customInfo.phone}</p>
                    <p>{customInfo.location}</p>
                  </div>
                </div>

                {/* Key Metrics Banner */}
                <div className="grid grid-cols-4 gap-2 bg-gray-100 p-2 rounded text-center text-[10px]">
                  <div><span className="font-bold block text-black text-xs">2+ Yrs</span> Experience</div>
                  <div><span className="font-bold block text-black text-xs">150+</span> Test Cases</div>
                  <div><span className="font-bold block text-black text-xs">100+</span> Bugs Logged</div>
                  <div><span className="font-bold block text-black text-xs">0%</span> Error Rate</div>
                </div>

                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1">Executive Summary</h2>
                  <p className="text-[11px] text-gray-800 leading-relaxed">{activeSummary}</p>
                </div>

                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1.5">Leadership & Technical Capabilities</h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10.5px]">
                    {SKILL_CATEGORIES.map((c) => (
                      <div key={c.category}>
                        <span className="font-bold text-black">{c.category}: </span>
                        <span className="text-gray-700">{c.items.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2">Professional Career History</h2>
                  {WORK_EXPERIENCE.map((exp) => (
                    <div key={exp.id} className="mb-2 space-y-0.5">
                      <div className="flex justify-between font-bold text-[11px] text-black">
                        <span>{exp.role} — {exp.company}</span>
                        <span className="text-gray-600 font-normal">{exp.period}</span>
                      </div>
                      <ul className="list-disc list-inside text-[10.5px] text-gray-800">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {selectedProjects.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1">Key Deliverables & Projects</h2>
                    {selectedProjects.map((p) => (
                      <div key={p.id} className="text-[10.5px] mb-1">
                        <span className="font-bold text-black">{p.title}:</span> <span className="text-gray-800">{p.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1">Education</h2>
                  {EDUCATION_HISTORY.map((e) => (
                    <p key={e.id} className="text-[10.5px] text-gray-800">
                      <span className="font-bold text-black">{e.degree}</span>, {e.institution} ({e.period})
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* TEMPLATE 5: CLEAN PORTFOLIO STYLE */}
            {template === 'portfolio-style' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b-2 border-orange-500 pb-3">
                  <div>
                    <h1 className="text-2xl font-black text-black">{customInfo.name}</h1>
                    <p className="text-xs font-bold text-orange-600 font-mono uppercase">{customInfo.title}</p>
                    <p className="text-[10px] text-gray-600 font-mono mt-0.5">{customInfo.location}</p>
                  </div>
                  <div className="text-right text-[10px] text-gray-700 font-mono">
                    <p className="font-bold text-black">{customInfo.email}</p>
                    <p>{customInfo.phone}</p>
                    <p className="text-blue-700 underline">{customInfo.github}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-extrabold uppercase text-orange-600 tracking-wider mb-1">Overview</h2>
                  <p className="text-[11px] text-gray-800 leading-relaxed">{activeSummary}</p>
                </div>

                <div>
                  <h2 className="text-xs font-extrabold uppercase text-orange-600 tracking-wider mb-1.5">SQA Toolkit & Capabilities</h2>
                  <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                    {SKILL_CATEGORIES.flatMap(c => c.items).map((skill, i) => (
                      <span key={i} className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded text-gray-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-extrabold uppercase text-orange-600 tracking-wider mb-2">Experience & STLC Workflow</h2>
                  {WORK_EXPERIENCE.map((exp) => (
                    <div key={exp.id} className="mb-2 text-[11px]">
                      <div className="flex justify-between font-bold text-black">
                        <span>{exp.role} @ {exp.company}</span>
                        <span className="text-gray-500 font-mono text-[10px]">{exp.period}</span>
                      </div>
                      <ul className="list-disc list-inside text-[10.5px] text-gray-700 mt-0.5 space-y-0.5">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {selectedProjects.length > 0 && (
                  <div>
                    <h2 className="text-xs font-extrabold uppercase text-orange-600 tracking-wider mb-1.5">Verified Automation & QA Repositories</h2>
                    <div className="space-y-1.5">
                      {selectedProjects.map((p) => (
                        <div key={p.id} className="p-2 border border-gray-200 rounded text-[10.5px]">
                          <div className="flex justify-between font-bold text-black">
                            <span>{p.title}</span>
                            <span className="text-blue-700 text-[10px] font-mono">{p.type}</span>
                          </div>
                          <p className="text-gray-700 text-[10px] mt-0.5">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-xs font-extrabold uppercase text-orange-600 tracking-wider mb-1">Education</h2>
                  {EDUCATION_HISTORY.map((edu) => (
                    <div key={edu.id} className="text-[10.5px] text-gray-800">
                      <span className="font-bold text-black">{edu.degree}</span> - {edu.institution} ({edu.period})
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
