const DEFAULT_CONTACT_TO = 'fonkououmbebobo@gmail.com';

export type ContactEmailPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; code?: string };

export async function sendContactEmail(
  payload: ContactEmailPayload
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL || DEFAULT_CONTACT_TO;
  const from =
    process.env.RESEND_FROM_EMAIL || 'ADS Contact <onboarding@resend.dev>';

  if (!apiKey) {
    return {
      ok: false,
      error:
        'RESEND_API_KEY manquante sur le serveur (ajoutez-la dans Vercel → Settings → Environment Variables).',
      code: 'MISSING_API_KEY',
    };
  }

  const { name, email, phone, subject, message } = payload;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[ADS Contact] ${subject}`,
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2 style="color:#0284c7;margin:0 0 16px">Nouveau message — site ADS</h2>
<p><strong>Nom :</strong> ${safeName}</p>
<p><strong>Email :</strong> ${safeEmail}</p>
<p><strong>Téléphone :</strong> ${escapeHtml(phone || '—')}</p>
<p><strong>Sujet :</strong> ${safeSubject}</p>
<hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb"/>
<p><strong>Message</strong></p>
<p style="white-space:pre-wrap;line-height:1.6">${safeMessage}</p>
<p style="margin-top:24px;font-size:12px;color:#64748b">Destinataire configuré : ${escapeHtml(to)}</p>
</div>`,
        text: `Message ADS\n\nNom: ${name}\nEmail: ${email}\nTél: ${phone || '—'}\nSujet: ${subject}\n\n${message}`,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      name?: string;
    };

    if (!res.ok) {
      const detail = data.message || data.name || res.statusText;
      console.error('[Resend]', res.status, detail);
      return {
        ok: false,
        error: `Resend a refusé l'envoi : ${detail}. Vérifiez RESEND_FROM_EMAIL (domaine vérifié) et la clé API.`,
        code: 'RESEND_ERROR',
      };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur réseau';
    console.error('[Resend] fetch failed:', msg);
    return { ok: false, error: msg, code: 'NETWORK' };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
