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
      className={`
        glass rounded-xl shadow-premium p-6 sm:p-8
        transition-all-premium
        border border-white/50
        ${onClick ? 'cursor-pointer hover-lift hover-glow' : ''}
        ${className}
      `}
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-6 pb-4 border-b border-primary-100/50">
          <div className="flex-1">
            {typeof title === 'string' ? (
              <h2 className="text-xl sm:text-2xl font-bold text-gradient">{title}</h2>
            ) : (
              title
            )}
          </div>
          {headerActions && <div className="flex-shrink-0">{headerActions}</div>}
        </div>
      )}
      <div className="text-dark-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

