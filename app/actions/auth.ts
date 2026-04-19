'use server';

import { createServerSupabaseClient, Profile } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export interface AuthResult {
  success: boolean;
  error?: string;
  profile?: Profile;
  redirectTo?: string;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const errorMessages: Record<string, string> = {
        'Invalid login credentials': 'Email ou mot de passe incorrect.',
        'Email not confirmed': 'Veuillez confirmer votre e-mail avant de vous connecter.',
        'Too many requests': 'Trop de tentatives. Patientez quelques minutes.',
      };
      return { success: false, error: errorMessages[error.message] || 'Erreur de connexion. Veuillez vérifier vos identifiants.' };
    }

    // Récupérer le profil pour déterminer la redirection
    // Attendre un peu que le trigger crée le profil si nécessaire
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Erreur récupération profil:', profileError);
      return { success: false, error: `Erreur profil: ${profileError.message}` };
    }

    if (!profile) {
      console.error('Profil non trouvé pour user:', data.user.id);
      return { success: false, error: 'Profil non trouvé. Veuillez réessayer.' };
    }

    const redirectTo = profile.role === 'admin' ? '/admin/dashboard' : '/';
    
    return { 
      success: true, 
      profile: profile as Profile,
      redirectTo,
    };
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la connexion. Veuillez réessayer.' };
  }
}

export interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | '';
  password: string;
}

export async function signup(data: SignupData): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          gender: data.gender || null,
        },
      },
    });

    if (error) {
      const errorMessages: Record<string, string> = {
        'User already registered': 'Cet e-mail est déjà utilisé. Essayez de vous connecter.',
        'Password should be at least 6 characters': 'Le mot de passe doit faire au moins 6 caractères.',
      };
      return { success: false, error: errorMessages[error.message] || error.message };
    }

    // Mettre à jour le téléphone (le trigger ne l'insère pas)
    if (data.phone && authData.user) {
      await supabase
        .from('profiles')
        .update({ phone: data.phone })
        .eq('id', authData.user.id);
    }

    // Si confirmation email activée
    if (authData.user && !authData.session) {
      return { 
        success: true, 
        error: 'confirmation_required',
      };
    }

    // Connexion automatique après inscription
    if (authData.session) {
      // Attendre que le trigger crée le profil
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user!.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error('Erreur récupération profil après signup:', profileError);
        // Rediriger vers l'accueil
        return { 
          success: true, 
          redirectTo: '/',
        };
      }

      return { 
        success: true, 
        profile: profile as Profile,
        redirectTo: '/',
      };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de l\'inscription.' };
  }
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/auth');
}

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      const errorMessages: Record<string, string> = {
        'User not found': 'Aucun compte trouvé avec cet e-mail.',
        'Rate limit exceeded': 'Trop de tentatives. Réessayez plus tard.',
      };
      return { success: false, error: errorMessages[error.message] || error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de l\'envoi de l\'e-mail.' };
  }
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      const errorMessages: Record<string, string> = {
        'Password should be at least 6 characters': 'Le mot de passe doit faire au moins 6 caractères.',
        'Same password': 'Le nouveau mot de passe doit être différent de l\'ancien.',
      };
      return { success: false, error: errorMessages[error.message] || error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la mise à jour du mot de passe.' };
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      // Si le JWT est expiré ou invalide, retourner null
      if (authError.message.includes('JWT expired') || authError.message.includes('Invalid JWT')) {
        console.log('JWT expired ou invalide, utilisateur non connecté');
        return null;
      }
      console.error('Erreur auth getUser:', authError);
      return null;
    }

    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Erreur getCurrentUser:', profileError);
    }

    return profile as Profile | null;
  } catch (error) {
    console.error('Exception dans getCurrentUser:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    redirect('/');
  }
  return user;
}
