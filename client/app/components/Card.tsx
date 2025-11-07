import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ title, children, className = '', headerActions, onClick, style }: CardProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-4 sm:p-6 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-lg' : ''
      } ${className}`}
      onClick={onClick}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {title && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4">
          <div className="flex-1">{typeof title === 'string' ? <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2> : title}</div>
          {headerActions && <div className="flex-shrink-0">{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

