'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CONTACT } from '@/lib/config';
import {
  ChevronDown,
  ChevronUp,
  Search,
  ShoppingCart,
  CreditCard,
  Truck,
  RotateCcw,
  HelpCircle,
  MessageCircle,
  Package,
  Phone,
  Mail
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ElementType;
}

export default function HelpPage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const savedLang = localStorage.getItem('ads-language') as 'fr' | 'en';
    if (savedLang) setLang(savedLang);
  }, []);

  const content = {
    fr: {
      title: 'Centre d\'aide',
      subtitle: 'Trouvez des réponses à vos questions',
      search: 'Rechercher une question...',
      contactTitle: 'Vous ne trouvez pas votre réponse ?',
      contactSubtitle: 'Notre équipe est là pour vous aider',
      whatsapp: 'WhatsApp',
      email: 'Email',
      phone: 'Téléphone',
      categories: [
        {
          title: 'Commandes',
          icon: ShoppingCart,
          faqs: [
            {
              question: 'Comment passer une commande ?',
              answer: 'Pour passer une commande :\n1. Parcourez notre catalogue de produits\n2. Cliquez sur "Ajouter au panier" pour les produits souhaités\n3. Allez dans votre panier et cliquez sur "Valider la commande"\n4. Remplissez vos informations personnelles\n5. Choisissez votre mode de livraison\n6. Sélectionnez votre mode de paiement\n7. Confirmez votre commande',
              icon: ShoppingCart
            },
            {
              question: 'Quel est le montant minimum de commande ?',
              answer: 'Le montant minimum de commande varie selon le produit. La plupart des produits ont un minimum de 10 unités. Consultez la fiche produit pour connaître le minimum spécifique.',
              icon: Package
            },
            {
              question: 'Puis-je modifier ma commande après validation ?',
              answer: 'Une fois la commande validée, vous ne pouvez plus la modifier. Cependant, vous pouvez nous contacter dans les 2 heures suivant la commande pour demander une annulation et repasser une nouvelle commande.',
              icon: RotateCcw
            }
          ]
        },
        {
          title: 'Paiement',
          icon: CreditCard,
          faqs: [
            {
              question: 'Quels modes de paiement acceptez-vous ?',
              answer: 'Nous acceptons :\n• Orange Money (#150#)\n• MTN Mobile Money (*126#)\n• Virement bancaire\n\nTous les paiements sont sécurisés et un reçu est généré après confirmation.',
              icon: CreditCard
            },
            {
              question: 'Comment payer par Orange Money ?',
              answer: 'Pour payer par Orange Money :\n1. Composez #150#\n2. Choisissez 1 (Transfert d\'argent)\n3. Entrez le numéro marchand : 6XX XXX XXX\n4. Entrez le montant de votre commande\n5. Validez avec votre code secret\n6. Conservez la confirmation de paiement',
              icon: Phone
            },
            {
              question: 'Le paiement est-il sécurisé ?',
              answer: 'Oui, tous nos paiements sont sécurisés. Nous utilisons des protocoles de sécurité standard pour protéger vos informations. Les transactions mobiles money sont traitées directement par les opérateurs.',
              icon: HelpCircle
            }
          ]
        },
        {
          title: 'Livraison',
          icon: Truck,
          faqs: [
            {
              question: 'Quels sont les délais de livraison ?',
              answer: '• Retrait sur place : Immédiat (Yaoundé)\n• Livraison express : 24-48h (Yaoundé et environs)\n• Livraison nationale : 3-5 jours ouvrés\n• Livraison internationale : 7-14 jours ouvrés',
              icon: Truck
            },
            {
              question: 'Combien coûte la livraison ?',
              answer: '• Retrait sur place : Gratuit\n• Livraison express : 1 500 FCFA\n• Livraison gratuite : Pour les commandes supérieures à 500 000 FCFA\n\nLes frais de livraison sont calculés automatiquement lors du checkout.',
              icon: Package
            },
            {
              question: 'Comment suivre ma livraison ?',
              answer: 'Une fois votre commande expédiée, vous recevez un email ou SMS avec un numéro de suivi. Vous pouvez également nous contacter par WhatsApp pour connaître l\'état de votre livraison.',
              icon: MessageCircle
            }
          ]
        },
        {
          title: 'Retours & Annulations',
          icon: RotateCcw,
          faqs: [
            {
              question: 'Puis-je annuler ma commande ?',
              answer: 'Vous pouvez annuler votre commande dans les 2 heures suivant la validation, à condition qu\'elle n\'ait pas encore été traitée. Contactez-nous rapidement par WhatsApp ou téléphone.',
              icon: RotateCcw
            },
            {
              question: 'Quelle est votre politique de retour ?',
              answer: 'Étant donné la nature des produits (réactifs de laboratoire avec dates de péremption), nous n\'acceptons pas les retours sauf en cas de :\n• Produit endommagé à la livraison\n• Erreur de notre part sur la référence\n• Produit périmé à la livraison\n\nContactez-nous dans les 24h suivant la réception.',
              icon: Package
            },
            {
              question: 'Que faire si je reçois un produit endommagé ?',
              answer: 'Si vous recevez un produit endommagé :\n1. Prenez des photos du colis et du produit\n2. Contactez-nous dans les 24h\n3. Nous organiserons un remplacement ou remboursement\n\nConservez l\'emballage d\'origine.',
              icon: HelpCircle
            }
          ]
        }
      ]
    },
    en: {
      title: 'Help Center',
      subtitle: 'Find answers to your questions',
      search: 'Search for a question...',
      contactTitle: 'Can\'t find your answer?',
      contactSubtitle: 'Our team is here to help',
      whatsapp: 'WhatsApp',
      email: 'Email',
      phone: 'Phone',
      categories: [
        {
          title: 'Orders',
          icon: ShoppingCart,
          faqs: [
            {
              question: 'How do I place an order?',
              answer: 'To place an order:\n1. Browse our product catalog\n2. Click "Add to cart" for desired products\n3. Go to your cart and click "Checkout"\n4. Fill in your personal information\n5. Choose your delivery method\n6. Select your payment method\n7. Confirm your order',
              icon: ShoppingCart
            },
            {
              question: 'What is the minimum order amount?',
              answer: 'The minimum order amount varies by product. Most products have a minimum of 10 units. Check the product page for the specific minimum.',
              icon: Package
            },
            {
              question: 'Can I modify my order after confirmation?',
              answer: 'Once the order is confirmed, you cannot modify it. However, you can contact us within 2 hours of placing the order to request cancellation and place a new order.',
              icon: RotateCcw
            }
          ]
        },
        {
          title: 'Payment',
          icon: CreditCard,
          faqs: [
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept:\n• Orange Money (#150#)\n• MTN Mobile Money (*126#)\n• Bank transfer\n\nAll payments are secure and a receipt is generated after confirmation.',
              icon: CreditCard
            },
            {
              question: 'How do I pay with Orange Money?',
              answer: 'To pay with Orange Money:\n1. Dial #150#\n2. Select 1 (Money transfer)\n3. Enter merchant number: 6XX XXX XXX\n4. Enter your order amount\n5. Confirm with your PIN\n6. Keep the payment confirmation',
              icon: Phone
            },
            {
              question: 'Is the payment secure?',
              answer: 'Yes, all our payments are secure. We use standard security protocols to protect your information. Mobile money transactions are processed directly by the operators.',
              icon: HelpCircle
            }
          ]
        },
        {
          title: 'Delivery',
          icon: Truck,
          faqs: [
            {
              question: 'What are the delivery times?',
              answer: '• Pickup: Immediate (Yaoundé)\n• Express delivery: 24-48h (Yaoundé area)\n• National delivery: 3-5 business days\n• International delivery: 7-14 business days',
              icon: Truck
            },
            {
              question: 'How much is delivery?',
              answer: '• Pickup: Free\n• Express delivery: 1,500 FCFA\n• Free delivery: For orders over 500,000 FCFA\n\nDelivery fees are calculated automatically at checkout.',
              icon: Package
            },
            {
              question: 'How can I track my delivery?',
              answer: 'Once your order is shipped, you will receive an email or SMS with a tracking number. You can also contact us via WhatsApp to check your delivery status.',
              icon: MessageCircle
            }
          ]
        },
        {
          title: 'Returns & Cancellations',
          icon: RotateCcw,
          faqs: [
            {
              question: 'Can I cancel my order?',
              answer: 'You can cancel your order within 2 hours of confirmation, provided it has not been processed yet. Contact us quickly via WhatsApp or phone.',
              icon: RotateCcw
            },
            {
              question: 'What is your return policy?',
              answer: 'Given the nature of the products (laboratory reagents with expiration dates), we do not accept returns except in case of:\n• Damaged product upon delivery\n• Our error on the reference\n• Expired product upon delivery\n\nContact us within 24h of receipt.',
              icon: Package
            },
            {
              question: 'What if I receive a damaged product?',
              answer: 'If you receive a damaged product:\n1. Take photos of the package and product\n2. Contact us within 24h\n3. We will arrange a replacement or refund\n\nKeep the original packaging.',
              icon: HelpCircle
            }
          ]
        }
      ]
    }
  }[lang];

  const allFaqs = content.categories.flatMap(cat => cat.faqs);
  
  const filteredFaqs = searchTerm 
    ? allFaqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      {/* Hero */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
          <p className="text-xl text-blue-100">{content.subtitle}</p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder={content.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {searchTerm ? (
          // Search Results
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
              {filteredFaqs.length} résultat(s)
            </h2>
            {filteredFaqs.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                Aucun résultat trouvé. Essayez avec d\'autres termes.
              </p>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <faq.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {faq.question}
                      </span>
                    </div>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6 pl-20">
                      <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          // Categories
          <div className="grid md:grid-cols-2 gap-8">
            {content.categories.map((category, catIndex) => (
              <div key={catIndex} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {category.title}
                  </h2>
                </div>
                
                {category.faqs.map((faq, faqIndex) => {
                  const globalIndex = catIndex * 100 + faqIndex;
                  return (
                    <div
                      key={faqIndex}
                      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <span className="font-medium text-zinc-900 dark:text-white pr-4">
                          {faq.question}
                        </span>
                        {openIndex === globalIndex ? (
                          <ChevronUp className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                        )}
                      </button>
                      {openIndex === globalIndex && (
                        <div className="px-4 pb-4">
                          <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{content.contactTitle}</h2>
          <p className="text-blue-100 mb-8">{content.contactSubtitle}</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {content.whatsapp}
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <Mail className="w-5 h-5" />
              {content.email}
            </a>
            <a
              href={`tel:${CONTACT.phone}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
            >
              <Phone className="w-5 h-5" />
              {content.phone}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
