'use client';

import { useState } from 'react';
import { MessageCircle, X, Phone, Mail, MessageSquare } from 'lucide-react';
import { CONTACT } from '@/lib/config';
import { useI18n } from '../context/I18nContext';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = useI18n();

  const message = locale === 'fr'
    ? 'Bonjour ADS, je souhaite avoir des informations sur vos produits. Pouvez-vous m\'aider ?'
    : 'Hello ADS, I would like information about your products. Can you help me?';

  const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
  const messengerUrl = 'https://m.me/ADScameroun';
  const emailSubject = locale === 'fr' ? 'Demande d\'information' : 'Information request';
  const emailBody = locale === 'fr'
    ? 'Bonjour,\n\nJe souhaiterais obtenir des informations sur vos produits et services.\n\nCordialement.'
    : 'Hello,\n\nI would like to get information about your products and services.\n\nBest regards.';
  const emailUrl = `mailto:${CONTACT.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <>
      {/* Main Contact Button */}
      <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2">
        {isOpen && (
          <div className="flex flex-col gap-2 mb-2 animate-in slide-in-from-bottom-2">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 transition-all"
            >
              <span className="text-sm font-medium">
                {locale === 'fr' ? 'WhatsApp' : 'WhatsApp'}
              </span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
            </a>

            {/* Messenger */}
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-full shadow-lg hover:opacity-90 transition-all"
            >
              <span className="text-sm font-medium">
                Messenger
              </span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.744 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111C24 4.975 18.627 0 12 0zm1.193 14.963l-3.056-3.26-5.963 3.26 6.559-6.963 3.13 3.26 5.889-3.26-6.559 6.963z"/>
                </svg>
              </div>
            </a>

            {/* Email */}
            <a
              href={emailUrl}
              className="flex items-center gap-3 bg-zinc-700 text-white px-4 py-3 rounded-full shadow-lg hover:bg-zinc-800 transition-all"
            >
              <span className="text-sm font-medium">
                {locale === 'fr' ? 'Email' : 'Email'}
              </span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
            </a>

            {/* Phone */}
            <a
              href={`tel:${CONTACT.phone}`}
              className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
            >
              <span className="text-sm font-medium">
                {locale === 'fr' ? 'Appeler' : 'Call'}
              </span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
            </a>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-lg transition-all hover:scale-110 ${
            isOpen ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
          }`}
          aria-label={isOpen ? 'Fermer le menu de contact' : 'Ouvrir le menu de contact'}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>
    </>
  );
}
