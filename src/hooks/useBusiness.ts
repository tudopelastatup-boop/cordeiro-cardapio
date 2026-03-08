import { useState, useEffect } from 'react';
import { Business, MenuItem, Category } from '../types';
import { supabase } from '../lib/supabase';

interface UseBusinessResult {
  business: Business | null;
  menuItems: MenuItem[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export function useBusiness(slug: string | undefined): UseBusinessResult {
  const [state, setState] = useState<UseBusinessResult>({
    business: null,
    menuItems: [],
    categories: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!slug) {
      setState(s => ({ ...s, isLoading: false, error: 'Slug não informado' }));
      return;
    }

    let cancelled = false;

    async function load() {
      // Busca o business pelo slug
      const { data: biz, error: bizErr } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (bizErr || !biz) {
        if (!cancelled) setState({ business: null, menuItems: [], categories: [], isLoading: false, error: 'Loja não encontrada' });
        return;
      }

      const business: Business = {
        id: biz.id,
        ownerId: biz.owner_id,
        slug: biz.slug,
        name: biz.name,
        slogan: biz.slogan ?? undefined,
        logoUrl: biz.logo_url ?? undefined,
        coverImageUrl: biz.cover_image_url ?? undefined,
        address: biz.address ?? undefined,
        phone: biz.phone ?? undefined,
        whatsapp: biz.whatsapp ?? undefined,
        instagram: biz.instagram ?? undefined,
        hours: biz.hours ?? undefined,
        plan: biz.plan,
        planExpiresAt: biz.plan_expires_at ?? undefined,
        primaryColor: biz.primary_color,
        accentColor: biz.accent_color,
      };

      // Busca categorias e itens em paralelo
      const [catsRes, itemsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('business_id', biz.id).order('sort_order'),
        supabase.from('menu_items').select('*').eq('business_id', biz.id).eq('is_active', true).order('sort_order'),
      ]);

      if (cancelled) return;

      const categories: Category[] = (catsRes.data ?? []).map(r => ({
        id: r.id,
        businessId: r.business_id,
        name: r.name,
        sortOrder: r.sort_order,
      }));

      const menuItems: MenuItem[] = (itemsRes.data ?? []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        price: Number(r.price),
        currency: r.currency,
        categoryId: r.category_id,
        image: r.image_url || '',
        videoUrl: r.video_url || undefined,
        tags: Array.isArray(r.tags) ? r.tags : [],
        isSignature: Boolean(r.is_signature),
        isActive: Boolean(r.is_active),
        sortOrder: Number(r.sort_order),
      }));

      setState({ business, menuItems, categories, isLoading: false, error: null });
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  return state;
}
