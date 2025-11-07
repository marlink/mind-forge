'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={title ? "modal-title" : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay with premium backdrop blur */}
        <div
          className="fixed inset-0 bg-gradient-to-br from-dark-900/80 via-dark-800/70 to-dark-900/80 backdrop-blur-md transition-opacity animate-in fade-in"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom glass rounded-2xl text-left overflow-hidden shadow-premium-xl transform transition-all sm:my-8 sm:align-middle w-full sm:w-full animate-in scale-in border border-white/20">
          <div className={`px-6 pt-6 pb-6 sm:p-8 ${sizes[size]} mx-auto`}>
            {title && (
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-primary-100/50">
                <h3 className="text-2xl sm:text-3xl font-bold text-gradient" id="modal-title">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-dark-400 hover:text-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl p-2 transition-all-premium hover:bg-dark-100/50 hover:scale-110"
                  aria-label="Close modal"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
            <div className="mt-6 sm:mt-8 text-dark-700">{children}</div>
            {footer && (
              <div className="mt-8 sm:mt-10 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-primary-100/30">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

