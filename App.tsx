import React, { useState, useRef, useEffect } from 'react';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { FeedItem } from './components/FeedItem';
import { MenuListView } from './components/MenuListView';
import { RestaurantProfile } from './components/RestaurantProfile';
import { MENU_ITEMS } from './constants';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('list'); // Default to List view
  const [activeIndex, setActiveIndex] = useState(0);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  // Handle intersection observer to detect active slide in Feed view
  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container || activeTab !== 'feed') return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip updating if we are scrolling programmatically (clicking from menu)
        if (isProgrammaticScroll.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    const children = container.querySelectorAll('.snap-center');
    children.forEach((child) => observer.observe(child));

    return () => {
      children.forEach((child) => observer.unobserve(child));
    };
  }, [activeTab]);

  // Handle syncing scroll position when switching to Feed tab
  useEffect(() => {
    if (activeTab === 'feed' && feedContainerRef.current) {
      isProgrammaticScroll.current = true;
      const targetElement = feedContainerRef.current.children[activeIndex];
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'auto' });
      }

      // Re-enable observer updates after scroll finishes
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);
    }
  }, [activeTab]); // Removed activeIndex from dependency to prevent scroll loops

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    setActiveTab('feed');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'list':
        return <MenuListView onItemClick={handleItemClick} />;
      case 'info':
        return <RestaurantProfile />;
      case 'feed':
        return (
          <main
            ref={feedContainerRef}
            className="w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth bg-black"
          >
            {MENU_ITEMS.map((item, index) => (
              <div key={item.id} data-index={index} className="w-full h-full">
                <FeedItem item={item} isActive={index === activeIndex} />
              </div>
            ))}
            {/* Overscroll buffer */}
            <div className="h-1 w-full snap-start"></div>
          </main>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden">
      {/* Top Header - Visible on List and Feed */}
      {activeTab !== 'info' && <TopHeader />}

      {/* Main Content Area */}
      <div className="w-full h-full">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;