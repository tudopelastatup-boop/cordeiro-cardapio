import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { WitrinLogo } from '../components/shared/WitrinLogo';
import { slugify } from '../utils/slugify';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Navega para /admin assim que o contexto confirmar o usuário logado
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/admin', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const slug = businessName ? slugify(businessName) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !businessName) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signup(name, email, password, businessName);
      // Navegação feita pelo useEffect acima quando isLoading virar false
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <WitrinLogo white className="h-10" />
        </div>

        {/* Card */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-8">
          <h1 className="text-2xl font-serif text-white text-center mb-2">Crie sua conta</h1>
          <p className="text-sm text-neutral-400 text-center mb-8">Comece grátis com 5 vídeos</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Seu nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                placeholder="João Silva"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Nome do negócio</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Meu Restaurante"
              />
              {slug && (
                <p className="mt-1.5 text-xs text-neutral-500">
                  Seu link: <span className="text-white">witrin.com/{slug}</span>
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <span className="material-icons-round text-sm">error</span>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white hover:bg-neutral-200 disabled:opacity-50 text-black py-3.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                'Criar conta grátis'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-white hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
};
