export type PlanType = 'free' | 'plus' | 'business';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  language: string;
  plan: PlanType;
  monthlyAiUsage: number;
  usageResetDate: string;
  createdAt: string;
  updatedAt: string;
  isAdmin?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ConversationItem {
  conversationId: string;
  userId: string;
  title: string;
  category: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | 'job_application'
  | 'cv'
  | 'cover_letter'
  | 'landlord_message'
  | 'school_letter'
  | 'complaint'
  | 'business_advert'
  | 'invitation'
  | 'recommendation_letter'
  | 'general_message';

export interface DocumentItem {
  documentId: string;
  userId: string;
  type: DocumentType | string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseItem {
  expenseId: string;
  userId: string;
  category: string;
  amount: number; // In UGX
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfileItem {
  businessId: string;
  userId: string;
  businessName: string;
  category: string;
  location: string;
  description: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionItem {
  subscriptionId: string;
  userId: string;
  plan: PlanType;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  provider: 'momo_mtn' | 'airtel_money' | 'card' | 'free_tier';
  paymentReference: string;
  startDate: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackItem {
  feedbackId: string;
  userId: string;
  type: 'helpful' | 'not_helpful' | 'suggestion' | 'bug';
  message: string;
  feature: string;
  rating?: number;
  createdAt: string;
}

export interface UsageEventItem {
  eventId: string;
  userId: string;
  feature: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  createdAt: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degreeOrCertificate: string;
  fieldOfStudy?: string;
  startYear: string;
  endYear: string; // Or "Present"
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface ReferenceEntry {
  id: string;
  name: string;
  role: string;
  organization: string;
  phoneOrEmail: string;
}

export interface CVData {
  fullName: string;
  email: string;
  phone: string;
  location: string; // e.g., Kampala, Uganda
  professionalSummary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  languages: string[];
  references: ReferenceEntry[];
  certifications?: string[];
  templateStyle: 'classic' | 'modern' | 'executive';
}
