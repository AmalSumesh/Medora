export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  title?: string;
  aiSessionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PossibleCondition {
  name: string;
  evidence_ids?: string[];
}

export interface TriageSource {
  title: string;
  url?: string;
}

export interface TriageData {
  status: 'needs_more_information' | 'triage_complete' | 'follow_up' | string;
  risk_level?: 'unknown' | 'low' | 'moderate' | 'urgent' | 'emergency' | string;
  question_type?: string | null;
  next_question?: string | null;
  possible_conditions?: PossibleCondition[];
  recommendation?: string | null;
  reason?: string | null;
  evidence_ids?: string[];
  sources?: TriageSource[];
}

export interface MessageItem {
  _id?: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  updatedAt?: string;
  triage?: TriageData;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ConversationsResponse {
  message: string;
  conversations: Conversation[];
}

export interface ConversationDetailsResponse {
  conversation: Conversation;
  messages: MessageItem[];
}

export interface CreateConversationResponse {
  message: string;
  conversation: Conversation;
}

export interface SendMessageResponse {
  message: MessageItem;
  response: MessageItem;
  triage?: TriageData;
}

export interface ApiErrorResponse {
  message: string;
}

export const TOKEN_STORAGE_KEY = 'medora_token';
export const USER_STORAGE_KEY = 'medora_user';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

/**
 * Helper to handle fetch responses and extract meaningful error messages
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (data as ApiErrorResponse)?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}

/**
 * Return authorization headers for protected requests
 */
export function getAuthHeaders(token?: string | null): Record<string, string> {
  const activeToken = token || getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
}

/**
 * LocalStorage auth helpers
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser(): User | null {
  const saved = localStorage.getItem(USER_STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as User;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: User): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  return handleResponse<RegisterResponse>(response);
}

/**
 * Login an existing user
 * POST /api/auth/login
 */
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse<LoginResponse>(response);
}

/**
 * Fetch all conversations for current authenticated user
 * GET /api/conversations
 */
export async function fetchConversations(token?: string | null): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  const data = await handleResponse<ConversationsResponse>(response);
  return data.conversations || [];
}

/**
 * Create a new conversation
 * POST /api/conversations
 */
export async function createConversation(
  title?: string,
  token?: string | null
): Promise<Conversation> {
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ title: title || 'New Triage Consultation' }),
  });

  const data = await handleResponse<CreateConversationResponse>(response);
  return data.conversation;
}

/**
 * Fetch single conversation with its message history
 * GET /api/conversations/:conversationId
 */
export async function fetchConversationDetails(
  conversationId: string,
  token?: string | null
): Promise<ConversationDetailsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  return handleResponse<ConversationDetailsResponse>(response);
}

/**
 * Delete a conversation
 * DELETE /api/conversations/:conversationId
 */
export async function deleteConversation(
  conversationId: string,
  token?: string | null
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });

  await handleResponse<{ message: string }>(response);
}

/**
 * Send message to conversation
 * POST /api/conversations/:conversationId/messages
 */
export async function sendMessageToConversation(
  conversationId: string,
  content: string,
  token?: string | null
): Promise<SendMessageResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ content }),
    }
  );

  return handleResponse<SendMessageResponse>(response);
}
