import React from 'react';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="relative flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-2 overflow-hidden select-none">
      {/* Ambient background glow (emerald green radial gradient) */}
      <div 
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-60 dark:opacity-80 -z-10"
        aria-hidden="true"
      >
        <div className="w-[500px] sm:w-[700px] h-[350px] sm:h-[450px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[100px] transform -translate-y-8" />
      </div>

      {/* Main Hero Container */}
      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Main Catchy Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
          Understand The <span className="text-emerald-500 dark:text-emerald-400">Symptoms</span>
          <br />
          Prevent{' '}
          <span className="bg-gradient-to-r from-slate-900 via-slate-600 to-slate-400 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Escalation
          </span>
        </h1>

        {/* Subtitle / Value Proposition */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
          AI-powered health triage that assesses symptom urgency in real-time. Detect emergency red flags early, understand clinical risks, and know exactly what care to seek.
        </p>

        {/* Call to Action Button */}
        <div className="mt-7 sm:mt-8 flex items-center justify-center">
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-3 px-8 sm:px-9 py-3 sm:py-3.5 rounded-xl text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span>Get Started</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
