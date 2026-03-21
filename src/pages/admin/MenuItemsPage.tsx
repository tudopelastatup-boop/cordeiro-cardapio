import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PLANS } from '../../lib/constants';
import { MenuItem } from '../../types';
import { supabase } from '../../lib/supabase';
import { useMenuData } from '../../hooks/useMenuData';

export const MenuItemsPage: React.FC = () => {
  const { business } = useAuth();
  const plan = PLANS[business?.plan || 'free'];
  const { items, categories, isLoading, videoCount, refetch } = useMenuData(business?.id);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localItems, setLocalItems] = useState<MenuItem[] | null>(null);

  const displayItems = localItems ?? items;
  const canAddMore = videoCount < plan.videoLimit;

  const getCategoryName = (categoryId: string) =>
    categories.find(c => c.id === categoryId)?.name || 'Sem categoria';

  const handleToggleActive = async (id: string, current: boolean) => {
    await supabase.from('menu_items').update({ is_active: !current }).eq('id', id);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este item?')) return;
    // Busca o video_url para remover do storage se existir
    const { data } = await supabase.from('menu_items').select('video_url, image_url').eq('id', id).single();
    if (data?.video_url) {
      const path = data.video_url.split('/storage/v1/object/public/videos/')[1];
      if (path) await supabase.storage.from('videos').remove([path]);
    }
    if (data?.image_url) {
      const path = data.image_url.split('/storage/v1/object/public/images/')[1];
      if (path) await supabase.storage.from('images').remove([path]);
    }
    await supabase.from('menu_items').delete().eq('id', id);
    refetch();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    setLocalItems([...displayItems]);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newItems = [...displayItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, removed);
    setLocalItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    if (!localItems) return;
    // Persiste nova ordem
    await Promise.all(
      localItems.map((item, i) =>
        supabase.from('menu_items').update({ sort_order: i }).eq('id', item.id)
      )
    );
    setLocalItems(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif text-white mb-1">Vitrine</h1>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-neutral-900/50 border border-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-white mb-1">Vitrine</h1>
          <p className="text-neutral-400 text-sm">
            {videoCount}/{plan.videoLimit} vídeos utilizados
          </p>
        </div>
        <Link
          to="/admin/menu/new"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-colors ${
            canAddMore
              ? 'bg-white hover:bg-neutral-200 text-black'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
          }`}
          onClick={(e) => !canAddMore && e.preventDefault()}
        >
          <span className="material-icons-round text-sm">add</span>
          Adicionar item
        </Link>
      </div>

      {!canAddMore && (
        <div className="bg-amber-900/20 border border-amber-800/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="material-icons-round text-amber-400">warning</span>
          <p className="text-sm text-amber-300">
            Você atingiu o limite de {plan.videoLimit} vídeos do plano {plan.name}.{' '}
            <Link to="/admin/plan" className="underline hover:text-amber-200">Fazer upgrade</Link>
          </p>
        </div>
      )}

      {displayItems.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-icons-round text-5xl text-neutral-700 mb-4 block">restaurant_menu</span>
          <p className="text-neutral-400 mb-2">Nenhum item na vitrine</p>
          <p className="text-neutral-600 text-sm mb-6">Adicione seu primeiro item com vídeo</p>
          <Link
            to="/admin/menu/new"
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            <span className="material-icons-round text-sm">add</span>
            Adicionar primeiro item
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {displayItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                bg-neutral-900/50 border border-white/5 rounded-xl p-3 sm:p-4
                hover:border-white/10 transition-all cursor-grab active:cursor-grabbing
                ${draggedIndex === index ? 'opacity-50 scale-[0.98]' : ''}
                ${!item.isActive ? 'opacity-60' : ''}
              `}
            >
              {/* Linha principal */}
              <div className="flex items-center gap-3">
                <span className="material-icons-round text-neutral-600 text-lg shrink-0">drag_indicator</span>

                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-neutral-800 shrink-0 relative">
                  {item.videoUrl ? (
                    <video
                      src={item.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-icons-round text-neutral-600">restaurant</span>
                    </div>
                  )}
                  {item.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="material-icons-round text-white text-lg">play_circle</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-white text-sm font-medium truncate">{item.title}</h3>
                    {item.isSignature && (
                      <span className="material-icons-round text-neutral-400 text-xs shrink-0">verified</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{getCategoryName(item.categoryId)}</p>
                  <p className="text-sm text-neutral-300 mt-0.5">
                    {item.currency} {item.price.toFixed(2)}
                  </p>
                </div>

                {/* Ações desktop */}
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(item.id, item.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-neutral-600 hover:bg-white/5'
                    }`}
                    title={item.isActive ? 'Desativar' : 'Ativar'}
                  >
                    <span className="material-icons-round text-lg">
                      {item.isActive ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                  <Link
                    to={`/admin/menu/${item.id}`}
                    className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Editar"
                  >
                    <span className="material-icons-round text-lg">edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Excluir"
                  >
                    <span className="material-icons-round text-lg">delete</span>
                  </button>
                </div>
              </div>

              {/* Ações mobile */}
              <div className="sm:hidden flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => handleToggleActive(item.id, item.isActive)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    item.isActive ? 'text-green-400 bg-green-500/10' : 'text-neutral-500 bg-white/5'
                  }`}
                >
                  <span className="material-icons-round text-sm">
                    {item.isActive ? 'visibility' : 'visibility_off'}
                  </span>
                  {item.isActive ? 'Ativo' : 'Inativo'}
                </button>
                <Link
                  to={`/admin/menu/${item.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 bg-white/5 hover:text-white transition-colors"
                >
                  <span className="material-icons-round text-sm">edit</span>
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 bg-white/5 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <span className="material-icons-round text-sm">delete</span>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {displayItems.length > 0 && (
        <p className="text-xs text-neutral-600 flex items-center gap-1">
          <span className="material-icons-round text-xs">info</span>
          Arraste os itens para reorganizar a ordem na vitrine
        </p>
      )}
    </div>
  );
};
