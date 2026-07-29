/**
 * -----------------------------------------
 * Project     : Sabbir Ahamed SQA Portfolio
 * Module      : Main React Application Component
 * Description : Core SPA component organizing navigation bar, Hero section, SQA Skills Grid,
 *               ATS Resume & Cover Letter callouts, Portfolio Projects, Experience Timeline,
 *               Career Vision, Education & References, and Contact Form.
 * Author      : Sabbir Ahamed
 * Last Updated: 2026-07-29
 * -----------------------------------------
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SkillsGrid from './components/SkillsGrid';
import Projects from './components/Projects';
import ExperienceTimeline from './components/ExperienceTimeline';
import CareerVision from './components/CareerVision';
import EducationAndReferences from './components/EducationAndReferences';
import Contact from './components/Contact';
import ResumeBuilderModal from './components/ResumeBuilderModal';
import CoverLetterGeneratorModal from './components/CoverLetterGeneratorModal';
import { ShieldCheck, FileText, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * Main application component layout wrapper
 *
 * @returns {React.ReactNode} The rendered portfolio application view
 */
export default function App(): React.ReactNode {
  const [dark, setDark] = useState<boolean>(true);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Force dark theme class on document element for consistent luxury dark styling
    document.documentElement.classList.add('dark');
  }, [dark]);

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F3F4F6] flex flex-col font-sans selection:bg-[#FF6B35] selection:text-white">
      {/* Navigation Header */}
      <Navbar 
        dark={dark} 
        setDark={setDark} 
        onOpenResumeBuilder={() => setIsResumeModalOpen(true)}
        onOpenCoverLetter={() => setIsCoverLetterModalOpen(true)}
      />

      {/* Main Page Sections */}
      <main className="flex-grow">
        <Hero 
          onOpenResumeBuilder={() => setIsResumeModalOpen(true)} 
          onOpenCoverLetter={() => setIsCoverLetterModalOpen(true)}
        />
        <SkillsGrid />
        
        {/* Dynamic Resume & Cover Letter Generator Callout Banner */}
        <section className="py-12 bg-gradient-to-r from-[#12151C] via-[#181C26] to-[#12151C] border-y border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI SQA Application Suite</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Need a Custom ATS Resume or AI Cover Letter?
              </h2>
              <p className="text-[#9CA3AF] text-sm max-w-2xl font-light leading-relaxed">
                Automatically compiles portfolio data into professional ATS resume templates and generates tailored AI cover letters complete with Job Description match score analysis & instant A4 PDF export.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-[#D1D5DB] font-mono">
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> 5 ATS Resume Templates</span>
                <span className="flex items-center gap-1 text-blue-400"><CheckCircle2 className="w-3.5 h-3.5" /> 🎯 Match Score Analysis</span>
                <span className="flex items-center gap-1 text-amber-400"><CheckCircle2 className="w-3.5 h-3.5" /> 1-Click PDF / Print</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => setIsResumeModalOpen(true)}
                className="shimmer inline-flex items-center space-x-2 bg-[#FF6B35] hover:bg-[#FF814F] text-white font-bold text-xs font-mono px-6 py-3.5 rounded-full shadow-xl shadow-[#FF6B35]/25 transition-all hover:scale-105 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Launch Resume Builder</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCoverLetterModalOpen(true)}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono px-6 py-3.5 rounded-full shadow-xl shadow-blue-600/25 transition-all hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Cover Letter Generator</span>
              </button>
            </div>
          </div>
        </section>

        <Projects />
        <ExperienceTimeline />
        <CareerVision />
        <EducationAndReferences />
        <Contact onOpenResumeBuilder={() => setIsResumeModalOpen(true)} />
      </main>

      {/* Resume Builder Modal */}
      <ResumeBuilderModal 
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onOpenCoverLetter={() => setIsCoverLetterModalOpen(true)}
      />

      {/* AI Cover Letter Generator Modal */}
      <CoverLetterGeneratorModal
        isOpen={isCoverLetterModalOpen}
        onClose={() => setIsCoverLetterModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-[#090A0E] border-t border-white/10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          {/* Copyright & Branding */}
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#FF6B35]/10 p-1.5 rounded-xl border border-[#FF6B35]/25">
              <ShieldCheck className="w-4 h-4 text-[#FF6B35]" />
            </div>
            <span className="font-display font-extrabold text-white text-base tracking-tight">
              Sabbir<span className="text-[#FF6B35]">.QA</span>
            </span>
            <span className="text-xs text-[#9CA3AF] font-mono pl-3 border-l border-white/10">
              © {new Date().getFullYear()} Sabbir Ahamed
            </span>
          </div>

          {/* Author Credits */}
          <p className="text-xs text-[#D1D5DB] font-sans font-light">
            Designed & Developed by <span className="text-white font-medium">Sabbir Ahamed</span> — Software Quality Assurance Engineer
          </p>
        </div>
      </footer>
    </div>
  );
}
