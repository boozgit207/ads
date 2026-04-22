'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Package,
  HelpCircle,
  ShoppingCart,
  CreditCard,
  Truck,
  Phone,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CONTACT } from '@/lib/config';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useI18n } from '../../context/I18nContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    type: 'link' | 'cart' | 'contact';
    label: string;
    href?: string;
  };
}

export default function ChatBot() {
  const { user } = useAuth();
  const { cart } = useCart();
  const { locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message (no localStorage persistence)
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: locale === 'fr'
        ? '👋 Bonjour ! Je suis l\'assistant ADS.\n\nJe peux vous aider avec :\n🔍 Recherche de produits\n🛒 Commande et panier\n💳 Paiement (Orange Money, MTN Mobile Money)\n🚚 Livraison\n📞 Contact\n\nComment puis-je vous aider ?'
        : '👋 Hello! I\'m the ADS assistant.\n\nI can help you with:\n🔍 Product search\n🛒 Orders and cart\n💳 Payment (Orange Money, MTN Mobile Money)\n🚚 Delivery\n📞 Contact\n\nHow can I help you?',
      timestamp: new Date()
    }]);
  }, [locale]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): { content: string; action?: any } => {
    const lowerMsg = userMessage.toLowerCase();

    // Product search - broader matching
    if (lowerMsg.includes('produit') || lowerMsg.includes('product') || lowerMsg.includes('catalogue') || lowerMsg.includes('avoir') || lowerMsg.includes('disponible')) {
      return {
        content: locale === 'fr'
          ? '🧪 Nous proposons une large gamme de produits :\n\n• Tests COVID-19, HIV, Malaria\n• Tests de grossesse, Syphilis, Hépatite\n• Réactifs de biochimie et hématologie\n• Kits de diagnostic\n\nConsultez notre catalogue complet pour voir tous les produits avec leurs prix.'
          : '🧪 We offer a wide range of products:\n\n• COVID-19, HIV, Malaria tests\n• Pregnancy, Syphilis, Hepatitis tests\n• Biochemistry and hematology reagents\n• Diagnostic kits\n\nCheck our full catalog to see all products with prices.',
        action: {
          type: 'link',
          label: locale === 'fr' ? 'Voir le catalogue' : 'View catalog',
          href: '/products'
        }
      };
    }

    // COVID specific
    if (lowerMsg.includes('covid') || lowerMsg.includes('corona')) {
      return {
        content: locale === 'fr'
          ? '🧪 Tests COVID-19 disponibles :\n\n• Test Antigénique - 12 500 FCFA\n• Résultats en 15 minutes\n• Sensibilité 96.7%\n\nVoulez-vous voir tous nos tests rapides ?'
          : '🧪 COVID-19 tests available:\n\n• Rapid Antigen Test - 12,500 FCFA\n• Results in 15 minutes\n• Sensitivity 96.7%\n\nWould you like to see all our rapid tests?',
        action: {
          type: 'link',
          label: locale === 'fr' ? 'Voir les tests' : 'View tests',
          href: '/products?category=tests-rapides'
        }
      };
    }

    // Cart/Panier
    if (lowerMsg.includes('panier') || lowerMsg.includes('cart')) {
      const itemCount = cart.length;
      return {
        content: locale === 'fr'
          ? `🛒 Votre panier contient ${itemCount} article${itemCount > 1 ? 's' : ''}.\n\n${itemCount === 0 ? 'Ajoutez des produits pour commencer votre commande.' : 'Prêt à passer commande ?'}`
          : `🛒 Your cart has ${itemCount} item${itemCount > 1 ? 's' : ''}.\n\n${itemCount === 0 ? 'Add products to start your order.' : 'Ready to checkout?'}`,
        action: itemCount > 0 ? {
          type: 'link',
          label: locale === 'fr' ? 'Voir le panier' : 'View cart',
          href: '/cart'
        } : {
          type: 'link',
          label: locale === 'fr' ? 'Voir les produits' : 'View products',
          href: '/products'
        }
      };
    }

    // Payment/Paiement
    if (lowerMsg.includes('paiement') || lowerMsg.includes('payment') || lowerMsg.includes('payer') || lowerMsg.includes('prix')) {
      return {
        content: locale === 'fr'
          ? '💳 Modes de paiement acceptés :\n\n📱 Orange Money (#150#)\n📱 MTN Mobile Money (*126#)\n\nPour les prix, consultez notre page produits où chaque article affiche son tarif.'
          : '💳 Accepted payment methods:\n\n📱 Orange Money (#150#)\n📱 MTN Mobile Money (*126#)\n\nFor prices, check our products page where each item displays its price.',
        action: {
          type: 'link',
          label: locale === 'fr' ? 'Voir les produits' : 'View products',
          href: '/products'
        }
      };
    }

    // Order/Commande
    if (lowerMsg.includes('commande') || lowerMsg.includes('order') || lowerMsg.includes('acheter') || lowerMsg.includes('achet')) {
      return {
        content: locale === 'fr'
          ? '🛒 Pour passer une commande :\n\n1. Sélectionnez vos produits\n2. Ajoutez-les au panier\n3. Validez votre commande\n4. Choisissez le mode de paiement\n5. Recevez votre confirmation\n\nCommencez par parcourir notre catalogue.'
          : '🛒 To place an order:\n\n1. Select your products\n2. Add to cart\n3. Checkout\n4. Choose payment method\n5. Receive confirmation\n\nStart by browsing our catalog.',
        action: {
          type: 'link',
          label: locale === 'fr' ? 'Voir les produits' : 'View products',
          href: '/products'
        }
      };
    }

    // Delivery/Livraison
    if (lowerMsg.includes('livraison') || lowerMsg.includes('delivery') || lowerMsg.includes('expedition') || lowerMsg.includes('envoi')) {
      return {
        content: locale === 'fr'
          ? '🚚 Options de livraison :\n\n📍 Retrait gratuit - Yaoundé\n🚛 Livraison express - 1 500 FCFA (24-48h)\n🆓 Gratuit - Commandes > 500 000 FCFA\n\nLivraison dans toute l\'Afrique Centrale !'
          : '🚚 Delivery options:\n\n📍 Free pickup - Yaoundé\n🚛 Express delivery - 1,500 FCFA (24-48h)\n🆓 Free - Orders > 500,000 FCFA\n\nDelivery across Central Africa!'
      };
    }

    // Contact
    if (lowerMsg.includes('contact') || lowerMsg.includes('appeler') || lowerMsg.includes('whatsapp') || lowerMsg.includes('telephone') || lowerMsg.includes('tel')) {
      return {
        content: locale === 'fr'
          ? `📞 Contactez-nous :\n\n📱 WhatsApp: ${CONTACT.whatsapp}\n📧 Email: ${CONTACT.email}\n📍 ${CONTACT.address}\n\n⏰ Horaires: Lun-Ven 8h-18h, Sam 9h-13h`
          : `📞 Contact us:\n\n📱 WhatsApp: ${CONTACT.whatsapp}\n📧 Email: ${CONTACT.email}\n📍 ${CONTACT.address}\n\n⏰ Hours: Mon-Fri 8am-6pm, Sat 9am-1pm`,
        action: {
          type: 'contact',
          label: 'WhatsApp',
          href: CONTACT.whatsapp
        }
      };
    }

    // Help/Aide
    if (lowerMsg.includes('aide') || lowerMsg.includes('help') || lowerMsg.includes('assistance') || lowerMsg.includes('support')) {
      return {
        content: locale === 'fr'
          ? '❓ Comment puis-je vous aider ?\n\n🔍 Rechercher un produit\n🛒 Vérifier le panier\n💳 Informations de paiement\n🚚 Options de livraison\n📞 Nous contacter\n\nUtilisez les suggestions ci-dessus ou posez votre question.'
          : '❓ How can I help you?\n\n🔍 Search for a product\n🛒 Check cart\n💳 Payment information\n🚚 Delivery options\n📞 Contact us\n\nUse the suggestions above or ask your question.'
      };
    }

    // Stock inquiry
    if (lowerMsg.includes('stock') || lowerMsg.includes('quantite') || lowerMsg.includes('quantité')) {
      return {
        content: locale === 'fr'
          ? '📦 Les stocks sont mis à jour en temps réel sur notre site.\n\nChaque produit affiche sa disponibilité. Consultez notre page produits pour vérifier la disponibilité en direct.'
          : '📦 Stock is updated in real-time on our site.\n\nEach product displays its availability. Check our products page to verify real-time availability.',
        action: {
          type: 'link',
          label: locale === 'fr' ? 'Voir les produits' : 'View products',
          href: '/products'
        }
      };
    }

    // HIV/Malaria specific
    if (lowerMsg.includes('hiv') || lowerMsg.includes('sida') || lowerMsg.includes('malaria') || lowerMsg.includes('paludisme')) {
      return {
        content: locale === 'fr'
          ? '🧪 Tests de dépistage disponibles :\n\n• HIV (Elisa, Rapide)\n• Malaria (RDT, Microscopie)\n• Sensibilité élevée\n• Certifiés OMS\n\nVoir tous nos tests de dépistage.'
          : '🧪 Screening tests available:\n\n• HIV (Elisa, Rapid)\n• Malaria (RDT, Microscopy)\n• High sensitivity\n• WHO certified\n\nSee all our screening tests.',
        action: {
          type: 'link',
          label: locale === 'fr' ? 'Voir les tests' : 'View tests',
          href: '/products'
        }
      };
    }

    // Default response - more helpful
    return {
      content: locale === 'fr'
        ? `Je suis l'assistant ADS et je suis là pour vous aider !\n\nJe peux vous informer sur :\n• 🧪 Nos produits et tests diagnostiques\n• 🛒 Votre panier et les commandes\n• 💳 Les modes de paiement (Orange Money, MTN Mobile Money)\n• 🚚 La livraison et les délais\n• 📞 Nos coordonnées\n\nPosez-moi une question précise ou utilisez les suggestions ci-dessus.`
        : `I'm the ADS assistant and I'm here to help!\n\nI can inform you about:\n• 🧪 Our products and diagnostic tests\n• 🛒 Your cart and orders\n• 💳 Payment methods (Orange Money, MTN Mobile Money)\n• 🚚 Delivery and timelines\n• 📞 Our contact information\n\nAsk me a specific question or use the suggestions above.`,
      action: {
        type: 'link',
        label: locale === 'fr' ? 'Voir les produits' : 'View products',
        href: '/products'
      }
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setShowSuggestions(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, lang: locale }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('API Error:', data.error);
        throw new Error(data.error);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erreur chatbot:', error);
      // Fallback to rule-based response if API fails
      const fallbackResponse = generateResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse.content,
        timestamp: new Date(),
        action: fallbackResponse.action
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    handleSend();
  };

  const suggestions = [
    { icon: Package, label: locale === 'fr' ? 'Produits' : 'Products', action: locale === 'fr' ? 'Quels produits avez-vous ?' : 'What products do you have?' },
    { icon: ShoppingCart, label: locale === 'fr' ? 'Mon panier' : 'My cart', action: locale === 'fr' ? 'Mon panier' : 'My cart' },
    { icon: CreditCard, label: locale === 'fr' ? 'Paiement' : 'Payment', action: locale === 'fr' ? 'Modes de paiement' : 'Payment methods' },
    { icon: Truck, label: locale === 'fr' ? 'Livraison' : 'Delivery', action: locale === 'fr' ? 'Livraison' : 'Delivery' },
    { icon: Phone, label: locale === 'fr' ? 'Contact' : 'Contact', action: locale === 'fr' ? 'Contact' : 'Contact' },
    { icon: HelpCircle, label: locale === 'fr' ? 'Aide' : 'Help', action: locale === 'fr' ? 'Aide' : 'Help' }
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-110 ${
          isOpen ? 'hidden' : 'flex'
        }`}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">ADS Assistant</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {locale === 'fr' ? 'En ligne' : 'Online'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setMessages([]);
                setShowSuggestions(true);
              }}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              aria-label="Fermer le chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="max-w-[75%]">
                  <div
                    className={`p-4 rounded-2xl text-sm shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-sm border border-zinc-100 dark:border-zinc-700'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                  </div>
                  {message.action && (
                    <button
                      onClick={() => {
                        if (message.action?.type === 'link' && message.action.href) {
                          window.location.href = message.action.href;
                        } else if (message.action?.type === 'contact' && message.action.href) {
                          window.open(message.action.href, '_blank');
                        }
                      }}
                      className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      aria-label={message.action.label}
                    >
                      {message.action.type === 'link' && <Search className="w-3 h-3" />}
                      {message.action.type === 'contact' && <Phone className="w-3 h-3" />}
                      {message.action.label}
                    </button>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl rounded-bl-sm border border-zinc-100 dark:border-zinc-700 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && messages.length === 1 && (
            <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
                {locale === 'fr' ? 'Suggestions rapides :' : 'Quick suggestions :'}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 4).map((suggestion) => (
                  <button
                    key={suggestion.label}
                    onClick={() => {
                      handleQuickAction(suggestion.action);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    aria-label={suggestion.label}
                  >
                    <suggestion.icon className="w-3 h-3" />
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={locale === 'fr' ? 'Posez votre question...' : 'Ask your question...'}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                aria-label="Envoyer le message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
