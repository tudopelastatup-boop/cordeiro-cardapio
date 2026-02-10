import React from 'react';
import { RESTAURANT_INFO } from '../constants';

export const TopHeader: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 pt-12 pb-6 px-6 flex justify-center items-center bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
      <h1 className="text-xl font-serif tracking-[0.2em] font-bold text-white drop-shadow-lg">
        {RESTAURANT_INFO.name}
      </h1>
    </div>
  );
};