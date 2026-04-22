'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { showToast } from '../components/Toast';
import { CONTACT } from '@/lib/config';
import { useI18n } from '../context/I18nContext';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  MessageSquare
} from 'lucide-react';

export default function ContactPage() {
  const { locale } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simuler l'envoi du formulaire
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast(locale === 'fr' ? 'Message envoyé avec succès !' : 'Message sent successfully!', 'success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      showToast(locale === 'fr' ? 'Erreur lors de l\'envoi du message' : 'Error sending message', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = {
    fr: {
      title: 'Contactez-nous',
      subtitle: 'Nous sommes là pour vous aider',
      formTitle: 'Envoyez-nous un message',
      nameLabel: 'Nom complet *',
      emailLabel: 'Email *',
      phoneLabel: 'Téléphone',
      subjectLabel: 'Sujet *',
      messageLabel: 'Message *',
      submitButton: 'Envoyer le message',
      submitting: 'Envoi en cours...',
      infoTitle: 'Nos coordonnées',
      address: 'Adresse',
      email: 'Email',
      phone: 'Téléphone',
      hours: 'Heures d\'ouverture',
      hoursValue: 'Lun - Ven: 8h00 - 18h00',
      backHome: 'Retour à l\'accueil',
      quickContact: 'Contact rapide',
      whatsapp: 'WhatsApp',
      messenger: 'Messenger',
      social: 'Suivez-nous'
    },
    en: {
      title: 'Contact Us',
      subtitle: 'We are here to help you',
      formTitle: 'Send us a message',
      nameLabel: 'Full name *',
      emailLabel: 'Email *',
      phoneLabel: 'Phone',
      subjectLabel: 'Subject *',
      messageLabel: 'Message *',
      submitButton: 'Send message',
      submitting: 'Sending...',
      infoTitle: 'Contact Information',
      address: 'Address',
      email: 'Email',
      phone: 'Phone',
      hours: 'Opening hours',
      hoursValue: 'Mon - Fri: 8:00 AM - 6:00 PM',
      backHome: 'Back to home',
      quickContact: 'Quick contact',
      whatsapp: 'WhatsApp',
      messenger: 'Messenger',
      social: 'Follow us'
    }
  }[locale];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      
      <main className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl text-blue-100">{t.subtitle}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulaire */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{t.formTitle}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={locale === 'fr' ? 'Votre nom' : 'Your name'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={locale === 'fr' ? 'votre@email.com' : 'your@email.com'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={locale === 'fr' ? '+237 697 12 13 28' : '+237 697 12 13 28'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    {t.subjectLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={locale === 'fr' ? 'Sujet de votre message' : 'Subject of your message'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    {t.messageLabel}
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={locale === 'fr' ? 'Écrivez votre message ici...' : 'Write your message here...'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t.submitButton}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Informations de contact */}
            <div className="space-y-6">
              {/* Carte info */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">{t.infoTitle}</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{t.address}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Yaoundé, Cameroun
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{t.email}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {CONTACT.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{t.phone}</h3>
                      <div className="space-y-1">
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {CONTACT.phoneOrange}
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {CONTACT.phoneMtn}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{t.hours}</h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {t.hoursValue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact rapide */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-8 text-white">
                <h3 className="text-xl font-bold mb-4">{t.quickContact}</h3>
                <p className="text-green-100 mb-6">
                  {locale === 'fr' 
                    ? 'Réponse rapide garantie via WhatsApp' 
                    : 'Quick response guaranteed via WhatsApp'}
                </p>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-3 px-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>{t.whatsapp}</span>
                  </a>
                </div>
              </div>

              {/* Retour */}
              <Link
                href="/"
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {t.backHome}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
