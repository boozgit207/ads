import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendContactEmail } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const emailResult = await sendContactEmail({ name, email, phone, subject, message });

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase contact_messages:', error);
    }

    if (!emailResult.ok) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error,
          saved: !!data,
          hint:
            'Vérifiez RESEND_API_KEY et RESEND_FROM_EMAIL dans Vercel. Avec onboarding@resend.dev, seul votre email Resend reçoit les messages.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      emailSent: true,
    });
  } catch (error: unknown) {
    console.error('Erreur API contact:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
