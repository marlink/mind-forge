import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  onClick?: () => void;
}

export function Card({ title, children, className = '', headerActions, onClick }: CardProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

