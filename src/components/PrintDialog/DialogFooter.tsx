import React from 'react';
import { Printer } from 'lucide-react';

interface DialogFooterProps {
  onClose: () => void;
  onPrint: () => void;
}

export default function DialogFooter({ onClose, onPrint }: DialogFooterProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
      >
        Anuluj
      </button>
      <button
        onClick={onPrint}
        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
      >
        <Printer className="w-4 h-4" />
        Drukuj mapę
      </button>
    </div>
  );
}