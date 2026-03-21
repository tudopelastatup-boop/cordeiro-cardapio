import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PlanBadge } from '../../components/admin/PlanBadge';
import { PLANS } from '../../lib/constants';
import { useMenuData } from '../../hooks/useMenuData';

export const DashboardPage: React.FC = () => {
  const { business } = useAuth();
  const plan = PLANS[business?.plan || 'free'];
  const { items, videoCount, isLoading } = useMenuData(business?.id);
  const [copied, setCopied] = useState(false);

  const storeUrl = `${window.location.origin}/${business?.slug || '...'}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = storeUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            <span className="material-icons-round text-neutral-300 text-2xl">storefront</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{isLoading ? '–' : items.length}</p>
          <p className="text-sm text-neutral-400">Itens na vitrine</p>
        </div>

        {/* Store Link */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="material-icons-round text-neutral-300 text-2xl">link</span>
          </div>
          <p className="text-sm text-white font-mono mb-1 truncate">
            {storeUrl}
          </p>
          <p className="text-sm text-neutral-400">Link da sua vitrine</p>
          <div className="flex items-center gap-2 mt-3">
            <a
              href={`/${business?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-neutral-300 hover:text-white hover:underline"
            >
              Abrir <span className="material-icons-round text-xs">open_in_new</span>
            </a>
            <button
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1 text-xs transition-colors ${
                copied ? 'text-green-400' : 'text-neutral-300 hover:text-white'
              }`}
            >
              <span className="material-icons-round text-xs">{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-white mb-4">Ações rápidas</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-xs text-neutral-500">Editar informações</p>
            </div>
          </Link>
          <Link
            to="/admin/qrcode"
            className="flex items-center gap-4 p-5 bg-neutral-900/50 border border-white/5 rounded-2xl hover:border-white/15 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <span className="material-icons-round text-neutral-400">qr_code</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">QR Code</p>
              <p className="text-xs text-neutral-500">Gerar e baixar</p>
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
