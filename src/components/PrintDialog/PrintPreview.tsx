import React from 'react';

interface PrintPreviewProps {
  imageUrl: string;
}

export default function PrintPreview({ imageUrl }: PrintPreviewProps) {
  return (
    <div className="relative border rounded-lg p-2 mb-4 bg-gray-50">
      <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMC8yOS8xMiKqq3kAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzVxteM2AAAAHklEQVQ4jWNgYGBgYHjy5Ml/hitXrvxnANPEQIYBAKSjBi/1Nq7/AAAAAElFTkSuQmCC')]" />
      <img
        src={imageUrl}
        alt="Map preview"
        className="relative w-full h-auto shadow-lg"
      />
      <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded shadow text-sm">
        Format A4 - Poziomy
      </div>
    </div>
  );
}