import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './screens/Home';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Admin from './screens/Admin';
import AdminLogin from './screens/AdminLogin';
import Recomendacoes from './screens/Recomendacoes';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recomendacoes" element={<Recomendacoes />} />
        {/* Rota discreta de acesso admin */}
        <Route path="/tbf-admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="partner"><Dashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
