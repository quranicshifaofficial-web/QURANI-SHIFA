/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { onAuthStateChanged, User } from 'firebase/auth';
import { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminPanel } from './components/admin/AdminPanel';
import { PublicWebsite } from './components/PublicWebsite';
import { auth } from './lib/firebase';
import { verifyUserIsAdmin } from './lib/siteService';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F3] text-[#17251E] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-[#064E3B]/20 bg-white p-6 text-center space-y-3">
            <h1 className="text-xl font-bold text-[#064E3B]">কুরআনী শিফা · QURANI SHIFA</h1>
            <p className="text-sm text-[#40544A]">
              দুঃখিত, একটি অপ্রত্যাশিত ত্রুটি হয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন।
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-sm font-semibold cursor-pointer"
            >
              রিফ্রেশ করুন (Reload)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function AdminRoute() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    document.documentElement.lang = 'bn';
    document.documentElement.dir = 'ltr';
    document.title = 'Admin Panel — কুরআনী শিফা | QURANI SHIFA';

    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setIsAuthorized(false);
        setCheckingRole(false);
        return;
      }
      setCheckingRole(true);
      const ok = await verifyUserIsAdmin(nextUser);
      setIsAuthorized(ok);
      setCheckingRole(false);
    });
    return () => unsub();
  }, []);

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (!authReady || checkingRole || !user || !isAuthorized) {
    return (
      <AdminLogin
        user={user}
        checkingRole={!authReady || checkingRole}
        isAuthorized={isAuthorized}
        onNavigateHome={navigateHome}
      />
    );
  }

  return <AdminPanel user={user} onNavigateHome={navigateHome} />;
}

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <AppErrorBoundary>
      {isAdminPath(pathname) ? <AdminRoute /> : <PublicWebsite />}
    </AppErrorBoundary>
  );
}
