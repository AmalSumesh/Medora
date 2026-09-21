import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { Sidebar } from '../components/Sidebar';
import { MessageList } from '../components/MessageList';
import { ChatInput } from '../components/ChatInput';
import { NewConversationModal } from '../components/NewConversationModal';

export const Chat: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    conversations,
    selectedConversationId,
    currentConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isCreatingConversation,
    isThinking,
    deletingId,
    error,
    clearError,
    selectConversation,
    handleCreateConversation,
    handleDeleteConversation,
    handleSendMessage,
  } = useChat();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const handleConfirmCreate = async (title: string) => {
    const newConv = await handleCreateConversation(title);
    if (newConv) {
      setIsNewModalOpen(false);
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full overflow-hidden bg-slate-50">
      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={selectConversation}
        onCreateConversation={() => setIsNewModalOpen(true)}
        onDeleteConversation={handleDeleteConversation}
        isCreating={isCreatingConversation}
        isLoading={isLoadingConversations}
        deletingId={deletingId}
        user={user}
        onLogout={logout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50 min-w-0">
        {/* Chat Area Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile sidebar toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open triage consultations drawer"
              aria-expanded={isMobileSidebarOpen}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-3H8v-2h3V8h2v3h3v2h-3v3z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-slate-900 truncate">
                {currentConversation?.title || 'Medora Clinical Assistant'}
              </h2>
              <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium truncate">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                AI Triage Active
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block shrink-0">
            Evidence-based medical guidance
          </div>
        </div>

        {/* Accessible Error Alert Banner */}
        {error && (
          <div
            role="alert"
            className="mx-4 mt-3 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-800 sm:mx-6 shrink-0 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              aria-label="Dismiss error"
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Message Container / Content Area */}
        {!selectedConversationId ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 shadow-xs">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800">No Consultation Selected</h3>
            <p className="mt-1.5 max-w-sm text-xs text-slate-500">
              Select an ongoing triage session from the sidebar or start a new clinical consultation.
            </p>
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              disabled={isCreatingConversation}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Start New Consultation</span>
            </button>
          </div>
        ) : (
          <MessageList
            messages={messages}
            isThinking={isThinking}
            user={user}
            isLoading={isLoadingMessages}
            onSelectPrompt={(promptText) => handleSendMessage(promptText)}
          />
        )}

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={!selectedConversationId}
          isSending={isThinking}
          placeholder={
            selectedConversationId
              ? 'Describe symptoms, duration, or clinical questions...'
              : 'Select or start a consultation to chat...'
          }
        />
      </main>

      {/* New Conversation Title Modal */}
      <NewConversationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={handleConfirmCreate}
        isCreating={isCreatingConversation}
      />
    </div>
  );
};
