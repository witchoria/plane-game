'use client';

import { ReactNode } from 'react';

export default function BottomSheet({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!isOpen) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 pb-8"
        style={{ zIndex: 1000, opacity: 1, backgroundColor: '#ffffff' }}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <p className="text-center text-gray-600 text-lg">Tap a plane to start playing</p>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 pb-8 max-h-[70vh] overflow-y-auto"
      style={{ zIndex: 1000, opacity: 1, backgroundColor: '#ffffff' }}
    >
      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
      >
        ✕
      </button>
      {children}
    </div>
  );
}