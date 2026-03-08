export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  image: string;
  videoUrl?: string;
  tags: string[];
  isSignature?: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  sortOrder: number;
}

export interface Business {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  slogan?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  hours?: string;
  plan: PlanType;
  planExpiresAt?: string;
  primaryColor: string;
  accentColor: string;
}

export type PlanType = 'free' | 'plan_a' | 'plan_b' | 'plan_c';

export interface PlanInfo {
  id: PlanType;
  name: string;
  videoLimit: number;
  price: number;
  description: string;
}

export type Tab = 'list' | 'feed' | 'info';

export interface User {
  id: string;
  email: string;
  name: string;
}
