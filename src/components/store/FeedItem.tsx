import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MenuItem } from '../../types';

type VideoOrientation = 'vertical' | 'horizontal' | 'square';

interface FeedItemProps {
  item: MenuItem;
  isActive: boolean;
  categoryName?: string;
}

export const FeedItem: React.FC<FeedItemProps> = ({ item, isActive, categoryName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [orientation, setOrientation] = useState<VideoOrientation>('vertical');
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const formattedPrice = `${item.currency} ${item.price.toFixed(2)}`;
  const hasVariants = item.variants && item.variants.length > 0;

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const { videoWidth, videoHeight } = video;
    if (videoWidth > videoHeight * 1.2) {
      setOrientation('horizontal');
    } else if (Math.abs(videoWidth - videoHeight) / Math.max(videoWidth, videoHeight) < 0.2) {
      setOrientation('square');
    } else {
      setOrientation('vertical');
    }
  }, []);

  // Play/pause based on isActive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive]);

  // Also play when video data becomes ready
  const handleCanPlay = useCallback(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isActive]);

  // Fullscreen: request on the section element so the whole UI goes fullscreen
  const handleFullscreen = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (section.requestFullscreen) {
      section.requestFullscreen().catch((e) => console.warn('Fullscreen failed:', e));
    } else if ((section as any).webkitRequestFullscreen) {
      (section as any).webkitRequestFullscreen();
    }
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-full snap-center flex items-center justify-center bg-black overflow-hidden shrink-0">
      {/* Video/Image background */}
      <div className="absolute inset-0 z-0 select-none">
        {item.videoUrl ? (
          <>
            {orientation === 'horizontal' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                <video
                  src={item.videoUrl}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110"
                />
                <video
                  ref={videoRef}
                  src={item.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onLoadedMetadata={handleLoadedMetadata}
                  onCanPlay={handleCanPlay}
                  className="relative w-full max-h-[50vh] object-contain z-10"
                />
              </div>
            ) : orientation === 'square' ? (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <video
                  src={item.videoUrl}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110"
                />
                <video
                  ref={videoRef}
                  src={item.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onLoadedMetadata={handleLoadedMetadata}
                  onCanPlay={handleCanPlay}
                  className="relative w-full max-h-[70vh] object-contain z-10"
                />
              </div>
            ) : (
              <video
                ref={videoRef}
                src={item.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={handleCanPlay}
                className="w-full h-full object-cover"
              />
            )}
          </>
        ) : (
          <img
            src={item.image}
            alt={item.title}
            className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/30 z-20" />
      </div>

      {/* Fullscreen button for horizontal videos */}
      {item.videoUrl && orientation === 'horizontal' && (
        <button
          onClick={handleFullscreen}
          className="absolute top-20 right-4 z-30 flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-medium active:scale-95 transition-transform"
        >
          <span className="material-icons-round text-base">fullscreen</span>
          Tela cheia
        </button>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 top-0 z-30 flex flex-col justify-end pb-32 md:pb-24 px-6">
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
          {item.description && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-brand-accent text-xs font-semibold mt-1 uppercase tracking-wider hover:text-white transition-colors"
            >
              {isExpanded ? 'Ler menos' : 'Ler mais'}
            </button>
          )}
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {hasVariants ? (
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                <span className="text-[10px] text-white/60 uppercase tracking-wider block">Base</span>
                <span className="text-lg font-medium text-white font-serif">{formattedPrice}</span>
              </div>
              {item.variants!.map(v => (
                <div key={v.id} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                  <span className="text-[10px] text-white/60 uppercase tracking-wider block">{v.name}</span>
                  <span className="text-lg font-medium text-white font-serif">{item.currency} {v.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-2xl font-medium text-white font-serif tracking-wide border-l-2 border-brand-primary pl-3">
                {formattedPrice}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
