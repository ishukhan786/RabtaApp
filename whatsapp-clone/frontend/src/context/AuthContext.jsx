import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('rabta_token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('rabta_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  function login(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('rabta_user', JSON.stringify(nextUser));
    localStorage.setItem('rabta_token', nextToken);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rabta_user');
    localStorage.removeItem('rabta_token');
  }

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
