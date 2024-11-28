import React from 'react';
import { X } from 'lucide-react';

interface DialogHeaderProps {
  onClose: () => void;
}

export default function DialogHeader({ onClose }: DialogHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4 pb-3 border-b">
      <h2 className="text-xl font-semibold text-gray-800">Podgląd wydruku</h2>
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Zamknij"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}