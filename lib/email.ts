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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

export type OrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
};

export type OrderEmailPayload = {
  numero: string;
  orderId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  address?: string;
  city?: string;
  deliveryType: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: OrderEmailItem[];
  notes?: string;
  trackingUrl: string;
};

function formatItemsHtml(items: OrderEmailItem[]): string {
  const rows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${escapeHtml(i.name)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center">${i.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right">${(i.price * i.quantity).toLocaleString('fr-FR')} FCFA</td>
        </tr>`
    )
    .join('');
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead><tr style="background:#f1f5f9">
      <th style="padding:8px 12px;text-align:left">Produit</th>
      <th style="padding:8px 12px;text-align:center">Qté</th>
      <th style="padding:8px 12px;text-align:right">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function orderSummaryBlock(p: OrderEmailPayload): string {
  return `
    <p><strong>N° commande :</strong> ${escapeHtml(p.numero)}</p>
    <p><strong>Client :</strong> ${escapeHtml(p.clientName)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(p.clientPhone)}</p>
    ${p.clientEmail ? `<p><strong>Email :</strong> ${escapeHtml(p.clientEmail)}</p>` : ''}
    <p><strong>Livraison :</strong> ${escapeHtml(p.deliveryType)}</p>
    ${p.address ? `<p><strong>Adresse :</strong> ${escapeHtml(p.address)}${p.city ? `, ${escapeHtml(p.city)}` : ''}</p>` : ''}
    <p><strong>Paiement prévu :</strong> ${escapeHtml(p.paymentMethod)}</p>
    <p><strong>Sous-total :</strong> ${p.subtotal.toLocaleString('fr-FR')} FCFA</p>
    <p><strong>Frais livraison :</strong> ${p.deliveryFee.toLocaleString('fr-FR')} FCFA</p>
    <p><strong>Total :</strong> ${p.total.toLocaleString('fr-FR')} FCFA</p>
    ${p.notes ? `<p><strong>Notes :</strong> ${escapeHtml(p.notes)}</p>` : ''}
  `;
}

async function sendResendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL || 'ADS <onboarding@resend.dev>';

  if (!apiKey) {
    return {
      ok: false,
      error: 'RESEND_API_KEY manquante sur le serveur.',
      code: 'MISSING_API_KEY',
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        reply_to: opts.replyTo,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: data.message || res.statusText,
        code: 'RESEND_ERROR',
      };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur réseau';
    return { ok: false, error: msg, code: 'NETWORK' };
  }
}

/** Email de confirmation au client après validation de commande */
export async function sendOrderConfirmationToClient(
  payload: OrderEmailPayload
): Promise<SendEmailResult> {
  if (!payload.clientEmail?.trim()) {
    return { ok: true };
  }

  const html = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
<h2 style="color:#0284c7;margin:0 0 16px">Commande reçue — ADS</h2>
<p>Bonjour ${escapeHtml(payload.clientName)},</p>
<p>Nous avons bien reçu votre commande. Notre équipe va la traiter dans les plus brefs délais.</p>
${orderSummaryBlock(payload)}
<h3 style="margin:24px 0 12px;color:#334155">Articles commandés</h3>
${formatItemsHtml(payload.items)}
<p style="margin-top:24px">
  <a href="${escapeHtml(payload.trackingUrl)}" style="display:inline-block;background:#0284c7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
    Suivre ma commande
  </a>
</p>
<p style="margin-top:24px;font-size:13px;color:#64748b">
  Paiement ${escapeHtml(payload.paymentMethod)} hors plateforme. Numéro : <strong>${escapeHtml(payload.numero)}</strong>.
</p>
<p style="font-size:12px;color:#94a3b8">Angela Diagnostics &amp; Services</p>
</div>`;

  const text = `Commande reçue — ADS\n\nBonjour ${payload.clientName},\n\nNous avons bien reçu votre commande ${payload.numero}.\nTotal : ${payload.total.toLocaleString('fr-FR')} FCFA\n\nSuivi : ${payload.trackingUrl}`;

  return sendResendEmail({
    to: payload.clientEmail.trim(),
    subject: `[ADS] Commande reçue — ${payload.numero}`,
    html,
    text,
  });
}

/** Notification admin pour nouvelle commande */
export async function sendNewOrderToAdmin(
  payload: OrderEmailPayload,
  adminEmail: string = DEFAULT_CONTACT_TO
): Promise<SendEmailResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ads-diagnostics.com';
  const adminUrl = `${siteUrl}/admin/commandes`;

  const html = `<div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px">
<h2 style="color:#059669;margin:0 0 16px">Nouvelle commande — ADS Admin</h2>
${orderSummaryBlock(payload)}
<h3 style="margin:24px 0 12px;color:#334155">Détail des produits</h3>
${formatItemsHtml(payload.items)}
<p style="margin-top:20px">
  <a href="${escapeHtml(adminUrl)}" style="color:#0284c7">Gérer les commandes</a>
</p>
</div>`;

  const text = `Nouvelle commande ${payload.numero}\nClient: ${payload.clientName}\nTél: ${payload.clientPhone}\nTotal: ${payload.total.toLocaleString('fr-FR')} FCFA`;

  return sendResendEmail({
    to: adminEmail,
    subject: `[ADS Admin] Nouvelle commande — ${payload.numero}`,
    html,
    text,
    replyTo: payload.clientEmail,
  });
}
