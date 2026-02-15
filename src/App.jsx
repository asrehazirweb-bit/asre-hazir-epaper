import React, { useState } from 'react';
import EpaperReader from './EpaperReader';
import AdminPanel from './components/AdminPanel';
import { Lock } from 'lucide-react';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  if (isAdminMode) {
    return <AdminPanel onBack={() => setIsAdminMode(false)} />;
  }

  return (
    <>
      <EpaperReader />
      <button
        onClick={() => setIsAdminMode(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-gray-800 p-3 text-white shadow-lg opacity-50 hover:opacity-100 transition-opacity"
        title="Admin Login"
      >
        <Lock size={16} />
      </button>
    </>
  )
}

export default App
