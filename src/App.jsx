import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import EpaperReader from './EpaperReader';
import AdminPanel from './components/AdminPanel';
import AdminGuard from './components/AdminGuard';
import { AuthProvider } from './context/AuthContext';
import { Lock } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Reader with Login Link */}
          <Route path="/" element={
            <>
              <EpaperReader />
              <Link
                to="/admin"
                className="fixed bottom-4 right-4 z-50 rounded-full bg-gray-800 p-3 text-white shadow-lg opacity-50 hover:opacity-100 transition-opacity"
                title="Admin Login"
              >
                <Lock size={16} />
              </Link>
            </>
          } />

          {/* Login Screen (using AdminPanel's logic) */}
          <Route path="/login" element={<AdminPanel onBack={() => window.location.href = '/'} />} />

          {/* Protected Admin Routing */}
          <Route
            path="/admin/*"
            element={
              <AdminGuard>
                <AdminPanel onBack={() => window.location.href = '/'} />
              </AdminGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
