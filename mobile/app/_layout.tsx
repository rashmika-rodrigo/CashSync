import { Slot } from 'expo-router';
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext<any>(null);
export const useSimpleAuth = () => useContext(AuthContext);

export default function RootLayout() {
  const [user, setUser] = useState<string | null>(null);

  // holds the active user.
  const login = (username: string) => setUser(username);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Slot />
    </AuthContext.Provider>
  );
}