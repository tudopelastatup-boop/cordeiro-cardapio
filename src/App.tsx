import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { StorePage } from './pages/StorePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { StoreSettingsPage } from './pages/admin/StoreSettingsPage';
import { MenuItemsPage } from './pages/admin/MenuItemsPage';
import { MenuItemFormPage } from './pages/admin/MenuItemFormPage';
import { PlanPage } from './pages/admin/PlanPage';
import { QRCodePage } from './pages/admin/QRCodePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/settings" element={<StoreSettingsPage />} />
              <Route path="/admin/menu" element={<MenuItemsPage />} />
              <Route path="/admin/menu/:id" element={<MenuItemFormPage />} />
              <Route path="/admin/plan" element={<PlanPage />} />
              <Route path="/admin/qrcode" element={<QRCodePage />} />
            </Route>
          </Route>

          {/* Store (public - must be last) */}
          <Route path="/:slug" element={<StorePage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
