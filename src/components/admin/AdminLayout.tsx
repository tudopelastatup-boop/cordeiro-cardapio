import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { WitrinLogo } from '../shared/WitrinLogo';
import { PlanBadge } from './PlanBadge';

const NAV_ITEMS = [
  { to: '/admin', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/admin/settings', icon: 'settings', label: 'Configurações', end: false },
  { to: '/admin/menu', icon: 'restaurant_menu', label: 'Vitrine', end: false },
  { to: '/admin/qrcode', icon: 'qr_code', label: 'QR Code', end: false },
  { to: '/admin/plan', icon: 'workspace_premium', label: 'Plano', end: false },
];

export const AdminLayout: React.FC = () => {
  const { user, business, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-7 border-b border-white/5">
        <WitrinLogo variant="full" white className="w-full" />
      </div>

      {/* Business Info */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {business?.logoUrl ? (
            <img src={business.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {business?.name?.charAt(0) || 'W'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{business?.name || 'Minha Vitrine'}</p>
            <PlanBadge plan={business?.plan || 'free'} />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${isActive
                ? 'bg-white/10 text-white'
                : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5'
              }
            `}
          >
            <span className="material-icons-round text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Store Link & Logout */}
      <div className="p-3 border-t border-white/5 space-y-1">
        {business?.slug && (
          <a
            href={`/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-neutral-500 hover:text-neutral-200 hover:bg-white/5 transition-all"
          >
            <span className="material-icons-round text-xl">open_in_new</span>
            Ver minha vitrine
          </a>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-all w-full"
        >
          <span className="material-icons-round text-xl">logout</span>
          Sair
        </button>
      </div>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-neutral-600 truncate">{user?.email}</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-neutral-900/50 border-r border-white/5 fixed inset-y-0 left-0">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] h-full bg-neutral-900 flex flex-col shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <span className="material-icons-round">menu</span>
          </button>
          <WitrinLogo variant="small" white className="h-7" />
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 max-w-5xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
