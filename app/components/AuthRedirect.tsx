'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface AuthRedirectProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function AuthRedirect({ children, requireAdmin = false, redirectTo }: AuthRedirectProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une page protégée
    if (!user && requireAdmin) {
      router.push('/auth');
      return;
    }

    // Redirection automatique selon le rôle
    if (user && !redirectTo) {
      if (requireAdmin && user.role !== 'admin') {
        router.push('/');
        return;
      }
      
      // Si un admin visite la page d'accueil
      if (!requireAdmin && user.role === 'admin' && window.location.pathname === '/') {
        router.push('/admin/dashboard');
        return;
      }
    }

    // Redirection personnalisée
    if (redirectTo && user) {
      router.push(redirectTo);
    }
  }, [user, loading, requireAdmin, redirectTo, router]);

  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
