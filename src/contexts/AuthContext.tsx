import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { User, Business, PlanType } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  business: Business | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, businessName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateBusiness: (data: Partial<Business>) => void;
  changePlan: (plan: PlanType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchBusiness(userId: string): Promise<Business | null> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      ownerId: data.owner_id,
      slug: data.slug,
      name: data.name,
      slogan: data.slogan ?? undefined,
      logoUrl: data.logo_url ?? undefined,
      coverImageUrl: data.cover_image_url ?? undefined,
      address: data.address ?? undefined,
      phone: data.phone ?? undefined,
      whatsapp: data.whatsapp ?? undefined,
      instagram: data.instagram ?? undefined,
      hours: data.hours ?? undefined,
      menuUrl: data.menu_url ?? undefined,
      plan: data.plan,
      planExpiresAt: data.plan_expires_at ?? undefined,
      primaryColor: data.primary_color,
      accentColor: data.accent_color,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    business: null,
    isLoading: true,
  });

  // Usado para evitar setState após desmontagem
  const mountedRef = useRef(true);
  // Evita processar dois eventos simultâneos
  const processingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function handleSession(userId: string, userEmail: string, userName: string, isSignup: boolean) {
      if (processingRef.current) return;
      processingRef.current = true;

      let business = await fetchBusiness(userId);

      // No signup o trigger do banco pode demorar um pouco
      if (!business && isSignup) {
        for (let i = 0; i < 5; i++) {
          await new Promise(r => setTimeout(r, 600));
          business = await fetchBusiness(userId);
          if (business) break;
        }
      }

      processingRef.current = false;

      if (!mountedRef.current) return;

      setState({
        user: { id: userId, email: userEmail, name: userName },
        business,
        isLoading: false,
      });
    }

    // 1. Checa sessão atual de forma síncrona ao montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;

      if (!session?.user) {
        setState({ user: null, business: null, isLoading: false });
        return;
      }

      handleSession(
        session.user.id,
        session.user.email ?? '',
        session.user.user_metadata?.name ?? '',
        false,
      );
    });

    // 2. Escuta apenas eventos pós-mount (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // INITIAL_SESSION já tratado pelo getSession acima
      if (event === 'INITIAL_SESSION') return;

      if (!session?.user) {
        if (mountedRef.current) {
          setState({ user: null, business: null, isLoading: false });
        }
        return;
      }

      handleSession(
        session.user.id,
        session.user.email ?? '',
        session.user.user_metadata?.name ?? '',
        event === 'SIGNED_IN',
      );
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, businessName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, business_name: businessName } },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateBusiness = useCallback((data: Partial<Business>) => {
    setState(s => ({
      ...s,
      business: s.business ? { ...s.business, ...data } : null,
    }));
  }, []);

  const changePlan = useCallback(async (plan: PlanType) => {
    const bizId = state.business?.id;
    if (!bizId) throw new Error('Nenhum negócio encontrado');
    const { error } = await supabase
      .from('businesses')
      .update({ plan })
      .eq('id', bizId);
    if (error) throw error;
    setState(s => ({
      ...s,
      business: s.business ? { ...s.business, plan } : null,
    }));
  }, [state.business?.id]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateBusiness, changePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
