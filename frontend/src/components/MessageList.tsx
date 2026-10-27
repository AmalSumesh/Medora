import React, { useEffect, useRef } from 'react';
import type { MessageItem, User } from '../services/api';
import { Message } from './Message';

interface MessageListProps {
  messages: MessageItem[];
  isThinking: boolean;
  user: User | null;
  isLoading: boolean;
  onSelectPrompt?: (text: string) => void;
}

const SAMPLE_TRIAGE_PROMPTS = [
  'Persistent dry cough for 3 days with low-grade fever',
  'Sudden sharp abdominal pain on lower right side',
  'Throbbing headache with nausea and light sensitivity',
  'Skin rash and itchiness appearing after medication',
];

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isThinking,
  user,
  isLoading,
  onSelectPrompt,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (isLoading) {
    return (
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl mx-auto w-full"
        aria-busy="true"
        aria-label="Loading messages"
      >
        <div className="space-y-4 py-8">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
            <div className="h-16 w-3/4 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="flex items-start justify-end gap-3">
            <div className="h-12 w-1/2 rounded-2xl bg-teal-100 dark:bg-teal-950/60 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="log"
      aria-label="Consultation messages"
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl mx-auto w-full"
    >
      {messages.length === 0 ? (
        <div className="space-y-6 py-4 animate-in fade-in">
          {/* Welcome Card */}
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-3H8v-2h3V8h2v3h3v2h-3v3z" />
              </svg>
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-xs border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-teal-900 dark:text-teal-300">Medora Clinical AI</span>
                <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800">
                  Ready for Assessment
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                Hello{user?.name ? `, ${user.name}` : ''}. I'm your clinical triage assistant. You can describe your main symptoms, when they began, their severity, and any other relevant health history.
              </p>
              <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">To assist accurately, consider including:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400">
                  <li>Primary symptoms and their exact location</li>
                  <li>Duration and whether symptoms are worsening</li>
                  <li>Known allergies, existing conditions, or medications</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Prompt Suggestions */}
          {onSelectPrompt && (
            <div className="pl-12">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Sample symptom inquiries
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_TRIAGE_PROMPTS.map((promptText, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSelectPrompt(promptText)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-950/40 hover:text-teal-900 dark:hover:text-teal-200 shadow-2xs transition-all cursor-pointer text-left"
                  >
                    "{promptText}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        messages.map((msg, index) => (
          <Message key={msg._id || index} message={msg} user={user} />
        ))
      )}

      {/* "Medora is thinking..." loading indicator */}
      {isThinking && (
        <div
          aria-live="polite"
          aria-label="Medora is thinking..."
          className="flex items-start gap-3 animate-in fade-in"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-3H8v-2h3V8h2v3h3v2h-3v3z" />
            </svg>
          </div>
          <div className="rounded-2xl rounded-tl-xs border border-teal-100 dark:border-teal-900/60 bg-teal-50/80 dark:bg-teal-950/40 px-4 py-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-teal-900 dark:text-teal-300">
                Medora is thinking...
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce"></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
};
