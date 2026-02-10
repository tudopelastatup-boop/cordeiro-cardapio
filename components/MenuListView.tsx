import React from 'react';
import { MENU_ITEMS } from '../constants';

interface MenuListViewProps {
  onItemClick: (index: number) => void;
}

export const MenuListView: React.FC<MenuListViewProps> = ({ onItemClick }) => {
  return (
    <div className="w-full h-full pt-20 pb-32 px-4 overflow-y-auto no-scrollbar bg-black">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6 px-1">
        <h2 className="text-xl text-white font-serif tracking-wide">Catálogo</h2>
      </div>

      {/* Video Grid Layout */}
      <div className="grid grid-cols-2 gap-4">
        {MENU_ITEMS.map((item, index) => (
          <button 
            key={item.id} 
            onClick={() => onItemClick(index)}
            className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 active:scale-95 transition-transform duration-200 text-left focus:outline-none cursor-pointer"
          >
            
            {/* Video Container */}
            <div className="absolute inset-0">
              {item.video ? (
                <iframe
                  src={`https://www.youtube.com/embed/${item.video}?autoplay=1&mute=1&loop=1&playlist=${item.video}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                  allow="autoplay; encrypted-media"
                  className="w-full h-full object-cover pointer-events-none"
                  style={{
                    border: 'none',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) scale(1.5)',
                    width: '100%',
                    height: '177.77%',
                    minHeight: '100%',
                    minWidth: '56.25%'
                  }}
                />
              ) : (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Dark Gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            </div>

            {/* Content Overlay (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end h-full">
              <span className="text-[10px] text-brand-gold uppercase tracking-wider font-bold mb-1">
                {item.category}
              </span>
              <h3 className="text-white font-serif text-sm font-medium leading-tight mb-1 line-clamp-2">
                {item.title}
              </h3>
              <div className="flex justify-between items-center mt-1">
                 <span className="text-white/90 text-sm font-light">
                   {item.currency} {item.price.toFixed(0)}
                 </span>
                 {item.isSignature && (
                   <span className="material-icons-round text-brand-red text-[10px]" title="Signature">
                     verified
                   </span>
                 )}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-12 text-center pb-8">
        <div className="inline-block w-1 h-1 bg-white/20 rounded-full mx-1"></div>
        <div className="inline-block w-1 h-1 bg-white/20 rounded-full mx-1"></div>
        <div className="inline-block w-1 h-1 bg-white/20 rounded-full mx-1"></div>
      </div>
    </div>
  );
};