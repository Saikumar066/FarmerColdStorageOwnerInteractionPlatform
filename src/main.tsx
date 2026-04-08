import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext'; // ✅ Import your AuthProvider
import './index.css';

createRoot(document.getElementById('root')!).render(
  <AuthProvider> {/* ✅ Wrap App inside AuthProvider */}
    <App />
  </AuthProvider>
);
