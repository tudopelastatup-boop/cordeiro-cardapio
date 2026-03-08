import React from 'react';
import { Link } from 'react-router-dom';
import { WitrinLogo } from '../components/shared/WitrinLogo';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-center px-6">
      <WitrinLogo variant="small" className="h-10 mb-8 opacity-30" />
      <h1 className="text-6xl font-serif font-bold text-white mb-4">404</h1>
      <p className="text-neutral-400 text-lg mb-8">Página não encontrada</p>
      <Link
        to="/"
        className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  );
};
