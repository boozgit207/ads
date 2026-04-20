import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe actuel et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non connecté' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe actuel en se reconnectant
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      );
    }

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Erreur mise à jour mot de passe:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du mot de passe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error: any) {
    console.error('Erreur changement mot de passe:', error);
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors du changement de mot de passe' },
      { status: 500 }
    );
  }
}
