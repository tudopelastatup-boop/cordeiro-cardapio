import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { slugify } from '../../utils/slugify';
import { supabase } from '../../lib/supabase';
import { APP_DOMAIN } from '../../lib/constants';

export const StoreSettingsPage: React.FC = () => {
  const { business, updateBusiness } = useAuth();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(business?.logoUrl ?? null);
  const [coverPreview, setCoverPreview] = useState<string | null>(business?.coverImageUrl ?? null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: business?.name || '',
    slug: business?.slug || '',
    slogan: business?.slogan || '',
    address: business?.address || '',
    phone: business?.phone || '',
    whatsapp: business?.whatsapp || '',
    instagram: business?.instagram || '',
    hours: business?.hours || '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setSaved(false);
    setError(null);
  };

  const handleNameChange = (value: string) => {
    setForm(f => ({ ...f, name: value, slug: slugify(value) }));
    setSaved(false);
    setError(null);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File, folder: string, oldUrl?: string): Promise<string> => {
    if (oldUrl) {
      const oldPath = oldUrl.split('/storage/v1/object/public/images/')[1];
      if (oldPath) await supabase.storage.from('images').remove([oldPath]);
    }
    const ext = file.name.split('.').pop();
    const path = `${business!.id}/${folder}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(path, file);
    if (error) throw new Error(`Erro ao fazer upload: ${error.message}`);
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id) return;
    setIsSaving(true);
    setError(null);

    try {
      let logoUrl = business.logoUrl ?? null;
      let coverImageUrl = business.coverImageUrl ?? null;

      if (logoFile) logoUrl = await uploadImage(logoFile, 'logo', business.logoUrl);
      if (coverFile) coverImageUrl = await uploadImage(coverFile, 'cover', business.coverImageUrl);

      // Verifica slug único (se mudou)
      if (form.slug !== business.slug) {
        const { data: existing } = await supabase
          .from('businesses')
          .select('id')
          .eq('slug', form.slug)
          .neq('id', business.id)
          .maybeSingle();
        if (existing) {
          setError('Este slug já está em uso. Escolha outro.');
          setIsSaving(false);
          return;
        }
      }

      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          name: form.name,
          slug: form.slug,
          slogan: form.slogan || null,
          address: form.address || null,
          phone: form.phone || null,
          whatsapp: form.whatsapp || null,
          instagram: form.instagram || null,
          hours: form.hours || null,
          logo_url: logoUrl,
          cover_image_url: coverImageUrl,
        })
        .eq('id', business.id);

      if (updateError) throw new Error(updateError.message);

      // Atualiza contexto local
      updateBusiness({
        ...form,
        logoUrl: logoUrl ?? undefined,
        coverImageUrl: coverImageUrl ?? undefined,
      });

      setLogoFile(null);
      setCoverFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-white mb-1">Configurações da Loja</h1>
        <p className="text-neutral-400 text-sm">Personalize as informações do seu negócio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo & Cover Upload */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-medium text-white">Imagens</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Logo</label>
              <div
                onClick={() => logoInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full bg-neutral-800 border-2 border-dashed border-neutral-700 flex items-center justify-center cursor-pointer hover:border-neutral-500 transition-colors overflow-hidden group"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-icons-round text-neutral-600 text-3xl">add_photo_alternate</span>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-icons-round text-white">edit</span>
                </div>
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
              <p className="text-xs text-neutral-600 mt-2">JPG, PNG. Recomendado: 200x200px</p>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Capa</label>
              <div
                onClick={() => coverInputRef.current?.click()}
                className="relative h-24 rounded-xl bg-neutral-800 border-2 border-dashed border-neutral-700 flex items-center justify-center cursor-pointer hover:border-neutral-500 transition-colors overflow-hidden group"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-icons-round text-neutral-600 text-3xl">add_photo_alternate</span>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-icons-round text-white">edit</span>
                </div>
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
              <p className="text-xs text-neutral-600 mt-2">JPG, PNG. Recomendado: 1200x400px</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-medium text-white">Informações básicas</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Nome do negócio</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Slug (URL)</label>
              <div className="flex items-center gap-1">
                <span className="text-neutral-500 text-sm shrink-0">{APP_DOMAIN}/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-neutral-400 mb-1.5">Slogan</label>
              <input
                type="text"
                value={form.slogan}
                onChange={(e) => handleChange('slogan', e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Descreva seu negócio em uma frase"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-medium text-white">Contato e localização</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Telefone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">WhatsApp</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                placeholder="5511999999999"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Instagram</label>
              <div className="flex items-center">
                <span className="text-neutral-500 text-sm mr-1">@</span>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className="flex-1 bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="seurestaurante"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Horário de funcionamento</label>
              <input
                type="text"
                value={form.hours}
                onChange={(e) => handleChange('hours', e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Seg-Sex: 11h às 22h"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-neutral-400 mb-1.5">Endereço</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Rua, número - Bairro, Cidade"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
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
            Salvar configurações
          </button>
          {saved && (
            <p className="text-sm text-green-400 flex items-center gap-1">
              <span className="material-icons-round text-sm">check_circle</span>
              Salvo com sucesso!
            </p>
          )}
          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1">
              <span className="material-icons-round text-sm">error</span>
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
