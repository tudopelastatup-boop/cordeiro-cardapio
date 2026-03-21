import { useState, useEffect, useCallback } from 'react';
import { MenuItem, Category, ItemVariant } from '../types';
import { supabase } from '../lib/supabase';

interface UseMenuDataResult {
  items: MenuItem[];
  categories: Category[];
  isLoading: boolean;
  videoCount: number;
  refetch: () => void;
}

function mapItem(row: Record<string, unknown>): MenuItem {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    price: Number(row.price),
    currency: row.currency as string,
    categoryId: row.category_id as string,
    image: (row.image_url as string) || '',
    videoUrl: (row.video_url as string) || undefined,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    isSignature: Boolean(row.is_signature),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order),
  };
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    businessId: row.business_id as string,
    name: row.name as string,
    sortOrder: Number(row.sort_order),
  };
}

export function useMenuData(businessId: string | undefined): UseMenuDataResult {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      supabase
        .from('menu_items')
        .select('*')
        .eq('business_id', businessId)
        .order('sort_order', { ascending: true }),
      supabase
        .from('categories')
        .select('*')
        .eq('business_id', businessId)
        .order('sort_order', { ascending: true }),
      supabase
        .from('item_variants')
        .select('*')
        .order('sort_order', { ascending: true }),
    ]).then(([itemsRes, catsRes, variantsRes]) => {
      if (cancelled) return;
      const variantsByItem: Record<string, ItemVariant[]> = {};
      for (const v of (variantsRes.data ?? [])) {
        const arr = variantsByItem[v.menu_item_id] || [];
        arr.push({ id: v.id, menuItemId: v.menu_item_id, name: v.name, price: Number(v.price), sortOrder: Number(v.sort_order) });
        variantsByItem[v.menu_item_id] = arr;
      }
      setItems((itemsRes.data ?? []).map(r => ({ ...mapItem(r), variants: variantsByItem[r.id as string] || [] })));
      setCategories((catsRes.data ?? []).map(mapCategory));
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [businessId, tick]);

  const videoCount = items.filter(i => i.videoUrl && i.isActive).length;

  return { items, categories, isLoading, videoCount, refetch };
}
