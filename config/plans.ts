import { PlanType } from '@/types';

export interface PlanConfig {
  id: PlanType;
  name: string;
  tagline: string;
  priceUGX: number;
  priceUSD: number;
  period: string;
  aiLimit: number;
  badge?: string;
  features: string[];
  isPopular?: boolean;
}

export const FREE_AI_LIMIT = 10;
export const PLUS_AI_LIMIT = 200;
export const BUSINESS_AI_LIMIT = 1000;

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Mpa Free',
    tagline: 'Basic help for individuals starting out',
    priceUGX: 0,
    priceUSD: 0,
    period: 'forever',
    aiLimit: FREE_AI_LIMIT,
    features: [
      '10 AI requests per month',
      'All 5 Core Modules',
      'English & Luganda translation',
      'Basic document generator',
      'Standard CV builder',
      'Offline PWA access for cached items',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Mpa Plus',
    tagline: 'Ideal for job seekers, students and active workers',
    priceUGX: 15000,
    priceUSD: 4,
    period: 'month',
    aiLimit: PLUS_AI_LIMIT,
    badge: 'Most Popular',
    isPopular: true,
    features: [
      '200 AI requests per month',
      'Priority fast response generation',
      'Full CV Builder with all 3 layouts',
      'Job Interview practice with AI feedback',
      'Unlimited saved documents and budgets',
      'No watermarks on exported letters & CVs',
      'Mobile Money (MTN / Airtel) support',
    ],
  },
  business: {
    id: 'business',
    name: 'Mpa Business',
    tagline: 'Tailored for Ugandan dukas, startups & enterprises',
    priceUGX: 45000,
    priceUSD: 12,
    period: 'month',
    aiLimit: BUSINESS_AI_LIMIT,
    badge: 'Best for Shops',
    features: [
      '1,000 AI requests per month',
      'Multiple business profile management',
      '7-day & 30-day marketing calendars',
      'WhatsApp ad generator with direct copy',
      'TikTok & Facebook promotion scripts',
      'Customer reply & complaint resolver',
      'Highest priority processing',
      'Direct WhatsApp beta support',
    ],
  },
};

export function getLimitForPlan(plan: PlanType): number {
  switch (plan) {
    case 'plus':
      return PLUS_AI_LIMIT;
    case 'business':
      return BUSINESS_AI_LIMIT;
    case 'free':
    default:
      return FREE_AI_LIMIT;
  }
}

export function formatUGX(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(amount);
}
