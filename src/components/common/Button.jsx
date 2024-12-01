import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({ 
  variant = 'primary', 
  isLoading, 
  children, 
  className = '', 
  disabled,
  ...props 
}) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300',
    secondary: 'bg-dark-100 text-gray-100 hover:bg-dark-200 disabled:bg-dark-300',
    outline: 'border-2 border-gray-700 text-gray-300 hover:bg-dark-100 disabled:bg-dark-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}