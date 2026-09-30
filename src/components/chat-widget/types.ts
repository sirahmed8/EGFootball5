export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  image?: string;
  chips?: string[];
  timestamp: number;
}

export interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  text: string;
  imageUrl?: string;
  replyTo?: { id: string; userName: string; text: string };
  reactions?: Record<string, string[]>;
  createdAt: unknown;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  lastMessage: string;
  unreadByStaff: boolean;
  unreadByUser: boolean;
  updatedAt: unknown;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'staff';
  text: string;
  createdAt: unknown;
}

export interface SpeechRecognitionResultAlternative {
  transcript: string;
}

export interface SpeechRecognitionResultItem {
  0: SpeechRecognitionResultAlternative;
  length: number;
}

export interface SpeechRecognitionEvent {
  results: ArrayLike<SpeechRecognitionResultItem>;
}

export interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((err: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export const EMOJI_LIST = ['❤️', '🔥', '👏', '😂', '👍', '⚽', '🏆', '🎯', '🚀', '💯'];
export const SLOW_MODE_SECONDS = 5;
