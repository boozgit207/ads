import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CONTACT_EMAIL = 'fonkououmbebobo@gmail.com';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendContactEmail(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY non configurée — email non envoyé');
    return false;
  }

  const { name, email, phone, subject, message } = payload;
  const textBody = `Nouveau message de contact depuis le site ADS

Nom: ${name}
Email: ${email}
Téléphone: ${phone || 'Non renseigné'}
Sujet: ${subject}

Message:
${message}`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'ADS Contact <onboarding@resend.dev>',
      to: [CONTACT_EMAIL],
      reply_to: email,
      subject: `Nouveau contact ADS: ${subject}`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h2 style="color: #0EA5E9;">Nouveau message de contact</h2>
<p><strong>Nom:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Téléphone:</strong> ${phone || 'Non renseigné'}</p>
<p><strong>Sujet:</strong> ${subject}</p>
<hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
<p><strong>Message:</strong></p>
<p style="white-space: pre-wrap;">${message}</p>
</div>`,
      text: textBody,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Erreur Resend API:', err);
    return false;
  }
  return true;
}

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

    await sendContactEmail({ name, email, phone, subject, message });

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
      return NextResponse.json({
        success: true,
        message: 'Message reçu avec succès',
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Erreur API contact:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
