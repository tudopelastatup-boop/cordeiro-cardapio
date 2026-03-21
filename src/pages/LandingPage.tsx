import React from 'react';
import { Link } from 'react-router-dom';
import { WitrinLogo } from '../components/shared/WitrinLogo';
import { PLANS } from '../lib/constants';
import { PlanType } from '../types';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <WitrinLogo variant="full" className="h-8" />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-neutral-300 hover:text-white transition-colors px-4 py-2"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              className="text-sm bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-medium mb-8">
            <span className="material-icons-round text-sm">play_circle</span>
            Vitrine audiovisual
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
            Transforme sua vitrine em uma{' '}
            <span className="text-brand-primary">experiência visual</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Crie uma vitrine audiovisual com vídeos que despertam o desejo dos seus clientes.
            Para restaurantes, bares, cafeterias e qualquer negócio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 rounded-2xl font-medium text-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-icons-round">rocket_launch</span>
              Criar minha vitrine
            </Link>
            <Link
              to="/primecut"
              className="w-full sm:w-auto border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-2xl font-medium text-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-icons-round">visibility</span>
              Ver exemplo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif text-center mb-16">
            Por que usar o <span className="text-brand-primary">Witrin</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: 'videocam',
                title: 'Vídeos que vendem',
                desc: 'Seus pratos ganham vida com vídeos curtos que despertam o desejo do cliente.',
              },
              {
                icon: 'phone_iphone',
                title: 'Feed estilo TikTok',
                desc: 'Experiência de scroll vertical imersiva, otimizada para mobile.',
              },
              {
                icon: 'bolt',
                title: 'Pronto em minutos',
                desc: 'Cadastre seus itens, suba os vídeos e compartilhe o link. Simples assim.',
              },
            ].map((feat) => (
              <div key={feat.title} className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4">
                  <span className="material-icons-round text-brand-primary text-2xl">{feat.icon}</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif text-center mb-4">Planos</h2>
          <p className="text-neutral-400 text-center mb-12">Comece grátis, escale quando precisar</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.keys(PLANS) as PlanType[]).map((key) => {
              const plan = PLANS[key];
              const isPopular = key === 'plan_b';
              return (
                <div
                  key={key}
                  className={`relative p-6 rounded-2xl border transition-all ${
                    isPopular
                      ? 'bg-brand-primary/5 border-brand-primary/30 scale-105'
                      : 'bg-neutral-900/50 border-white/5 hover:border-white/10'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Popular
                    </div>
                  )}
                  <h3 className="text-lg font-medium text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-neutral-500 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-white">Grátis</span>
                    ) : (
                      <>
                        <span className="text-sm text-neutral-400">R$</span>
                        <span className="text-3xl font-bold text-white">{plan.price.toFixed(2).replace('.', ',')}</span>
                        <span className="text-sm text-neutral-400">/mês</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-300 mb-6">
                    <span className="material-icons-round text-brand-primary text-sm">videocam</span>
                    {plan.videoLimit} vídeos
                  </div>
                  <Link
                    to="/signup"
                    className={`block text-center py-3 rounded-xl text-sm font-medium transition-colors ${
                      isPopular
                        ? 'bg-brand-primary hover:bg-brand-primary/90 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-white'
                    }`}
                  >
                    {plan.price === 0 ? 'Começar grátis' : 'Assinar'}
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-neutral-600 mt-8">
            Cada vídeo pode ter até 5MB. Formatos aceitos: MP4, WebM, MOV.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <WitrinLogo variant="small" className="h-6 opacity-40" />
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} Witrin. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
