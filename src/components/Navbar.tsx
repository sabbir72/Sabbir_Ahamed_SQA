import { useState, useEffect } from 'react';
import { ShieldCheck, Github, Linkedin, Mail, Menu, X, FileText, Download } from 'lucide-react';
import { PERSONAL_INFO } from '../data';

interface NavbarProps {
  dark?: boolean;
  setDark?: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenResumeBuilder?: () => void;
  onOpenCoverLetter?: () => void;
}

export default function Navbar({ onOpenResumeBuilder, onOpenCoverLetter }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setReadingProgress(Math.min(100, Math.round((window.scrollY / totalHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Mission & Vision', href: '#career-vision' },
    { label: 'Education', href: '#education' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div 
        className="progress-bar" 
        style={{ width: `${readingProgress}%` }} 
        role="progressbar" 
        aria-valuenow={readingProgress} 
        aria-valuemin={0} 
        aria-valuemax={100}
      />

      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0B0D12]/90 backdrop-blur-md shadow-2xl border-b border-white/10 py-3' 
          : 'bg-transparent border-b border-white/[0.06] py-4'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between" aria-label="Main navigation">
          {/* Brand Logo */}
          <a href="#about" className="flex items-center space-x-3 group">
            <div className="bg-[#FF6B35]/10 p-2 rounded-xl border border-[#FF6B35]/20 group-hover:border-[#FF6B35] transition-colors">
              <ShieldCheck className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight text-white">
                Sabbir<span className="text-[#FF6B35]">.QA</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links - STRICT UNIFIED LIST */}
          <ul className="hidden md:flex items-center space-x-7 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.label}>
                <a 
                  href={item.href} 
                  className="nav-link text-[#D1D5DB] hover:text-[#FF6B35] transition-colors py-1"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right Action Icons & Direct CTAs */}
          <div className="flex items-center space-x-3">
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center text-[#D1D5DB] hover:text-white bg-[#12151C] rounded-full border border-white/10 hover:border-[#FF6B35] transition-colors"
              title="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center text-[#D1D5DB] hover:text-white bg-[#12151C] rounded-full border border-white/10 hover:border-[#FF6B35] transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>

            {/* Hire Me Primary Button */}
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center space-x-1.5 shimmer bg-[#FF6B35] hover:bg-[#FF814F] text-white font-semibold px-5 py-2 rounded-full text-xs shadow-lg shadow-[#FF6B35]/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Hire Me</span>
            </a>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-white rounded-full bg-[#12151C] border border-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#FF6B35]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B0D12]/95 backdrop-blur-xl border-t border-white/10 px-6 py-6 space-y-3 text-sm font-medium text-[#D1D5DB] shadow-2xl animate-fadeIn">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:text-[#FF6B35] transition-colors border-b border-white/[0.04]"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4">
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 w-full py-3 shimmer bg-[#FF6B35] hover:bg-[#FF814F] text-white font-bold rounded-full text-xs shadow-lg"
              >
                <Mail className="w-4 h-4" />
                <span>Hire Me</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}




