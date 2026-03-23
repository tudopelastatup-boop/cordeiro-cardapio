import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';
import { TopHeader } from '../components/store/TopHeader';
import { BottomNav } from '../components/store/BottomNav';
import { FeedItem } from '../components/store/FeedItem';
import { MenuListView } from '../components/store/MenuListView';
import { RestaurantProfile } from '../components/store/RestaurantProfile';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Tab, MenuItem } from '../types';

export const StorePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { business, menuItems, categories, isLoading, error } = useBusiness(slug);

  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenItem, setFullscreenItem] = useState<MenuItem | null>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  // Persistent scroll positions — survive tab switches since refs don't reset
  const listScrollTop = useRef(0);
  const infoScrollTop = useRef(0);

  // Set page title: "Nome do Cliente - Witrin"
  useEffect(() => {
    if (business?.name) {
      document.title = `${business.name} - Witrin`;
    }
    return () => { document.title = 'Witrin'; };
  }, [business?.name]);

  // Feed: detect which item is most visible via IntersectionObserver
  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container || activeTab !== 'feed') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
            best = entry;
          }
        }
        if (best) {
          const index = Number(best.target.getAttribute('data-index'));
          if (!isNaN(index)) setActiveIndex(index);
        }
      },
      { root: container, threshold: [0.1, 0.5, 0.8] }
    );

    const children = container.querySelectorAll('[data-index]');
    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [activeTab]);

  // Feed: jump instantly to the selected item (no smooth scroll)
  useEffect(() => {
    if (activeTab === 'feed' && feedContainerRef.current) {
      isProgrammaticScroll.current = true;
      const targetElement = feedContainerRef.current.children[activeIndex];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'instant' });
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isProgrammaticScroll.current = false;
        });
      });
    }
  }, [activeTab]);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    setActiveTab('feed');
  };

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  if (isLoading) {
    return (
      <div className="w-full h-dvh bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="w-full h-dvh bg-black flex flex-col items-center justify-center text-center px-6">
        <span className="material-icons-round text-5xl text-neutral-700 mb-4">storefront</span>
        <h1 className="text-xl font-serif text-white mb-2">Loja não encontrada</h1>
        <p className="text-neutral-400 text-sm">O link que você acessou não existe ou foi removido.</p>
      </div>
    );
  }

  const windowSize = 2;

  const renderContent = () => {
    switch (activeTab) {
      case 'list':
        return (
          <MenuListView
            items={menuItems}
            categories={categories}
            business={business}
            onItemClick={handleItemClick}
            savedScrollTop={listScrollTop}
          />
        );
      case 'info':
        return <RestaurantProfile business={business} savedScrollTop={infoScrollTop} />;
      case 'feed':
        return (
          <div className="w-full h-dvh bg-black flex items-center justify-center">
            <main
              ref={feedContainerRef}
              className="w-full h-full md:h-dvh md:max-h-dvh md:aspect-9/16 md:max-w-[calc(100dvh*9/16)] overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black md:rounded-2xl md:border md:border-white/10"
            >
              {menuItems.map((item, index) => {
                const isNearby = Math.abs(index - activeIndex) <= windowSize;
                return (
                  <div key={item.id} data-index={index} className="w-full h-full snap-center">
                    {isNearby ? (
                      <FeedItem
                        item={item}
                        isActive={index === activeIndex}
                        categoryName={getCategoryName(item.categoryId)}
                        onFullscreen={() => setFullscreenItem(item)}
                      />
                    ) : (
                      <div className="w-full h-full bg-black" />
                    )}
                  </div>
                );
              })}
              <div className="h-1 w-full snap-start" />
            </main>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden">
      {activeTab !== 'info' && <TopHeader businessName={business.name} />}
      <div className="w-full h-full">{renderContent()}</div>
      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Fullscreen video modal - portal to body so nothing blocks it */}
      {fullscreenItem && fullscreenItem.videoUrl && createPortal(
        <VideoFullscreenModal
          item={fullscreenItem}
          onClose={() => setFullscreenItem(null)}
        />,
        document.body
      )}
    </div>
  );
};

// Modal component - completely independent, renders on top of everything
const VideoFullscreenModal: React.FC<{
  item: MenuItem;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVariants = item.variants && item.variants.length > 0;
  const formattedPrice = `${item.currency} ${item.price.toFixed(2)}`;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    videoRef.current?.play().catch(() => {});
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <video
        ref={videoRef}
        src={item.videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-11 h-11 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
      >
        <span className="material-icons-round">close</span>
      </button>

      <div
        className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 via-black/40 to-transparent pointer-events-none"
      >
        <h2 className="text-xl font-serif font-bold text-white mb-1">{item.title}</h2>
        <div className="text-white font-serif">
          {hasVariants ? (
            <div className="flex flex-wrap gap-3">
              <span className="text-sm opacity-70">Base: {formattedPrice}</span>
              {item.variants!.map(v => (
                <span key={v.id} className="text-sm opacity-70">
                  {v.name}: {item.currency} {v.price.toFixed(2)}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-lg">{formattedPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
};
