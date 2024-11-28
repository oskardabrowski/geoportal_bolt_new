import React from 'react';
import { X } from 'lucide-react';

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  previewUrl: string;
}

export default function PrintDialog({ isOpen, onClose, onPrint, previewUrl }: PrintDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Podgląd wydruku</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="border rounded-lg p-2 mb-4">
          <img
            src={previewUrl}
            alt="Map preview"
            className="w-full h-auto"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Anuluj
          </button>
          <button
            onClick={onPrint}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Drukuj
          </button>
        </div>
      </div>
    </div>
  );
}