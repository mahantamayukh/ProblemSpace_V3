import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';

export interface UserProfile {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  oauthToken: string | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  oauthToken: null,
  login: () => {},
  logout: () => {},
  isLoading: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('ps-user-profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [oauthToken, setOauthToken] = useState<string | null>(
    () => localStorage.getItem('ps-oauth-token')
  );

  const [isLoading, setIsLoading] = useState(false);

  const clearSession = useCallback(() => {
    setUser(null);
    setOauthToken(null);
    localStorage.removeItem('ps-user-profile');
    localStorage.removeItem('ps-oauth-token');
  }, []);

  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Token invalid or expired');
      const profile: UserProfile = await res.json();
      setUser(profile);
      localStorage.setItem('ps-user-profile', JSON.stringify(profile));
    } catch (err) {
      console.error('Google profile fetch failed — clearing session:', err);
      clearSession();
    }
  }, [clearSession]);

  // Validate stored token on mount
  useEffect(() => {
    if (oauthToken && !user) {
      fetchUserProfile(oauthToken);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setIsLoading(true);
      const token = response.access_token;
      setOauthToken(token);
      localStorage.setItem('ps-oauth-token', token);
      await fetchUserProfile(token);
      setIsLoading(false);
    },
    onError: (err) => {
      console.error('Google login failed:', err);
      setIsLoading(false);
    },
    scope: 'email profile openid',
  });

  const logout = useCallback(() => {
    googleLogout();
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user && !!oauthToken,
        user,
        oauthToken,
        login: triggerLogin,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
