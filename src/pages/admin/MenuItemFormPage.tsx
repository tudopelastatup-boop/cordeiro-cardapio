import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { VideoUploader } from '../../components/admin/VideoUploader';
import { canUploadVideo } from '../../utils/planLimits';
import { supabase } from '../../lib/supabase';
import { useMenuData } from '../../hooks/useMenuData';
import { MenuItem, Category, ItemVariant } from '../../types';

export const MenuItemFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { business } = useAuth();
  const isEditing = id && id !== 'new';

  const { items, categories, isLoading: dataLoading, videoCount } = useMenuData(business?.id);

  const existingItem: MenuItem | null = isEditing ? items.find(i => i.id === id) ?? null : null;

  const plan = business?.plan || 'free';
  const canUpload = canUploadVideo(plan, videoCount);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'R$',
    categoryId: '',
    tags: '',
    isSignature: false,
    isActive: true,
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const videoThumbRef = useRef<string | null>(null);

  // Captura thumbnail do vídeo para usar como imagem automática
  const captureVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.currentTime = 0.5;
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      video.onerror = () => { URL.revokeObjectURL(url); resolve(''); };
    });
  };
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  // Variants state
  interface LocalVariant {
    id?: string;
    name: string;
    price: string;
  }
  const [variants, setVariants] = useState<LocalVariant[]>([]);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  // Preenche form quando dados carregam (modo edição)
  useEffect(() => {
    if (existingItem) {
      setForm({
        title: existingItem.title,
        description: existingItem.description,
        price: existingItem.price.toString(),
        currency: existingItem.currency,
        categoryId: existingItem.categoryId,
        tags: existingItem.tags.join(', '),
        isSignature: existingItem.isSignature ?? false,
        isActive: existingItem.isActive,
      });
      if (existingItem.image) setImagePreview(existingItem.image);
      // Load variants
      if (existingItem.variants && existingItem.variants.length > 0) {
        setVariants(existingItem.variants.map(v => ({
          id: v.id,
          name: v.name,
          price: v.price.toString(),
        })));
      }
    }
  }, [existingItem?.id]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    videoThumbRef.current = null; // imagem manual sobrepõe thumbnail
  };

  const handleVideoSelected = async (file: File) => {
    setVideoFile(file);
    setRemoveVideo(false);
    // Captura thumbnail automático apenas se não tiver imagem manual
    if (!imageFile && !imagePreview) {
      const thumb = await captureVideoThumbnail(file);
      if (thumb) {
        videoThumbRef.current = thumb;
        setImagePreview(thumb);
      }
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !business?.id) return;
    setCreatingCategory(true);
    const { data, error } = await supabase
      .from('categories')
      .insert({
        business_id: business.id,
        name: newCategoryName.trim(),
        sort_order: localCategories.length,
      })
      .select()
      .single();

    if (!error && data) {
      const newCat: Category = { id: data.id, businessId: data.business_id, name: data.name, sortOrder: data.sort_order };
      setLocalCategories(prev => [...prev, newCat]);
      setForm(f => ({ ...f, categoryId: data.id }));
      setNewCategoryName('');
      setShowNewCategory(false);
    }
    setCreatingCategory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id) return;
    if (!form.title.trim()) { setError('Título é obrigatório.'); return; }
    if (!form.price || isNaN(Number(form.price))) { setError('Preço inválido.'); return; }

    setIsSaving(true);
    setError(null);

    try {
      let videoUrl: string | null = existingItem?.videoUrl ?? null;
      let imageUrl: string | null = existingItem?.image ?? null;

      // Upload de vídeo novo
      if (videoFile) {
        const ext = videoFile.name.split('.').pop();
        const path = `${business.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('videos').upload(path, videoFile);
        if (uploadError) throw new Error('Erro ao fazer upload do vídeo.');
        const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(path);
        // Remove vídeo antigo do storage
        if (existingItem?.videoUrl) {
          const oldPath = existingItem.videoUrl.split('/storage/v1/object/public/videos/')[1];
          if (oldPath) await supabase.storage.from('videos').remove([oldPath]);
        }
        videoUrl = publicUrl;
      } else if (removeVideo) {
        if (existingItem?.videoUrl) {
          const oldPath = existingItem.videoUrl.split('/storage/v1/object/public/videos/')[1];
          if (oldPath) await supabase.storage.from('videos').remove([oldPath]);
        }
        videoUrl = null;
      }

      // Se não há imageFile mas há thumbnail do vídeo, converte para File
      let finalImageFile = imageFile;
      if (!finalImageFile && videoThumbRef.current && !existingItem?.image) {
        const res = await fetch(videoThumbRef.current);
        const blob = await res.blob();
        finalImageFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
      }

      // Upload de imagem nova
      if (finalImageFile) {
        const ext = finalImageFile.name.split('.').pop() || 'jpg';
        const path = `${business.id}/${Date.now()}.${ext}`;
        const { error: imgError } = await supabase.storage.from('images').upload(path, finalImageFile);
        if (imgError) throw new Error('Erro ao fazer upload da imagem.');
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path);
        // Remove imagem antiga
        if (existingItem?.image) {
          const oldPath = existingItem.image.split('/storage/v1/object/public/images/')[1];
          if (oldPath) await supabase.storage.from('images').remove([oldPath]);
        }
        imageUrl = publicUrl;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        currency: form.currency,
        category_id: form.categoryId || null,
        business_id: business.id,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        is_signature: form.isSignature,
        is_active: form.isActive,
        video_url: videoUrl,
        image_url: imageUrl,
      };

      let itemId: string;

      if (isEditing && existingItem) {
        const { error: updateError } = await supabase
          .from('menu_items')
          .update(payload)
          .eq('id', existingItem.id);
        if (updateError) throw new Error(updateError.message);
        itemId = existingItem.id;
      } else {
        const maxOrder = items.length;
        const { data: insertData, error: insertError } = await supabase
          .from('menu_items')
          .insert({ ...payload, sort_order: maxOrder })
          .select('id')
          .single();
        if (insertError) throw new Error(insertError.message);
        itemId = insertData.id;
      }

      // Save variants
      // Delete old variants
      await supabase.from('item_variants').delete().eq('menu_item_id', itemId);
      // Insert new variants
      const validVariants = variants.filter(v => v.name.trim() && v.price && !isNaN(Number(v.price)));
      if (validVariants.length > 0) {
        const { error: varErr } = await supabase.from('item_variants').insert(
          validVariants.map((v, i) => ({
            menu_item_id: itemId,
            name: v.name.trim(),
            price: Number(v.price),
            sort_order: i,
          }))
        );
        if (varErr) throw new Error('Erro ao salvar tamanhos/preços.');
      }

      navigate('/admin/menu');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingItem || !confirm('Excluir este item permanentemente?')) return;
    if (existingItem.videoUrl) {
      const path = existingItem.videoUrl.split('/storage/v1/object/public/videos/')[1];
      if (path) await supabase.storage.from('videos').remove([path]);
    }
    if (existingItem.image) {
      const path = existingItem.image.split('/storage/v1/object/public/images/')[1];
      if (path) await supabase.storage.from('images').remove([path]);
    }
    await supabase.from('menu_items').delete().eq('id', existingItem.id);
    navigate('/admin/menu');
  };

  if (isEditing && dataLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-neutral-900/50 rounded animate-pulse" />
        <div className="h-64 bg-neutral-900/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/menu"
          className="p-2 rounded-xl bg-neutral-900/50 border border-white/5 text-neutral-400 hover:text-white hover:border-white/10 transition-colors"
        >
          <span className="material-icons-round">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-serif text-white">
            {isEditing ? 'Editar item' : 'Novo item'}
          </h1>
          <p className="text-neutral-400 text-sm">
            {isEditing ? `Editando "${existingItem?.title}"` : 'Adicione um novo item à vitrine'}
          </p>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Excluir item"
          >
            <span className="material-icons-round">delete</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:grid lg:grid-cols-[1fr,320px] gap-6">
        {/* Right: Video + Image — aparece primeiro no mobile */}
        <div className="space-y-4 order-first lg:order-last">
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-white">Vídeo</h2>
            <VideoUploader
              currentVideoUrl={!removeVideo ? (existingItem?.videoUrl) : undefined}
              onVideoSelect={handleVideoSelected}
              onVideoRemove={() => { setVideoFile(null); setRemoveVideo(true); videoThumbRef.current = null; if (!imageFile) setImagePreview(null); }}
              disabled={!canUpload && !existingItem?.videoUrl && !videoFile}
            />
            {!canUpload && !existingItem?.videoUrl && !videoFile && (
              <p className="text-xs text-amber-400 flex items-center gap-1">
                <span className="material-icons-round text-xs">warning</span>
                Limite de vídeos atingido.{' '}
                <Link to="/admin/plan" className="underline">Upgrade</Link>
              </p>
            )}
            <p className="text-xs text-neutral-600">Máx. 5MB · MP4, WebM ou MOV</p>
          </div>

          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-white">Imagem de capa</h2>
            <label className="relative block w-40 aspect-square rounded-xl bg-neutral-800 border-2 border-dashed border-neutral-700 cursor-pointer hover:border-neutral-500 transition-colors overflow-hidden group">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-icons-round text-white">edit</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="material-icons-round text-neutral-600 text-3xl mb-2">add_photo_alternate</span>
                  <p className="text-xs text-neutral-500 text-center px-2">Clique para adicionar</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>
            <p className="text-xs text-neutral-600">
              {videoFile || existingItem?.videoUrl
                ? 'Gerada automaticamente do vídeo se não enviar outra'
                : 'Exibida quando não houver vídeo'}
            </p>
          </div>
        </div>

        {/* Left: Form Fields */}
        <div className="space-y-6 order-last lg:order-first">
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-medium text-white">Informações</h2>

            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Título</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Nome do prato ou produto"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors resize-none"
                placeholder="Descreva o item..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Preço</label>
                <div className="flex items-center gap-2">
                  <select
                    value={form.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="bg-neutral-800/50 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                  >
                    <option value="R$">R$</option>
                    <option value="$">$</option>
                    <option value="€">€</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="flex-1 bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Categoria</label>
                <div className="flex gap-2">
                  <select
                    value={form.categoryId}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                    className="flex-1 bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                  >
                    <option value="">Sem categoria</option>
                    {localCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(v => !v)}
                    className="p-3 rounded-xl bg-neutral-800/50 border border-white/10 text-neutral-400 hover:text-white transition-colors"
                    title="Nova categoria"
                  >
                    <span className="material-icons-round text-sm">add</span>
                  </button>
                </div>
                {showNewCategory && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 bg-neutral-800/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                      placeholder="Nome da categoria"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory}
                      className="px-3 py-2 rounded-xl bg-white text-black text-sm font-medium disabled:opacity-50"
                    >
                      {creatingCategory ? '...' : 'Criar'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Tags</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Separe por vírgula: Wagyu, Premium, Favorito"
              />
            </div>

            {/* Variants / Sizes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-neutral-400">Tamanhos e preços</label>
                <button
                  type="button"
                  onClick={() => setVariants(prev => [...prev, { name: '', price: '' }])}
                  className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  <span className="material-icons-round text-sm">add</span>
                  Adicionar tamanho
                </button>
              </div>
              {variants.length === 0 ? (
                <p className="text-xs text-neutral-600">Nenhum tamanho adicional. O preço base será usado. Clique em "Adicionar tamanho" para criar variações como P, M, G.</p>
              ) : (
                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => {
                          const copy = [...variants];
                          copy[idx] = { ...copy[idx], name: e.target.value };
                          setVariants(copy);
                        }}
                        className="flex-1 bg-neutral-800/50 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                        placeholder="Nome (ex: P, M, G, 500ml)"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-500 text-sm">{form.currency}</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={v.price}
                          onChange={(e) => {
                            const copy = [...variants];
                            copy[idx] = { ...copy[idx], price: e.target.value };
                            setVariants(copy);
                          }}
                          className="w-24 bg-neutral-800/50 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                          placeholder="0,00"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setVariants(prev => prev.filter((_, i) => i !== idx))}
                        className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <span className="material-icons-round text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isSignature}
                  onChange={(e) => handleChange('isSignature', e.target.checked)}
                  className="w-5 h-5 rounded bg-neutral-800 border-white/10 accent-white"
                />
                <div>
                  <span className="text-sm text-white">Item Destaque</span>
                  <p className="text-xs text-neutral-500">Aparece com selo especial</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-5 h-5 rounded bg-neutral-800 border-white/10 accent-white"
                />
                <div>
                  <span className="text-sm text-white">Ativo</span>
                  <p className="text-xs text-neutral-500">Visível na loja</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-white hover:bg-neutral-200 disabled:opacity-50 text-black px-8 py-3 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <span className="material-icons-round text-sm">save</span>
              )}
              {isEditing ? 'Salvar alterações' : 'Criar item'}
            </button>
            <Link
              to="/admin/menu"
              className="px-6 py-3 rounded-xl text-sm text-neutral-400 hover:text-white border border-white/5 hover:border-white/10 transition-colors"
            >
              Cancelar
            </Link>
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <span className="material-icons-round text-sm">error</span>
                {error}
              </p>
            )}
          </div>
        </div>

      </form>
    </div>
  );
};
