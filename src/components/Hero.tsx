import { useState, useEffect, ChangeEvent } from 'react';
import { Mail, Phone, MapPin, Download, ArrowRight, Check, Copy, Code, FileText, Camera, Sliders, RotateCcw, Maximize2, ZoomIn, Upload, X } from 'lucide-react';
import { PERSONAL_INFO } from '../data';

const PRIMARY_AVATAR = '/src/assets/images/sabbir_avatar_1784300099360.jpg';
const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800';

interface HeroProps {
  onOpenResumeBuilder?: () => void;
  onOpenCoverLetter?: () => void;
}

export default function Hero({ onOpenResumeBuilder, onOpenCoverLetter }: HeroProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Photo Adjuster States (Persisted in localStorage)
  const [avatarSrc, setAvatarSrc] = useState<string>(() => {
    return localStorage.getItem('user_portfolio_avatar') || PERSONAL_INFO.avatar || PRIMARY_AVATAR;
  });
  const [fitMode, setFitMode] = useState<'cover-top' | 'cover-center' | 'contain' | 'custom'>(() => {
    return (localStorage.getItem('user_avatar_fit_mode') as any) || 'cover-top';
  });
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    return parseFloat(localStorage.getItem('user_avatar_zoom') || '100');
  });
  const [posY, setPosY] = useState<number>(() => {
    return parseFloat(localStorage.getItem('user_avatar_pos_y') || '15');
  });
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('user_portfolio_avatar', avatarSrc);
  }, [avatarSrc]);

  useEffect(() => {
    localStorage.setItem('user_avatar_fit_mode', fitMode);
  }, [fitMode]);

  useEffect(() => {
    localStorage.setItem('user_avatar_zoom', zoomLevel.toString());
  }, [zoomLevel]);

  useEffect(() => {
    localStorage.setItem('user_avatar_pos_y', posY.toString());
  }, [posY]);

  const handleResetPhotoSettings = () => {
    setAvatarSrc(PERSONAL_INFO.avatar || PRIMARY_AVATAR);
    setFitMode('cover-top');
    setZoomLevel(100);
    setPosY(15);
    localStorage.removeItem('user_portfolio_avatar');
    localStorage.removeItem('user_avatar_fit_mode');
    localStorage.removeItem('user_avatar_zoom');
    localStorage.removeItem('user_avatar_pos_y');
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Get dynamic image style based on adjustment mode
  const getImageStyle = () => {
    if (fitMode === 'contain') {
      return {
        objectFit: 'contain' as const,
        objectPosition: 'center',
        transform: `scale(${zoomLevel / 100})`,
      };
    }
    if (fitMode === 'cover-center') {
      return {
        objectFit: 'cover' as const,
        objectPosition: 'center',
        transform: `scale(${zoomLevel / 100})`,
      };
    }
    if (fitMode === 'cover-top') {
      return {
        objectFit: 'cover' as const,
        objectPosition: 'center top',
        transform: `scale(${zoomLevel / 100})`,
      };
    }
    // Custom fine-tuning
    return {
      objectFit: 'cover' as const,
      objectPosition: `center ${posY}%`,
      transform: `scale(${zoomLevel / 100})`,
    };
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const stats = [
    { value: '2+ Years', label: 'Experience' },
    { value: '150+', label: 'Test Cases' },
    { value: '100+', label: 'Bugs Reported' },
    { value: '20+', label: 'Automation Scripts' },
    { value: '95%', label: 'Defect Detection' }
  ];

  return (
    <section id="about" className="relative min-h-screen pt-32 lg:pt-36 pb-20 flex flex-col justify-center bg-[#0B0D12] text-[#F3F4F6] overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 flex flex-col space-y-6 sm:space-y-7">
            {/* Main Title Headlines */}
            <div className="space-y-3.5">
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08]">
                Hi, I'm <span className="text-[#FF6B35]">Sabbir Ahamed</span>
              </h1>
              <p className="font-display font-bold text-lg sm:text-2xl text-[#F3F4F6]">
                Software Quality Assurance Engineer
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="px-3 py-1 rounded-md bg-[#12151C] border border-white/10 text-xs font-mono text-[#D1D5DB] font-medium">
                  Manual QA
                </span>
                <span className="px-3 py-1 rounded-md bg-[#12151C] border border-white/10 text-xs font-mono text-[#D1D5DB] font-medium">
                  API Testing
                </span>
                <span className="px-3 py-1 rounded-md bg-[#12151C] border border-white/10 text-xs font-mono text-[#D1D5DB] font-medium">
                  Automation Testing (Basic & continuous learning)
                </span>
                <span className="px-3 py-1 rounded-md bg-[#12151C] border border-white/10 text-xs font-mono text-[#D1D5DB] font-medium">
                  Mobile Testing (Basic & continuous learning)
                </span>
              </div>
            </div>

            {/* Mobile Hero Profile Avatar (Shown cleanly centered on mobile screens < lg) */}
            <div className="block lg:hidden my-2 sm:my-3">
              <div className="relative w-full max-w-[220px] sm:max-w-[270px] md:max-w-[320px] mx-auto">
                <div className="glass-card rounded-2xl p-3 sm:p-4 border border-white/10 relative overflow-hidden flex flex-col items-center shadow-2xl">
                  {/* Lighting Halo */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#FF6B35]/20 rounded-full blur-2xl pointer-events-none" />

                  {/* Centered Profile Photo Frame */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/15 shadow-2xl group bg-[#12151C]">
                    <img
                      src={avatarSrc}
                      alt="Sabbir Ahamed - Software QA Engineer"
                      style={getImageStyle()}
                      className="w-full h-full transition-all duration-300 origin-center"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_AVATAR;
                      }}
                    />

                    {/* Adjust Photo Quick Button */}
                    <button
                      onClick={() => setIsAdjustModalOpen(true)}
                      className="absolute top-2.5 right-2.5 z-10 p-2 rounded-xl bg-black/70 backdrop-blur-md text-white/90 hover:text-white border border-white/20 hover:border-[#FF6B35] transition-all shadow-lg hover:scale-105 group cursor-pointer"
                      title="Adjust Photo / Change Image"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#FF6B35] group-hover:rotate-45 transition-transform" />
                    </button>

                    {/* Gradient Overlay at Bottom of Image */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/80 to-transparent p-2.5 flex flex-col justify-end pointer-events-none">
                      <p className="text-[9px] font-mono text-[#FF6B35] font-bold tracking-wider uppercase">SQA Engineer</p>
                      <h4 className="font-display font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">Sabbir Ahamed</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Summary Paragraph */}
            <div className="py-1 w-full">
              <p className="text-[#D1D5DB] text-base sm:text-lg font-light leading-[1.8] sm:leading-[1.85] w-full text-justify [text-justify:inter-word] tracking-normal">
                Software Quality Assurance Engineer with <span className="font-semibold text-white">2+ years of hands-on experience</span> in 
                <span className="font-semibold text-white"> Manual Testing, API Testing, and Web Application Testing</span>. 
                Experienced in designing comprehensive test cases, executing functional, regression, and exploratory testing, validating REST APIs, and reporting defects with a strong focus on software quality and user experience. Currently expanding my expertise in 
                <span className="font-semibold text-white"> UI Automation using Playwright (Python)</span>, 
                <span className="font-semibold text-white"> Mobile Testing</span>, and 
                <span className="font-semibold text-white"> CI/CD with GitHub Actions</span>. Passionate about continuous learning and leveraging modern QA tools and best practices to help teams deliver reliable, secure, and high-quality software.
              </p>
            </div>

            {/* Contact Pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <button
                onClick={handleCopyEmail}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[#12151C] border border-white/10 hover:border-[#FF6B35] text-[#D1D5DB] hover:text-white transition-all cursor-pointer"
                title="Click to copy email"
              >
                <Mail className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>{PERSONAL_INFO.email}</span>
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />}
              </button>

              <a
                href={`tel:${PERSONAL_INFO.phone}`}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[#12151C] border border-white/10 hover:border-[#FF6B35] text-[#D1D5DB] hover:text-white transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>{PERSONAL_INFO.phone}</span>
              </a>

              <div className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[#12151C] border border-white/10 hover:border-[#FF6B35] text-[#D1D5DB] transition-all">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>{PERSONAL_INFO.location}</span>
              </div>
            </div>

            {/* Action Buttons: Hire Me, Dynamic Resume Builder, View Projects */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {/* Primary: Hire Me */}
              <a
                href="#contact"
                className="shimmer inline-flex items-center space-x-2 bg-[#FF6B35] hover:bg-[#FF814F] text-white font-semibold text-sm px-6 py-3.5 rounded-full shadow-lg shadow-[#FF6B35]/25 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Mail className="w-4 h-4" />
                <span>Hire Me</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* Secondary: Dynamic Resume Builder */}
              <button
                onClick={onOpenResumeBuilder}
                className="inline-flex items-center space-x-2 bg-[#12151C] hover:bg-white/10 text-white border border-[#FF6B35]/40 hover:border-[#FF6B35] font-semibold text-sm px-5 py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-95 shadow-md cursor-pointer group"
              >
                <FileText className="w-4 h-4 text-[#FF6B35] group-hover:rotate-6 transition-transform" />
                <span>Resume Builder</span>
                <span className="text-[10px] bg-[#FF6B35]/20 text-[#FF6B35] px-2 py-0.5 rounded-full font-mono font-bold uppercase border border-[#FF6B35]/30">
                  ATS PDF
                </span>
              </button>

              {/* AI Cover Letter Generator */}
              <button
                onClick={onOpenCoverLetter}
                className="inline-flex items-center space-x-2 bg-[#12151C] hover:bg-white/10 text-white border border-blue-500/40 hover:border-blue-400 font-semibold text-sm px-5 py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-95 shadow-md cursor-pointer group"
              >
                <FileText className="w-4 h-4 text-blue-400 group-hover:rotate-6 transition-transform" />
                <span>AI Cover Letter</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-mono font-bold uppercase border border-blue-500/30">
                  Match Score
                </span>
              </button>

              {/* Third: View Projects */}
              <a
                href="#projects"
                className="inline-flex items-center space-x-2 bg-transparent hover:bg-white/[0.05] text-[#D1D5DB] hover:text-white border border-white/10 font-semibold text-sm px-5 py-3.5 rounded-full transition-all"
              >
                <Code className="w-4 h-4 text-[#9CA3AF]" />
                <span>View Projects</span>
              </a>
            </div>
          </div>

          {/* Right Column: Refined & Spacious Hero Profile Card (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-5 justify-end items-center">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-[430px]">
              {/* Main Glassmorphism Profile Card */}
              <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/10 relative overflow-hidden flex flex-col items-center">
                {/* Lighting Halo */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-56 bg-[#FF6B35]/20 rounded-full blur-3xl pointer-events-none" />

                {/* Centered Profile Photo Frame (~12-15% smaller with clean margin) */}
                <div className="relative w-full aspect-square sm:aspect-[4/4.2] rounded-2xl overflow-hidden border border-white/15 shadow-2xl group bg-[#12151C]">
                  <img
                    src={avatarSrc}
                    alt="Sabbir Ahamed - Software QA Engineer"
                    style={getImageStyle()}
                    className="w-full h-full transition-all duration-300 origin-center"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_AVATAR;
                    }}
                  />

                  {/* Adjust Photo Quick Button */}
                  <button
                    onClick={() => setIsAdjustModalOpen(true)}
                    className="absolute top-3 right-3 z-10 p-2.5 rounded-xl bg-black/70 backdrop-blur-md text-white/90 hover:text-white border border-white/20 hover:border-[#FF6B35] transition-all shadow-lg hover:scale-105 group cursor-pointer flex items-center space-x-1.5"
                    title="Adjust Photo / Change Image"
                  >
                    <Sliders className="w-4 h-4 text-[#FF6B35] group-hover:rotate-45 transition-transform" />
                    <span className="text-[11px] font-mono text-white font-medium hidden group-hover:inline">Adjust</span>
                  </button>

                  {/* Gradient Overlay at Bottom of Image */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/75 to-transparent p-4 flex flex-col justify-end pointer-events-none">
                    <p className="text-[11px] font-mono text-[#FF6B35] font-bold tracking-wider uppercase">SQA Engineer</p>
                    <h4 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">Sabbir Ahamed</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real & Manually Updated Statistics Banner */}
        <div className="mt-20 pt-8 border-t border-white/10 space-y-4">
          <div className="flex items-center">
            <span className="text-xs sm:text-sm font-mono text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-2 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>This section real and manually updated</span>
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-card glass-card-hover p-5 rounded-2xl border border-white/10 text-center space-y-1"
              >
                <p className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                  {stat.value.includes('%') ? <span className="text-[#FF6B35]">{stat.value}</span> : stat.value}
                </p>
                <p className="text-xs font-mono text-[#9CA3AF] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Interactive Photo Auto-Adjuster & Customizer Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#12151C] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#FF6B35]/20 text-[#FF6B35]">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-white">Avatar Photo Adjuster</h3>
                  <p className="text-xs text-[#9CA3AF] font-mono">Auto-adjust photo fit, crop, zoom, or change image</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Preview Frame */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#9CA3AF] uppercase block">Live Preview</label>
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-2xl overflow-hidden border-2 border-[#FF6B35]/50 bg-black/50 shadow-inner">
                <img
                  src={avatarSrc}
                  alt="Avatar Preview"
                  style={getImageStyle()}
                  className="w-full h-full transition-all duration-300 origin-center"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_AVATAR;
                  }}
                />
              </div>
            </div>

            {/* Adjustment Presets */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#9CA3AF] uppercase block">Automatic Fit Presets</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => { setFitMode('cover-top'); setZoomLevel(100); }}
                  className={`p-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                    fitMode === 'cover-top'
                      ? 'bg-[#FF6B35]/20 border-[#FF6B35] text-white font-bold'
                      : 'bg-white/[0.04] border-white/10 text-[#9CA3AF] hover:text-white hover:border-white/20'
                  }`}
                >
                  Top-Fit (Face)
                </button>
                <button
                  type="button"
                  onClick={() => { setFitMode('cover-center'); setZoomLevel(100); }}
                  className={`p-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                    fitMode === 'cover-center'
                      ? 'bg-[#FF6B35]/20 border-[#FF6B35] text-white font-bold'
                      : 'bg-white/[0.04] border-white/10 text-[#9CA3AF] hover:text-white hover:border-white/20'
                  }`}
                >
                  Center-Cover
                </button>
                <button
                  type="button"
                  onClick={() => { setFitMode('contain'); setZoomLevel(100); }}
                  className={`p-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                    fitMode === 'contain'
                      ? 'bg-[#FF6B35]/20 border-[#FF6B35] text-white font-bold'
                      : 'bg-white/[0.04] border-white/10 text-[#9CA3AF] hover:text-white hover:border-white/20'
                  }`}
                >
                  Fit Entire
                </button>
                <button
                  type="button"
                  onClick={() => setFitMode('custom')}
                  className={`p-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                    fitMode === 'custom'
                      ? 'bg-[#FF6B35]/20 border-[#FF6B35] text-white font-bold'
                      : 'bg-white/[0.04] border-white/10 text-[#9CA3AF] hover:text-white hover:border-white/20'
                  }`}
                >
                  Custom Sliders
                </button>
              </div>
            </div>

            {/* Custom Sliders for Fine Tuning */}
            {fitMode === 'custom' && (
              <div className="space-y-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono">
                {/* Zoom Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[#D1D5DB]">
                    <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5 text-[#FF6B35]" /> Zoom Level</span>
                    <span className="text-[#FF6B35] font-bold">{zoomLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="220"
                    step="5"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                    className="w-full accent-[#FF6B35] cursor-pointer"
                  />
                </div>

                {/* Vertical Position Y Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[#D1D5DB]">
                    <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-[#FF6B35]" /> Vertical Focus (Y)</span>
                    <span className="text-[#FF6B35] font-bold">{posY}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="2"
                    value={posY}
                    onChange={(e) => setPosY(parseFloat(e.target.value))}
                    className="w-full accent-[#FF6B35] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Change Image Options */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="text-xs font-mono text-[#9CA3AF] uppercase block">Upload or Change Photo URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={avatarSrc}
                  onChange={(e) => setAvatarSrc(e.target.value)}
                  placeholder="Paste Image URL or Path..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-white/30 focus:border-[#FF6B35] focus:outline-none font-mono"
                />
                <label className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer transition-colors flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4 text-[#FF6B35]" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleResetPhotoSettings}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF814F] text-white text-xs font-mono font-bold shadow-lg shadow-[#FF6B35]/25 transition-all cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}



