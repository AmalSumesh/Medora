import { useState, useEffect, useCallback } from 'react';
import type { Conversation, MessageItem } from '../services/api';
import {
  fetchConversations,
  fetchConversationDetails,
  createConversation,
  deleteConversation,
  sendMessageToConversation,
} from '../services/api';
import { useAuth } from './useAuth';

export function useChat() {
  const { token, isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load conversations on mount or when token becomes available
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let isMounted = true;

    void (async () => {
      setIsLoadingConversations(true);
      setError(null);
      try {
        const data = await fetchConversations(token);
        if (!isMounted) return;
        setConversations(data);

        if (data.length > 0 && !selectedConversationId) {
          setSelectedConversationId(data[0]._id);
        }
      } catch (err) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to load conversations';
        setError(msg);
      } finally {
        if (isMounted) {
          setIsLoadingConversations(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token, selectedConversationId]);

  // When selectedConversationId changes, load messages
  useEffect(() => {
    if (!selectedConversationId || !token) return;

    let isMounted = true;

    void (async () => {
      setIsLoadingMessages(true);
      try {
        const details = await fetchConversationDetails(selectedConversationId, token);
        if (!isMounted) return;
        setCurrentConversation(details.conversation);
        const msgs = details.messages || [];

        // Check if there is stored triage details for this conversation
        try {
          const cachedTriage = localStorage.getItem(`medora_triage_${selectedConversationId}`);
          if (cachedTriage && msgs.length > 0) {
            const parsedTriage = JSON.parse(cachedTriage);
            for (let i = msgs.length - 1; i >= 0; i--) {
              if (msgs[i].role === 'assistant') {
                msgs[i].triage = parsedTriage;
                break;
              }
            }
          }
        } catch {
          // Ignore cache errors
        }

        setMessages(msgs);
      } catch (err) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to load conversation messages';
        setError(msg);
      } finally {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedConversationId, token]);

  /**
   * Select conversation
   */
  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
  }, []);

  /**
   * Create a new conversation, prepend to list and select it
   */
  const handleCreateConversation = useCallback(
    async (title?: string) => {
      if (!token) return null;
      setIsCreatingConversation(true);
      setError(null);

      try {
        const newConv = await createConversation(title, token);
        setConversations((prev) => [newConv, ...prev]);
        setSelectedConversationId(newConv._id);
        setCurrentConversation(newConv);
        setMessages([]); // Fresh empty conversation state
        return newConv;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create conversation';
        setError(msg);
        return null;
      } finally {
        setIsCreatingConversation(false);
      }
    },
    [token]
  );

  /**
   * Delete a conversation
   */
  const handleDeleteConversation = useCallback(
    async (conversationId: string) => {
      if (!token) return;
      setDeletingId(conversationId);
      setError(null);

      try {
        await deleteConversation(conversationId, token);

        setConversations((prev) => {
          const updated = prev.filter((c) => c._id !== conversationId);

          if (selectedConversationId === conversationId) {
            if (updated.length > 0) {
              const nextId = updated[0]._id;
              setSelectedConversationId(nextId);
            } else {
              setSelectedConversationId(null);
              setCurrentConversation(null);
              setMessages([]);
            }
          }

          return updated;
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete conversation';
        setError(msg);
      } finally {
        setDeletingId(null);
      }
    },
    [token, selectedConversationId]
  );

  /**
   * Send a message to the currently selected conversation
   */
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!token || !selectedConversationId || !content.trim()) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: MessageItem = {
        _id: tempId,
        conversationId: selectedConversationId,
        role: 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      // 1. Immediately display the user's message
      setMessages((prev) => [...prev, optimisticMsg]);
      // 2. Disable the send button & 3. Show "Medora is thinking..."
      setIsThinking(true);
      setError(null);

      try {
        // 4. Call POST /api/conversations/:conversationId/messages
        const result = await sendMessageToConversation(
          selectedConversationId,
          content.trim(),
          token
        );

        // 5. Display the assistant response with triage details when the API returns
        const assistantMsg: MessageItem = {
          ...result.response,
          triage: result.triage,
        };

        if (result.triage && result.triage.status === 'triage_complete') {
          try {
            localStorage.setItem(
              `medora_triage_${selectedConversationId}`,
              JSON.stringify(result.triage)
            );
          } catch {
            // Ignore cache error
          }
        }

        setMessages((prev) => {
          const withoutOptimistic = prev.filter((m) => m._id !== tempId);
          return [...withoutOptimistic, result.message, assistantMsg];
        });
      } catch (err) {
        // 6. Handle errors gracefully
        const msg = err instanceof Error ? err.message : 'Failed to send message';
        setError(msg);
      } finally {
        setIsThinking(false);
      }
    },
    [token, selectedConversationId]
  );

  return {
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
    clearError: () => setError(null),
    selectConversation,
    handleCreateConversation,
    handleDeleteConversation,
    handleSendMessage,
    setMessages,
  };
}
