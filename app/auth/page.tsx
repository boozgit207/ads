'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { login, signup, resetPassword } from '../actions/auth';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  User,
  Phone,
  UserCircle,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home
} from 'lucide-react';
import { showToast } from '../components/Toast';

export default function AuthPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const loginFormRef = useRef<HTMLFormElement>(null);
  const signupFormRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('Veuillez entrer votre e-mail', 'error');
      return;
    }
    
    setLoading(true);
    const result = await resetPassword(forgotEmail);
    
    if (result.success) {
      showToast('E-mail de réinitialisation envoyé ! Vérifiez votre boîte mail.', 'success');
      setShowForgotPassword(false);
      setForgotEmail('');
    } else {
      showToast(result.error || 'Une erreur est survenue', 'error');
    }
    setLoading(false);
  };
  
  const [signupFirst, setSignupFirst] = useState('');
  const [signupLast, setSignupLast] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupGender, setSignupGender] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    setLoading(true);
    showToast('Vérification de vos identifiants...', 'info');

    const result = await login(loginEmail, loginPassword);

    if (result.success) {
      showToast('Connexion réussie !', 'success');
      // Rafraîchir l'utilisateur dans le contexte avant la redirection
      await refreshUser();
      setTimeout(() => {
        router.push(result.redirectTo || '/');
        router.refresh();
      }, 1000);
    } else {
      showToast(result.error || 'Une erreur est survenue', 'error');
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    if (!signupFirst || !signupLast || !signupEmail || !signupPassword) {
      showToast('Prénom, nom, e-mail et mot de passe sont obligatoires', 'error');
      return;
    }
    if (signupPassword.length < 8) {
      showToast('Le mot de passe doit contenir au moins 8 caractères', 'error');
      return;
    }
    if (signupPassword !== signupConfirm) {
      showToast('La confirmation du mot de passe ne correspond pas', 'error');
      return;
    }

    setLoading(true);
    showToast('Création de votre compte...', 'info');

    const result = await signup({
      first_name: signupFirst,
      last_name: signupLast,
      email: signupEmail,
      phone: signupPhone,
      gender: signupGender as 'male' | 'female' | 'other' | '',
      password: signupPassword,
    });

    if (result.success) {
      if (result.error === 'confirmation_required') {
        showToast('Compte créé ! Vérifiez votre boîte mail pour confirmer', 'success');
        setIsSignup(false);
      } else if (result.redirectTo) {
        showToast(`Bienvenue ${signupFirst} !`, 'success');
        // Rafraîchir l'utilisateur dans le contexte avant la redirection
        await refreshUser();
        setTimeout(() => {
          router.push(result.redirectTo || '/');
          router.refresh();
        }, 1500);
      }
    } else {
      showToast(result.error || 'Une erreur est survenue', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Brand info */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-4 mb-8">
              <img src="/logo_1.svg" alt="Logo ADS" className="w-16 h-16" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                  ADS
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">Angela Diagnostics & Services</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              {isSignup ? 'Créez votre compte' : 'Bienvenue de retour'}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">
              {isSignup 
                ? 'Rejoignez notre plateforme et accédez à nos produits de diagnostic de haute qualité.'
                : 'Connectez-vous pour accéder à votre compte et gérer vos commandes.'}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Accès à +500 produits de diagnostic</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span>Livraison rapide dans toute l\'Afrique</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span>Support client 24/7</span>
              </div>
            </div>
          </div>

          {/* Right side - Auth card */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl p-8 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl">
              {/* Home button */}
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6"
              >
                <Home className="w-4 h-4" />
                Accueil
              </button>

              {/* Mobile brand */}
              <div className="lg:hidden text-center mb-8">
                <img src="/logo_1.svg" alt="Logo ADS" className="w-16 h-16 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">ADS</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Angela Diagnostics & Services</p>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-1.5 mb-8">
                <button
                  type="button"
                  onClick={() => setIsSignup(false)}
                  className={`py-3 text-sm font-semibold rounded-xl transition-all ${
                    !isSignup 
                      ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-lg' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignup(true)}
                  className={`py-3 text-sm font-semibold rounded-xl transition-all ${
                    isSignup 
                      ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-lg' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Inscription
                </button>
              </div>

              {/* Login Form */}
              <form 
                ref={loginFormRef}
                onSubmit={handleLogin}
                style={{ display: !isSignup ? 'block' : 'none' }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Se connecter
                      <Shield className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Mot de passe oublié */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </form>

              {/* Signup Form */}
              <form 
                ref={signupFormRef}
                onSubmit={handleSignup}
                style={{ display: isSignup ? 'block' : 'none' }}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Prénom
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={signupFirst}
                        onChange={(e) => setSignupFirst(e.target.value)}
                        placeholder="Jean"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Nom
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={signupLast}
                        onChange={(e) => setSignupLast(e.target.value)}
                        placeholder="Dupont"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+237 697 12 13 28"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min. 8 caractères"
                      required
                      minLength={8}
                      className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Créer mon compte
                      <UserCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {!isSignup ? (
                    <>Pas encore de compte ?{' '}
                    <button 
                      type="button"
                      onClick={() => setIsSignup(true)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      S'inscrire
                    </button>
                    </>
                  ) : (
                    <>Déjà un compte ?{' '}
                    <button 
                      type="button"
                      onClick={() => setIsSignup(false)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Se connecter
                    </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Mot de passe oublié */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Mot de passe oublié
              </h2>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <AlertCircle className="w-6 h-6 text-zinc-500" />
              </button>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Envoyer l&apos;e-mail
                    <Mail className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
