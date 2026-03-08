import React from 'react';
import { PlanType } from '../../types';
import { PLANS } from '../../lib/constants';

const PLAN_COLORS: Record<PlanType, string> = {
  free: 'bg-neutral-700 text-neutral-300',
  plan_a: 'bg-blue-900/50 text-blue-400 border border-blue-800',
  plan_b: 'bg-purple-900/50 text-purple-400 border border-purple-800',
  plan_c: 'bg-amber-900/50 text-amber-400 border border-amber-800',
};

export const PlanBadge: React.FC<{ plan: PlanType }> = ({ plan }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[plan]}`}>
      {PLANS[plan].name}
    </span>
  );
};
