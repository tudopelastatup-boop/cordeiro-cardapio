import { PLANS } from '../lib/constants';
import { PlanType } from '../types';

export function getVideoLimit(plan: PlanType): number {
  return PLANS[plan].videoLimit;
}

export function canUploadVideo(plan: PlanType, currentVideoCount: number): boolean {
  return currentVideoCount < getVideoLimit(plan);
}

export function getVideosRemaining(plan: PlanType, currentVideoCount: number): number {
  return Math.max(0, getVideoLimit(plan) - currentVideoCount);
}
