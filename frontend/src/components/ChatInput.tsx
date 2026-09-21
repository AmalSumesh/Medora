import React, { useState, useRef } from 'react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled: boolean;
  isSending: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled,
  isSending,
  placeholder = 'Describe symptoms, duration, or clinical questions...',
}) => {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || disabled || isSending) return;

    onSendMessage(trimmed);
    setContent('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="border-t border-slate-200/80 bg-white p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={disabled || isSending}
            placeholder={placeholder}
            aria-label="Describe your health symptoms or questions"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-4 pr-24 text-sm sm:text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          />

          <button
            type="submit"
            disabled={disabled || isSending || !content.trim()}
            aria-label={isSending ? 'Sending message...' : 'Send message'}
            className="absolute right-2 flex min-h-[34px] items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 transition-all cursor-pointer"
          >
            {isSending ? (
              <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
            <span>Send</span>
          </button>
        </form>

        <p className="mt-2 text-center text-[10px] sm:text-[11px] text-slate-400 select-none">
          Medora is an AI triage tool for clinical assistance and symptom evaluation. In life-threatening emergencies, call local emergency services immediately.
        </p>
      </div>
    </div>
  );
};
