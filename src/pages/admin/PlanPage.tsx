import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PLANS } from '../../lib/constants';
import { PlanType } from '../../types';
import { PlanBadge } from '../../components/admin/PlanBadge';
import { useMenuData } from '../../hooks/useMenuData';

export const PlanPage: React.FC = () => {
  const { business, changePlan } = useAuth();
  const currentPlan = business?.plan || 'free';
  const { videoCount, isLoading } = useMenuData(business?.id);
  const planInfo = PLANS[currentPlan];
  const [changingTo, setChangingTo] = useState<PlanType | null>(null);
  const [successPlan, setSuccessPlan] = useState<PlanType | null>(null);

  const allPlans: PlanType[] = ['free', 'plan_a', 'plan_b', 'plan_c'];

  const handleChangePlan = async (plan: PlanType) => {
    if (plan === currentPlan) return;
    setChangingTo(plan);
    try {
      await changePlan(plan);
      setSuccessPlan(plan);
      setTimeout(() => setSuccessPlan(null), 3000);
    } catch (err) {
      console.error('Erro ao trocar plano:', err);
    } finally {
      setChangingTo(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-white mb-1">Meu Plano</h1>
        <p className="text-neutral-400 text-sm">Gerencie sua assinatura</p>
      </div>

      {/* Success message */}
      {successPlan && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <span className="material-icons-round text-green-400">check_circle</span>
          <p className="text-sm text-green-300">
            Plano alterado para <strong>{PLANS[successPlan].name}</strong> com sucesso!
          </p>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-medium text-white">Plano atual</h2>
              <PlanBadge plan={currentPlan} />
            </div>
            <p className="text-sm text-neutral-400">{planInfo.description}</p>
          </div>
          <div className="text-right">
            {planInfo.price === 0 ? (
              <p className="text-2xl font-bold text-white">Grátis</p>
            ) : (
              <p className="text-2xl font-bold text-white">
                R$ {planInfo.price.toFixed(2).replace('.', ',')}
                <span className="text-sm text-neutral-400 font-normal">/mês</span>
              </p>
            )}
          </div>
        </div>

        {/* Usage Bar */}
        <div className="mt-6 p-4 bg-neutral-800/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-300">Vídeos utilizados</p>
            <p className="text-sm text-white font-medium">
              {isLoading ? '–' : videoCount} / {planInfo.videoLimit}
            </p>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-3">
            <div
              className={`rounded-full h-3 transition-all ${
                videoCount / planInfo.videoLimit > 0.9 ? 'bg-red-500' : 'bg-white'
              }`}
              style={{ width: isLoading ? '0%' : `${Math.min(100, (videoCount / planInfo.videoLimit) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            {planInfo.videoLimit - videoCount > 0
              ? `Você ainda pode adicionar ${planInfo.videoLimit - videoCount} vídeos`
              : 'Limite atingido. Faça upgrade para adicionar mais vídeos.'
            }
          </p>
        </div>
      </div>

      {/* Plans Comparison */}
      <div>
        <h2 className="text-lg font-medium text-white mb-6">Todos os planos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {allPlans.map((key) => {
            const plan = PLANS[key];
            const isCurrent = key === currentPlan;
            const isUpgrade = allPlans.indexOf(key) > allPlans.indexOf(currentPlan);
            const isDowngrade = allPlans.indexOf(key) < allPlans.indexOf(currentPlan);
            const isPopular = key === 'plan_b';
            const isChanging = changingTo === key;

            return (
              <div
                key={key}
                className={`relative p-4 sm:p-6 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-white/5 border-white/20'
                    : isPopular
                      ? 'bg-neutral-900/50 border-neutral-600'
                      : 'bg-neutral-900/50 border-white/5'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Atual
                  </div>
                )}
                {isPopular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Popular
                  </div>
                )}

                <h3 className="text-base font-medium text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-neutral-500 mb-4 min-h-[32px]">{plan.description}</p>

                <div className="mb-4">
                  {plan.price === 0 ? (
                    <span className="text-2xl font-bold text-white">Grátis</span>
                  ) : (
                    <>
                      <span className="text-xs text-neutral-400">R$</span>
                      <span className="text-2xl font-bold text-white">
                        {plan.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-neutral-400">/mês</span>
                    </>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-neutral-300">
                    <span className="material-icons-round text-neutral-400 text-sm">videocam</span>
                    {plan.videoLimit} vídeos
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-300">
                    <span className="material-icons-round text-neutral-400 text-sm">sd_storage</span>
                    Até 5MB por vídeo
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-300">
                    <span className="material-icons-round text-neutral-400 text-sm">link</span>
                    Link personalizado
                  </li>
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl text-sm font-medium bg-white/5 text-neutral-500 cursor-default"
                  >
                    Plano atual
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleChangePlan(key)}
                    disabled={isChanging || changingTo !== null}
                    className="w-full py-3 rounded-xl text-sm font-medium bg-white hover:bg-neutral-200 disabled:opacity-50 text-black transition-colors flex items-center justify-center gap-2"
                  >
                    {isChanging ? (
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <span className="material-icons-round text-sm">upgrade</span>
                    )}
                    Fazer upgrade
                  </button>
                ) : isDowngrade ? (
                  <button
                    onClick={() => handleChangePlan(key)}
                    disabled={isChanging || changingTo !== null}
                    className="w-full py-3 rounded-xl text-sm font-medium bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 transition-colors border border-white/10 flex items-center justify-center gap-2"
                  >
                    {isChanging ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="material-icons-round text-sm">south</span>
                    )}
                    Alterar
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-neutral-600 text-center">
        Cada vídeo pode ter até 5MB. Formatos aceitos: MP4, WebM, MOV.
        <br />
        Dúvidas? Entre em contato pelo WhatsApp.
      </p>
    </div>
  );
};
