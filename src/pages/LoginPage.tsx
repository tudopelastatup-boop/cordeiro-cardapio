import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { WitrinLogo } from '../components/shared/WitrinLogo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Navega para /admin assim que o contexto confirmar o usuário logado
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/admin', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Navegação feita pelo useEffect acima quando isLoading virar false
    } catch {
      setError('Credenciais inválidas.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <WitrinLogo white className="h-10" />
        </div>

        {/* Card */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-8">
          <h1 className="text-2xl font-serif text-white text-center mb-2">Bem-vindo de volta</h1>
          <p className="text-sm text-neutral-400 text-center mb-8">Entre na sua conta para gerenciar seu cardápio</p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="••••••••"
              />
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
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Não tem conta?{' '}
          <Link to="/signup" className="text-white hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
};
