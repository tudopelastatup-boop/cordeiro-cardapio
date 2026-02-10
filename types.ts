export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image: string; // Fallback image
  video?: string; // Video URL from Pexels
  tags: string[];
  isSignature?: boolean;
}

export interface RestaurantInfo {
  name: string;
  slogan: string;
  coverImage: string;
  logo: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  hours: string;
}

export type Tab = 'list' | 'feed' | 'info';