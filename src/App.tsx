import React from 'react';
import Scanner from './components/Scanner';
import ScannedList from './components/ScannedList';
import Collections from './components/Collections';
import { ScanLine } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Lorcana Card Scanner</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Scanner />
            <ScannedList />
          </div>
          <div>
            <Collections />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;