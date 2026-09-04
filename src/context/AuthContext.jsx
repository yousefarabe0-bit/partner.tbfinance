import { createContext, useContext, useState } from 'react';

const CREDENTIALS = [
  { email: 'contato@tbfinance.com.br', password: 'Allahwahed1@', user: { name: 'Ricardo Silva', initials: 'RS', role: 'partner' } },
  { email: 'admin@tb.com', password: 'admin2025', user: { name: 'Administrador', initials: 'AD', role: 'admin' } },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    const match = CREDENTIALS.find(
      c => c.email === email.trim().toLowerCase() && c.password === password
    );
    if (!match) return { success: false, error: 'E-mail ou senha inválidos.' };
    setUser(match.user);
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, role: user?.role ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
