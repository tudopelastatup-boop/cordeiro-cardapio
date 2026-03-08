import { PlanInfo, PlanType } from '../types';

export const PLANS: Record<PlanType, PlanInfo> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    videoLimit: 5,
    price: 0,
    description: 'Ideal para testar a plataforma',
  },
  plan_a: {
    id: 'plan_a',
    name: 'Plano A',
    videoLimit: 60,
    price: 99.90,
    description: 'Para negócios em crescimento',
  },
  plan_b: {
    id: 'plan_b',
    name: 'Plano B',
    videoLimit: 90,
    price: 149.90,
    description: 'Para negócios estabelecidos',
  },
  plan_c: {
    id: 'plan_c',
    name: 'Plano C',
    videoLimit: 150,
    price: 254.90,
    description: 'Para grandes operações',
  },
};

export const MAX_VIDEO_SIZE_MB = 5;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

export const VIDEO_ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
