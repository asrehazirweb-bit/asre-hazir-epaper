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
          <Route path="/" element={<EpaperReader />} />

          {/* Login Screen (using AdminPanel's logic) */}
          <Route path="/login" element={<AdminPanel onBack={() => window.location.href = '/'} />} />

          {/* Protected Admin Routing (Bypassed for testing) */}
          <Route
            path="/admin/*"
            element={
              <AdminPanel onBack={() => window.location.href = '/'} />
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
