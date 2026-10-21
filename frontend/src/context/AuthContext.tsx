import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StartupIdea } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  activeIdea: StartupIdea | null;
  ideas: StartupIdea[];
  setActiveIdea: (idea: StartupIdea | null) => void;
  setIdeas: React.Dispatch<React.SetStateAction<StartupIdea[]>>;
  refreshUser: () => Promise<void>;
  refreshIdeas: () => Promise<StartupIdea[]>;
  login: (tokens: { access_token: string; refresh_token?: string }, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ideaproof_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ideaproof_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [activeIdea, setActiveIdeaState] = useState<StartupIdea | null>(null);
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);

  const setActiveIdea = (idea: StartupIdea | null) => {
    setActiveIdeaState(idea);
    if (idea) {
      localStorage.setItem('ideaproof_active_idea_id', idea.id);
    } else {
      localStorage.removeItem('ideaproof_active_idea_id');
    }
  };

  const login = (tokens: { access_token: string; refresh_token?: string }, newUser: User) => {
    localStorage.setItem('ideaproof_token', tokens.access_token);
    localStorage.setItem('ideaproof_user', JSON.stringify(newUser));
    setToken(tokens.access_token);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('ideaproof_token');
    localStorage.removeItem('ideaproof_user');
    localStorage.removeItem('ideaproof_active_idea_id');
    setToken(null);
    setUser(null);
    setActiveIdeaState(null);
    setIdeas([]);
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      setUser(res.user);
      localStorage.setItem('ideaproof_user', JSON.stringify(res.user));
    } catch (e) {
      console.warn('Failed to refresh user:', e);
    }
  };

  const refreshIdeas = async (): Promise<StartupIdea[]> => {
    try {
      const res = await api.ideas.list();
      const list: StartupIdea[] = res.ideas || [];
      setIdeas(list);

      // Restore active idea from local storage or pick first
      const savedActiveId = localStorage.getItem('ideaproof_active_idea_id');
      const found = list.find((i) => i.id === savedActiveId);
      if (found) {
        setActiveIdeaState(found);
      } else if (list.length > 0 && !activeIdea) {
        setActiveIdeaState(list[0]);
        localStorage.setItem('ideaproof_active_idea_id', list[0].id);
      }
      return list;
    } catch (e) {
      console.warn('Failed to load ideas:', e);
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          await refreshUser();
          await refreshIdeas();
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    init();

    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        activeIdea,
        ideas,
        setActiveIdea,
        setIdeas,
        refreshUser,
        refreshIdeas,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
