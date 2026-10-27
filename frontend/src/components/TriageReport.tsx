import React from 'react';
import type { TriageData } from '../services/api';

interface TriageReportProps {
  triage: TriageData;
}

export const TriageReport: React.FC<TriageReportProps> = ({ triage }) => {
  const riskLevel = (triage.risk_level || 'unknown').toLowerCase();

  // Color scheme & icons according to risk level
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'emergency':
        return {
          badgeBg: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800',
          bannerBg: 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
          textColor: 'text-rose-950 dark:text-rose-100',
          accentColor: 'text-rose-700 dark:text-rose-300',
          dotColor: 'bg-rose-600 dark:bg-rose-500',
          title: 'EMERGENCY TRIAGE',
          subtitle: 'Immediate emergency medical care is strongly advised',
        };
      case 'urgent':
        return {
          badgeBg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800',
          bannerBg: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
          textColor: 'text-amber-950 dark:text-amber-100',
          accentColor: 'text-amber-700 dark:text-amber-300',
          dotColor: 'bg-amber-600 dark:bg-amber-500',
          title: 'URGENT EVALUATION',
          subtitle: 'Prompt in-person medical evaluation is recommended within 12–24 hours',
        };
      case 'moderate':
        return {
          badgeBg: 'bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 border-sky-200 dark:border-sky-800',
          bannerBg: 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/60',
          textColor: 'text-sky-950 dark:text-sky-100',
          accentColor: 'text-sky-700 dark:text-sky-300',
          dotColor: 'bg-sky-600 dark:bg-sky-500',
          title: 'MODERATE CONCERN',
          subtitle: 'Schedule a routine consultation with your primary physician',
        };
      case 'low':
        return {
          badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
          bannerBg: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60',
          textColor: 'text-emerald-950 dark:text-emerald-100',
          accentColor: 'text-emerald-700 dark:text-emerald-300',
          dotColor: 'bg-emerald-600 dark:bg-emerald-500',
          title: 'LOW RISK',
          subtitle: 'Symptoms appear manageable with self-care and monitoring',
        };
      default:
        return {
          badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
          bannerBg: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
          textColor: 'text-slate-900 dark:text-slate-100',
          accentColor: 'text-slate-600 dark:text-slate-400',
          dotColor: 'bg-slate-500 dark:bg-slate-400',
          title: 'TRIAGE COMPLETE',
          subtitle: 'Clinical assessment summary based on reported symptoms',
        };
    }
  };

  const risk = getRiskConfig();

  return (
    <div className="mt-3.5 space-y-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 text-xs">
      {/* 1. Risk Level Banner */}
      <div className={`rounded-xl border p-3.5 ${risk.bannerBg}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${risk.dotColor} animate-pulse`} />
            <span className="font-bold tracking-tight text-xs uppercase text-slate-900 dark:text-slate-100">
              {risk.title}
            </span>
          </div>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${risk.badgeBg}`}
          >
            {triage.risk_level} Risk
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
          {risk.subtitle}
        </p>
      </div>

      {/* 2. Recommendation */}
      {triage.recommendation && (
        <div className="rounded-xl border border-teal-200/80 dark:border-teal-900/60 bg-white dark:bg-slate-900 p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-teal-900 dark:text-teal-300 mb-1.5">
            <svg
              className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Primary Recommendation</span>
          </div>
          <p className="leading-relaxed text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap">
            {triage.recommendation}
          </p>
        </div>
      )}

      {/* 3. Reason / Clinical Rationale */}
      {triage.reason && (
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            <svg
              className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <span>Clinical Rationale</span>
          </div>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
            {triage.reason}
          </p>
        </div>
      )}

      {/* 4. Possible Conditions & Evidence IDs */}
      {triage.possible_conditions && triage.possible_conditions.length > 0 && (
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-2">
            <svg
              className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
            <span>Possible Conditions Considered</span>
          </div>

          <div className="space-y-2">
            {triage.possible_conditions.map((condition, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-100 dark:border-slate-700/60"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {condition.name}
                </span>

                {/* Evidence IDs tag badges */}
                {condition.evidence_ids && condition.evidence_ids.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap shrink-0">
                    {condition.evidence_ids.map((evId, eIdx) => (
                      <span
                        key={eIdx}
                        className="rounded bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                      >
                        {evId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Global Evidence IDs (if provided separately) */}
      {triage.evidence_ids && triage.evidence_ids.length > 0 && (
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
          <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Associated Evidence IDs
          </span>
          <div className="flex flex-wrap gap-1">
            {triage.evidence_ids.map((id, index) => (
              <span
                key={index}
                className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 6. Medical Sources & References */}
      {triage.sources && triage.sources.length > 0 && (
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-2">
            <svg
              className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            <span>Verified Medical Sources (MedlinePlus RAG)</span>
          </div>

          <ul className="space-y-1.5">
            {triage.sources.map((source, sIdx) => (
              <li
                key={sIdx}
                className="flex items-center justify-between gap-2 text-[11px] text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                  <span className="truncate">{source.title}</span>
                </div>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline shrink-0 text-[10px] font-semibold"
                  >
                    <span>Read source</span>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety Disclaimer */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
        Triage assessment synthesized by Medora RAG from medical context. If your symptoms worsen or red-flag signs occur, seek emergency care immediately.
      </p>
    </div>
  );
};
