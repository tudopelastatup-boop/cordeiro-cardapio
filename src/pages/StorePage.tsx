import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';
import { TopHeader } from '../components/store/TopHeader';
import { BottomNav } from '../components/store/BottomNav';
import { FeedItem } from '../components/store/FeedItem';
import { MenuListView } from '../components/store/MenuListView';
import { RestaurantProfile } from '../components/store/RestaurantProfile';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Tab } from '../types';

export const StorePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { business, menuItems, categories, isLoading, error } = useBusiness(slug);

  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [activeIndex, setActiveIndex] = useState(0);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container || activeTab !== 'feed') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) setActiveIndex(index);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    const children = container.querySelectorAll('.snap-center');
    children.forEach((child) => observer.observe(child));
    return () => children.forEach((child) => observer.unobserve(child));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'feed' && feedContainerRef.current) {
      isProgrammaticScroll.current = true;
      const targetElement = feedContainerRef.current.children[activeIndex];
      if (targetElement) targetElement.scrollIntoView({ behavior: 'auto' });
      setTimeout(() => { isProgrammaticScroll.current = false; }, 500);
    }
  }, [activeTab]);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    setActiveTab('feed');
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  if (isLoading) {
    return (
      <div className="w-full h-[100dvh] bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="w-full h-[100dvh] bg-black flex flex-col items-center justify-center text-center px-6">
        <span className="material-icons-round text-5xl text-neutral-700 mb-4">storefront</span>
        <h1 className="text-xl font-serif text-white mb-2">Loja não encontrada</h1>
        <p className="text-neutral-400 text-sm">O link que você acessou não existe ou foi removido.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'list':
        return (
          <MenuListView
            items={menuItems}
            categories={categories}
            onItemClick={handleItemClick}
          />
        );
      case 'info':
        return <RestaurantProfile business={business} />;
      case 'feed':
        return (
          <div className="w-full h-[100dvh] bg-black flex items-center justify-center">
            <main
              ref={feedContainerRef}
              className="w-full h-full md:h-[100dvh] md:max-h-[100dvh] md:aspect-9/16 md:max-w-[calc(100dvh*9/16)] overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth bg-black md:rounded-2xl md:border md:border-white/10"
            >
              {menuItems.map((item, index) => (
                <div key={item.id} data-index={index} className="w-full h-full snap-center">
                  <FeedItem
                    item={item}
                    isActive={index === activeIndex}
                    categoryName={getCategoryName(item.categoryId)}
                  />
                </div>
              ))}
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
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
