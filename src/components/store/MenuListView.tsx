import React from 'react';
import { MenuItem, Category } from '../../types';

interface MenuListViewProps {
  items: MenuItem[];
  categories: Category[];
  onItemClick: (index: number) => void;
}

export const MenuListView: React.FC<MenuListViewProps> = ({ items, categories, onItemClick }) => {
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  return (
    <div className="w-full h-full pt-20 pb-32 px-4 lg:px-8 overflow-y-auto no-scrollbar bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6 px-1">
          <h2 className="text-xl lg:text-2xl text-white font-serif tracking-wide">Catálogo</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onItemClick(index)}
              className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 active:scale-95 hover:scale-[1.02] hover:border-white/15 transition-all duration-200 text-left focus:outline-none cursor-pointer"
            >
              <div className="absolute inset-0">
                {item.videoUrl ? (
                  <video
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
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 flex flex-col justify-end h-full">
                <span className="text-[10px] lg:text-[11px] text-brand-accent uppercase tracking-wider font-bold mb-1">
                  {getCategoryName(item.categoryId)}
                </span>
                <h3 className="text-white font-serif text-sm lg:text-base font-medium leading-tight mb-1 line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-white/90 text-sm font-light">
                    {item.currency} {item.price.toFixed(0)}
                  </span>
                  {item.isSignature && (
                    <span className="material-icons-round text-brand-primary text-[10px]" title="Signature">
                      verified
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 pb-8 flex items-center justify-center gap-2">
          <p className="text-white/40 text-[10px]">Powered by</p>
          <img src="/Witrin logo branca.svg" alt="Witrin" className="h-3 opacity-40" />
        </div>
      </div>
    </div>
  );
};
