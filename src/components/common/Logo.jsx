import React from 'react';

export function Logo({ className = '', size = 24 }) {
  return (
    <img 
      src="/logo.svg"
      alt="Based Bases"
      width={size}
      height={size}
      className={`${className} transition-transform hover:scale-105`}
      style={{ filter: 'drop-shadow(0 0 10px rgba(108, 42, 255, 0.3))' }}
    />
  );
}