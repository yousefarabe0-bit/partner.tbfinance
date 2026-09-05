import { createContext, useContext, useState } from 'react';

const CREDENTIALS = [
  {
    email: 'contato@tbfinance.com.br',
    password: 'Allahwahed1@',
    user: { name: 'Yousef', initials: 'YS', role: 'admin' }
  },
  {
    email: 'yousefarabe0@gmail.com',
    password: 'Allahwahed1@',
    user: { name: 'Yousef Teste', initials: 'YT', role: 'partner' }
  },
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
    return { success: true, user: match.user };
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
