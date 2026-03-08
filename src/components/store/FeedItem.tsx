import React, { useState, useRef, useEffect } from 'react';
import { MenuItem } from '../../types';

interface FeedItemProps {
  item: MenuItem;
  isActive: boolean;
  categoryName?: string;
}

export const FeedItem: React.FC<FeedItemProps> = ({ item, isActive, categoryName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formattedPrice = `${item.currency} ${item.price.toFixed(2)}`;

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  return (
    <section className="relative w-full h-full snap-center flex items-center justify-center bg-black overflow-hidden shrink-0">
      {/* Video/Image background */}
      <div className="absolute inset-0 z-0 select-none">
        {item.videoUrl ? (
          <video
            ref={videoRef}
            src={item.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={item.image}
            alt={item.title}
            className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/30" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex flex-col justify-end pb-32 md:pb-24 px-6">
        <div className="flex justify-start mb-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-semibold uppercase tracking-widest rounded-full">
            {categoryName || item.categoryId}
          </span>
        </div>

        <h2 className="text-3xl font-serif font-bold text-white leading-tight drop-shadow-xl mb-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {item.title}
        </h2>

        <div className="mb-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className={`text-white/80 text-sm font-sans font-light leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {item.description}
          </p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-brand-accent text-xs font-semibold mt-1 uppercase tracking-wider hover:text-white transition-colors"
          >
            {isExpanded ? 'Ler menos' : 'Ler mais'}
          </button>
        </div>

        <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-2xl font-medium text-white font-serif tracking-wide border-l-2 border-brand-primary pl-3">
            {formattedPrice}
          </div>
        </div>
      </div>
    </section>
  );
};
