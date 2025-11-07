import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-all-premium focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden group';
  
  const variants = {
    primary: `
      bg-gradient-to-r from-primary-600 to-primary-700 
      text-white 
      hover:from-primary-700 hover:to-primary-800 
      focus:ring-primary-500
      shadow-lg shadow-primary-500/30
      hover:shadow-xl hover:shadow-primary-500/40
      hover:scale-105
      active:scale-100
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    `,
    secondary: `
      bg-gradient-to-r from-dark-600 to-dark-700 
      text-white 
      hover:from-dark-700 hover:to-dark-800 
      focus:ring-dark-500
      shadow-lg shadow-dark-500/20
      hover:shadow-xl hover:shadow-dark-500/30
      hover:scale-105
      active:scale-100
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 
      text-white 
      hover:from-red-700 hover:to-red-800 
      focus:ring-red-500
      shadow-lg shadow-red-500/30
      hover:shadow-xl hover:shadow-red-500/40
      hover:scale-105
      active:scale-100
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    `,
    outline: `
      border-2 border-primary-600 
      text-primary-700 
      bg-white/80 backdrop-blur-sm
      hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 
      hover:border-primary-700
      focus:ring-primary-500
      hover:scale-105
      active:scale-100
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    `,
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </span>
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
      )}
    </button>
  );
}

