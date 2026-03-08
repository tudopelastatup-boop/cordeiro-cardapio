import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PlanBadge } from '../../components/admin/PlanBadge';
import { PLANS, APP_DOMAIN } from '../../lib/constants';
import { useMenuData } from '../../hooks/useMenuData';

export const DashboardPage: React.FC = () => {
  const { business } = useAuth();
  const plan = PLANS[business?.plan || 'free'];
  const { items, videoCount, isLoading } = useMenuData(business?.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-white mb-1">Dashboard</h1>
        <p className="text-neutral-400 text-sm">Bem-vindo ao painel do {business?.name || 'seu negócio'}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Video Count */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="material-icons-round text-white text-2xl">videocam</span>
            <PlanBadge plan={business?.plan || 'free'} />
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {isLoading ? '–' : videoCount}
            <span className="text-lg text-neutral-500">/{plan.videoLimit}</span>
          </p>
          <p className="text-sm text-neutral-400">Vídeos utilizados</p>
          <div className="mt-3 w-full bg-neutral-800 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: isLoading ? '0%' : `${Math.min(100, (videoCount / plan.videoLimit) * 100)}%` }}
            />
          </div>
        </div>

        {/* Items Count */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="material-icons-round text-neutral-300 text-2xl">restaurant_menu</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{isLoading ? '–' : items.length}</p>
          <p className="text-sm text-neutral-400">Itens no cardápio</p>
        </div>

        {/* Store Link */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="material-icons-round text-neutral-300 text-2xl">link</span>
          </div>
          <p className="text-sm text-white font-mono mb-1 truncate">
            {APP_DOMAIN}/{business?.slug || '...'}
          </p>
          <p className="text-sm text-neutral-400">Link da sua loja</p>
          <a
            href={`/${business?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-xs text-neutral-300 hover:text-white hover:underline"
          >
            Abrir loja <span className="material-icons-round text-xs">open_in_new</span>
          </a>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-white mb-4">Ações rápidas</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/menu/new"
            className="flex items-center gap-4 p-5 bg-neutral-900/50 border border-white/5 rounded-2xl hover:border-white/15 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <span className="material-icons-round text-white">add_circle</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Adicionar item</p>
              <p className="text-xs text-neutral-500">Novo item com vídeo</p>
            </div>
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-4 p-5 bg-neutral-900/50 border border-white/5 rounded-2xl hover:border-white/15 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <span className="material-icons-round text-neutral-400">settings</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Configurações</p>
              <p className="text-xs text-neutral-500">Editar informações da loja</p>
            </div>
          </Link>
          <Link
            to="/admin/plan"
            className="flex items-center gap-4 p-5 bg-neutral-900/50 border border-white/5 rounded-2xl hover:border-white/15 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <span className="material-icons-round text-neutral-400">workspace_premium</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Meu plano</p>
              <p className="text-xs text-neutral-500">Gerenciar assinatura</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
