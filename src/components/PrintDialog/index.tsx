import React from 'react';
import DialogHeader from './DialogHeader';
import PrintPreview from './PrintPreview';
import DialogFooter from './DialogFooter';

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  previewUrl: string;
}

export default function PrintDialog({ isOpen, onClose, onPrint, previewUrl }: PrintDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto">
        <div className="p-6">
          <DialogHeader onClose={onClose} />
          <PrintPreview imageUrl={previewUrl} />
          <DialogFooter onClose={onClose} onPrint={onPrint} />
        </div>
      </div>
    </div>
  );
}