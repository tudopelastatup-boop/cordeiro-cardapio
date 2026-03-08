import React from 'react';

interface WitrinLogoProps {
  variant?: 'full' | 'small';
  className?: string;
  white?: boolean;
}

export const WitrinLogo: React.FC<WitrinLogoProps> = ({ variant = 'full', className = '', white = false }) => {
  const src = white
    ? '/Witrin logo branca.svg'
    : variant === 'full'
      ? '/Witrin logo completa.svg'
      : '/Witrin logo pequena.svg';
  return (
    <img
      src={src}
      alt="Witrin"
      className={className}
    />
  );
};
