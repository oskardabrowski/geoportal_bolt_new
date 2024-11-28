import React from 'react';
import { Map } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md px-4 py-2">
      <div className="flex items-center gap-2">
        <Map className="w-6 h-6 text-green-600" />
        <span className="text-lg font-semibold text-gray-800">Testowy Geoportal Toruń</span>
      </div>
    </nav>
  );
}