import React, { useState } from 'react';
import type { Conversation, User } from '../services/api';

interface SidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isCreating: boolean;
  isLoading: boolean;
  deletingId: string | null;
  user: User | null;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  isCreating,
  isLoading,
  deletingId,
  user,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const handleCreate = () => {
    onCreateConversation();
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        role="navigation"
        aria-label="Triage consultations"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/90 bg-white shadow-xl md:shadow-none transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Action: New Conversation Button & Mobile Close */}
        <div className="p-3 border-b border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            aria-label="Start new conversation"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 transition-all cursor-pointer"
          >
            {isCreating ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Creating Consultation...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>New Conversation</span>
              </>
            )}
          </button>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close consultations list"
              className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <div className="flex items-center justify-between px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Consultations</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {conversations.length}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-2 px-1 py-1" aria-label="Loading consultations">
              <div className="h-11 w-full rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-11 w-full rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-11 w-full rounded-xl bg-slate-100 animate-pulse" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-10 text-center">
              <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-700">No consultations yet</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Start your first triage session by clicking "New Conversation" above.
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = conv._id === selectedConversationId;
              const isDeleting = conv._id === deletingId;
              const isConfirming = conv._id === confirmDeleteId;

              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    onSelectConversation(conv._id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectConversation(conv._id);
                      if (onCloseMobile) onCloseMobile();
                    }
                  }}
                  aria-current={isSelected ? 'page' : undefined}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${isSelected
                      ? 'bg-teal-50 text-teal-950 font-medium border border-teal-200/80 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <svg
                      className={`h-4 w-4 shrink-0 transition-colors ${isSelected ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.502 49.188 49.188 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.27z"
                      />
                    </svg>
                    <div className="truncate">
                      <p className="truncate font-medium">{conv.title || 'Triage Session'}</p>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {formatDate(conv.updatedAt || conv.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Delete with Safety Confirmation */}
                  <div className="flex items-center shrink-0">
                    {isConfirming ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-rose-200 shadow-xs"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                            onDeleteConversation(conv._id);
                          }}
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                          title="Confirm deletion"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="rounded px-1 py-0.5 text-[10px] text-slate-500 hover:text-slate-700"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(conv._id);
                        }}
                        title="Delete consultation"
                        aria-label={`Delete consultation ${conv.title || ''}`}
                        className={`rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer ${isSelected ? 'opacity-100' : 'opacity-80 md:opacity-0 group-hover:opacity-100'
                          }`}
                      >
                        {isDeleting ? (
                          <svg className="h-3.5 w-3.5 animate-spin text-rose-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* User Profile / Logout Area */}
        <div className="border-t border-slate-200/80 p-3 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white uppercase shrink-0"
              >
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.name || 'Authorized User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'Authenticated'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Sign out of Medora"
              aria-label="Sign out"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
