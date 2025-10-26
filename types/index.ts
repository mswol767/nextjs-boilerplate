// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  start: Date;
}

export interface EventComputed {
  events: Event[];
  upcoming: Event[];
  past: Event[];
  shown: Event[];
}

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface WaitlistFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  town: string;
  state: string;
  captchaToken?: string;
}

// Waitlist types
export interface WaitEntry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  town?: string;
  state?: string;
  message?: string;
  createdAt: string;
}

// File types
export interface FileEntry {
  name: string;
  url: string;
  size: number;
  createdAt: string;
  fallback?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  ok: boolean;
  error?: string;
  data?: T;
}

export interface ContactResponse extends ApiResponse {
  mailed?: boolean;
  fallback?: {
    mailto: string;
  };
}

export interface WaitlistResponse extends ApiResponse {
  entry?: WaitEntry;
  persistedTo?: string;
  fallback?: boolean;
  sheetAppended?: boolean;
  mailed?: boolean;
}

// Navigation types
export type SectionId = "home" | "about" | "events" | "membership" | "contact" | "members";

export interface NavigationState {
  menuOpen: boolean;
  activeSection: SectionId;
  manualNav: boolean;
}
