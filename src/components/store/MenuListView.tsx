import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MenuItem, Category, Business } from '../../types';

interface MenuListViewProps {
  items: MenuItem[];
  categories: Category[];
  business: Business;
  onItemClick: (index: number) => void;
  savedScrollTop?: React.MutableRefObject<number>;
}

export const MenuListView: React.FC<MenuListViewProps> = ({ items, categories, business, onItemClick, savedScrollTop }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  const activeCategories = categories.filter(cat =>
    items.some(item => item.categoryId === cat.id)
  );

  const filteredItems = selectedCategory
    ? items.filter(item => item.categoryId === selectedCategory)
    : items;

  const totalRows = Math.ceil(filteredItems.length / 3);

  // Active row: determined by scroll position of the container
  const [activeRow, setActiveRow] = useState<number>(0);

  // Calculate active row from scroll position — more tolerant than IntersectionObserver
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    const grid = gridRef.current;
    if (!container || !grid) return;

    // Save scroll position for restore
    if (savedScrollTop) {
      savedScrollTop.current = container.scrollTop;
    }

    // Find which row is in the center of the viewport
    const containerRect = container.getBoundingClientRect();
    const centerY = containerRect.top + containerRect.height / 2;

    // Get the first card of each row and find which one is closest to center
    let closestRow = 0;
    let closestDist = Infinity;

    const cards = grid.querySelectorAll('[data-row-first]');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenterY = rect.top + rect.height / 2;
      const dist = Math.abs(cardCenterY - centerY);
      const row = Number(card.getAttribute('data-row'));
      if (dist < closestDist) {
        closestDist = dist;
        closestRow = row;
      }
    });

    setActiveRow(closestRow);
  }, [savedScrollTop]);

  // Restore scroll position on mount
  useEffect(() => {
    if (savedScrollTop && scrollContainerRef.current && savedScrollTop.current > 0) {
      scrollContainerRef.current.scrollTop = savedScrollTop.current;
    }
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    // Initial calculation
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const videoRefCallback = useCallback((el: HTMLVideoElement | null) => {
    if (el) el.play().catch(() => {});
  }, []);

  const getOriginalIndex = (item: MenuItem) => {
    return items.findIndex(i => i.id === item.id);
  };

  return (
    <div ref={scrollContainerRef} className="w-full h-full pt-20 pb-32 px-4 lg:px-8 overflow-y-auto no-scrollbar bg-black">
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

        <div className="relative">
          {/* Row indicator dots — right side */}
          {totalRows > 1 && (
            <div className="fixed right-1.5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 items-center">
              {Array.from({ length: totalRows }, (_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeRow
                      ? 'w-1.5 h-4 bg-white'
                      : 'w-1 h-1 bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}

          <div ref={gridRef} className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
            {filteredItems.map((item, index) => {
              const row = Math.floor(index / 3);
              const isFirstInRow = index % 3 === 0;
              const shouldPlayVideo = item.videoUrl && row === activeRow;
              return (
                <button
                  key={item.id}
                  data-row={row}
                  {...(isFirstInRow ? { 'data-row-first': '' } : {})}
                  onClick={() => onItemClick(getOriginalIndex(item))}
                  className={`group relative w-full aspect-3/4 rounded-2xl overflow-hidden bg-neutral-900 border active:scale-95 hover:scale-[1.02] transition-all duration-200 text-left focus:outline-none cursor-pointer ${
                    row === activeRow
                      ? 'border-white/20 ring-1 ring-white/10'
                      : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="absolute inset-0">
                    {shouldPlayVideo ? (
                      <video
                        ref={videoRefCallback}
                        src={item.videoUrl}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
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
        </div>

        <div className="mt-12 pb-8 flex items-center justify-center gap-2">
          <p className="text-white/40 text-[10px]">Powered by</p>
          <img src="/Witrin logo branca.svg" alt="Witrin" className="h-3 opacity-40" />
        </div>
      </div>
    </div>
  );
};
