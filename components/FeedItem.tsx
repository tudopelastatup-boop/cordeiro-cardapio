import React, { useState } from 'react';
import { MenuItem } from '../types';

interface FeedItemProps {
  item: MenuItem;
  isActive: boolean;
}

export const FeedItem: React.FC<FeedItemProps> = ({ item, isActive }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format price to display nicely
  const formattedPrice = `${item.currency} ${item.price.toFixed(2)}`;

  return (
    <section className="relative w-full h-full snap-center flex items-center justify-center bg-gray-900 overflow-hidden shrink-0">
      
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0 select-none">
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
              width: '100vw',
              height: '177.77vw',
              minHeight: '100vh',
              minWidth: '56.25vh'
            }}
          />
        ) : (
          <img
            src={item.image}
            alt={item.title}
            className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}
          />
        )}
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30"></div>
      </div>

      {/* Content Container */}
      <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex flex-col justify-end pb-32 px-6">
        
        {/* Category Pill */}
        <div className="flex justify-start mb-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-semibold uppercase tracking-widest rounded-full">
            {item.category}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-serif font-bold text-white leading-tight drop-shadow-xl mb-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {item.title}
        </h2>

        {/* Description Section */}
        <div className="mb-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className={`text-white/80 text-sm font-sans font-light leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {item.description}
          </p>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-brand-gold text-xs font-semibold mt-1 uppercase tracking-wider hover:text-white transition-colors"
          >
            {isExpanded ? 'Ler menos' : 'Ler mais'}
          </button>
        </div>

        {/* Price Section - Highlighted */}
        <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
           <div className="text-2xl font-medium text-white font-serif tracking-wide border-l-2 border-brand-red pl-3">
             {formattedPrice}
           </div>
        </div>

      </div>
    </section>
  );
};