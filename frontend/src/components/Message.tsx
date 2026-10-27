import React from 'react';
import type { MessageItem, User } from '../services/api';
import { TriageReport } from './TriageReport';

interface MessageProps {
  message: MessageItem;
  user: User | null;
}

export const Message: React.FC<MessageProps> = ({ message, user }) => {
  const isUser = message.role === 'user';
  const isTriageComplete =
    !isUser && message.triage && message.triage.status === 'triage_complete';

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`flex items-start gap-3 transition-opacity ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-3H8v-2h3V8h2v3h3v2h-3v3z" />
          </svg>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 shadow-xs text-xs leading-relaxed ${
          isUser
            ? 'rounded-tr-xs bg-teal-600 text-white shadow-teal-700/10'
            : isTriageComplete
            ? 'rounded-tl-xs border border-teal-200/90 dark:border-teal-800/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm'
            : 'rounded-tl-xs border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100'
        }`}
      >
        {!isUser && (
          <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-teal-900 dark:text-teal-300">Medora AI</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border ${
                  isTriageComplete
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isTriageComplete ? 'Triage Assessment Complete' : 'Clinical Triage'}
              </span>
            </div>
            {message.createdAt && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {formatTime(message.createdAt)}
              </span>
            )}
          </div>
        )}

        <div className="whitespace-pre-wrap break-words">{message.content}</div>

        {/* Render full triage details when triage is complete */}
        {isTriageComplete && message.triage && (
          <TriageReport triage={message.triage} />
        )}

        {isUser && message.createdAt && (
          <div className="mt-1 text-right text-[10px] text-teal-200/80">
            {formatTime(message.createdAt)}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white text-xs font-bold uppercase shadow-xs">
          {user?.name ? user.name.charAt(0) : 'U'}
        </div>
      )}
    </div>
  );
};
