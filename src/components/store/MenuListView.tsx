import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MenuItem, Category, Business } from '../../types';

interface MenuListViewProps {
  items: MenuItem[];
  categories: Category[];
  business: Business;
  onItemClick: (index: number) => void;
}

export const MenuListView: React.FC<MenuListViewProps> = ({ items, categories, business, onItemClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  // Categories that actually have items
  const activeCategories = categories.filter(cat =>
    items.some(item => item.categoryId === cat.id)
  );

  const filteredItems = selectedCategory
    ? items.filter(item => item.categoryId === selectedCategory)
    : items;

  // Observe which cards are visible and only play those videos
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds(prev => {
          const next = new Set(prev);
          for (const entry of entries) {
            const id = entry.target.getAttribute('data-item-id');
            if (!id) continue;
            if (entry.isIntersecting) {
              next.add(id);
            } else {
              next.delete(id);
            }
          }
          return next;
        });
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );

    const cards = grid.querySelectorAll('[data-item-id]');
    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [selectedCategory, filteredItems.length]);

  const videoRefCallback = useCallback((el: HTMLVideoElement | null) => {
    if (el) el.play().catch(() => {});
  }, []);

  // Get the original index in unfiltered items array for navigation to feed
  const getOriginalIndex = (item: MenuItem) => {
    return items.findIndex(i => i.id === item.id);
  };

  return (
    <div className="w-full h-full pt-20 pb-32 px-4 lg:px-8 overflow-y-auto no-scrollbar bg-black">
      <div className="max-w-6xl mx-auto">
        {/* Logo do cliente em evidência */}
        <div className="flex flex-col items-center mb-6">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-brand-accent shadow-lg mb-2"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center border-2 border-brand-accent mb-2">
              <span className="text-2xl font-serif text-brand-primary">{business.name?.charAt(0)}</span>
            </div>
          )}
          {business.slogan && (
            <p className="text-white/50 text-xs tracking-widest uppercase">{business.slogan}</p>
          )}
        </div>

        {/* Category filter */}
        {activeCategories.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedCategory === null
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 border border-white/10 text-white/70 hover:text-white'
              }`}
            >
              Todos
            </button>
            {activeCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black'
                    : 'bg-neutral-900 border border-white/10 text-white/70 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
          {filteredItems.map((item) => {
            const isVisible = visibleIds.has(item.id);
            return (
            <button
              key={item.id}
              data-item-id={item.id}
              onClick={() => onItemClick(getOriginalIndex(item))}
              className="group relative w-full aspect-3/4 rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 active:scale-95 hover:scale-[1.02] hover:border-white/15 transition-all duration-200 text-left focus:outline-none cursor-pointer"
            >
              <div className="absolute inset-0">
                {item.videoUrl && isVisible ? (
                  <video
                    ref={videoRefCallback}
                    src={item.videoUrl}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : item.videoUrl ? (
                  <div className="w-full h-full bg-neutral-800" />
                ) : (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 flex flex-col justify-end h-full">
                <span className="text-[10px] lg:text-[11px] text-brand-accent uppercase tracking-wider font-bold mb-1">
                  {getCategoryName(item.categoryId)}
                </span>
                <h3 className="text-white font-serif text-sm lg:text-base font-medium leading-tight mb-1 line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex justify-between items-center mt-1">
                  {item.variants && item.variants.length > 0 ? (
                    <span className="text-white/90 text-xs font-light">
                      a partir de {item.currency} {Math.min(item.price, ...item.variants.map(v => v.price)).toFixed(0)}
                    </span>
                  ) : (
                    <span className="text-white/90 text-sm font-light">
                      {item.currency} {item.price.toFixed(0)}
                    </span>
                  )}
                  {item.isSignature && (
                    <span className="material-icons-round text-brand-primary text-[10px]" title="Signature">
                      verified
                    </span>
                  )}
                </div>
              </div>
            </button>
            );
          })}
        </div>

        <div className="mt-12 pb-8 flex items-center justify-center gap-2">
          <p className="text-white/40 text-[10px]">Powered by</p>
          <img src="/Witrin logo branca.svg" alt="Witrin" className="h-3 opacity-40" />
        </div>
      </div>
    </div>
  );
};
