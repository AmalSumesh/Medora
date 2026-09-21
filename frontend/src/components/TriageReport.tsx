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
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          bannerBg: 'bg-rose-50/80 border-rose-200',
          textColor: 'text-rose-950',
          accentColor: 'text-rose-700',
          dotColor: 'bg-rose-600',
          title: 'EMERGENCY TRIAGE',
          subtitle: 'Immediate emergency medical care is strongly advised',
        };
      case 'urgent':
        return {
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          bannerBg: 'bg-amber-50/80 border-amber-200',
          textColor: 'text-amber-950',
          accentColor: 'text-amber-700',
          dotColor: 'bg-amber-600',
          title: 'URGENT EVALUATION',
          subtitle: 'Prompt in-person medical evaluation is recommended within 12–24 hours',
        };
      case 'moderate':
        return {
          badgeBg: 'bg-sky-100 text-sky-900 border-sky-200',
          bannerBg: 'bg-sky-50/80 border-sky-200',
          textColor: 'text-sky-950',
          accentColor: 'text-sky-700',
          dotColor: 'bg-sky-600',
          title: 'MODERATE CONCERN',
          subtitle: 'Schedule a routine consultation with your primary physician',
        };
      case 'low':
        return {
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          bannerBg: 'bg-emerald-50/80 border-emerald-200',
          textColor: 'text-emerald-950',
          accentColor: 'text-emerald-700',
          dotColor: 'bg-emerald-600',
          title: 'LOW RISK',
          subtitle: 'Symptoms appear manageable with self-care and monitoring',
        };
      default:
        return {
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          bannerBg: 'bg-slate-50 border-slate-200',
          textColor: 'text-slate-900',
          accentColor: 'text-slate-600',
          dotColor: 'bg-slate-500',
          title: 'TRIAGE COMPLETE',
          subtitle: 'Clinical assessment summary based on reported symptoms',
        };
    }
  };

  const risk = getRiskConfig();

  return (
    <div className="mt-3.5 space-y-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 text-xs">
      {/* 1. Risk Level Banner */}
      <div className={`rounded-xl border p-3.5 ${risk.bannerBg}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${risk.dotColor} animate-pulse`} />
            <span className="font-bold tracking-tight text-xs uppercase text-slate-900">
              {risk.title}
            </span>
          </div>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${risk.badgeBg}`}
          >
            {triage.risk_level} Risk
          </span>
        </div>
        <p className="text-[11px] text-slate-600 font-medium">
          {risk.subtitle}
        </p>
      </div>

      {/* 2. Recommendation */}
      {triage.recommendation && (
        <div className="rounded-xl border border-teal-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-teal-900 mb-1.5">
            <svg
              className="h-4 w-4 text-teal-600 shrink-0"
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
          <p className="leading-relaxed text-slate-800 font-medium whitespace-pre-wrap">
            {triage.recommendation}
          </p>
        </div>
      )}

      {/* 3. Reason / Clinical Rationale */}
      {triage.reason && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1.5">
            <svg
              className="h-4 w-4 text-slate-500 shrink-0"
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
          <p className="leading-relaxed text-slate-600 whitespace-pre-wrap">
            {triage.reason}
          </p>
        </div>
      )}

      {/* 4. Possible Conditions & Evidence IDs */}
      {triage.possible_conditions && triage.possible_conditions.length > 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
            <svg
              className="h-4 w-4 text-teal-600 shrink-0"
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
                className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 border border-slate-100"
              >
                <span className="font-semibold text-slate-800">
                  {condition.name}
                </span>

                {/* Evidence IDs tag badges */}
                {condition.evidence_ids && condition.evidence_ids.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap shrink-0">
                    {condition.evidence_ids.map((evId, eIdx) => (
                      <span
                        key={eIdx}
                        className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200"
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
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
          <span className="block text-[11px] font-bold text-slate-700 mb-1">
            Associated Evidence IDs
          </span>
          <div className="flex flex-wrap gap-1">
            {triage.evidence_ids.map((id, index) => (
              <span
                key={index}
                className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-700 border border-slate-200"
              >
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 6. Medical Sources & References */}
      {triage.sources && triage.sources.length > 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
            <svg
              className="h-4 w-4 text-slate-500 shrink-0"
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
                className="flex items-center justify-between gap-2 text-[11px] text-slate-700 hover:text-teal-700 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-teal-600 font-bold">•</span>
                  <span className="truncate">{source.title}</span>
                </div>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-teal-600 hover:text-teal-800 hover:underline shrink-0 text-[10px] font-semibold"
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
      <p className="text-[10px] text-slate-400 leading-tight">
        Triage assessment synthesized by Medora RAG from medical context. If your symptoms worsen or red-flag signs occur, seek emergency care immediately.
      </p>
    </div>
  );
};
