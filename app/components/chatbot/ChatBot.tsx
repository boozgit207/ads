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
  options?: { id: string; label: string; action: string }[];
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
    // Welcome message with numbered options
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: locale === 'fr'
        ? '👋 Bonjour ! Je suis l\'assistant ADS.\n\nComment puis-je vous aider ? Tapez le numéro de votre choix :'
        : '👋 Hello! I\'m the ADS assistant.\n\nHow can I help you? Type the number of your choice:',
      timestamp: new Date(),
      options: [
        { id: '1', label: locale === 'fr' ? '� Rechercher des produits' : '🔍 Search products', action: 'products' },
        { id: '2', label: locale === 'fr' ? '🛒 Voir mon panier' : '🛒 View my cart', action: 'cart' },
        { id: '3', label: locale === 'fr' ? '� Modes de paiement' : '💳 Payment methods', action: 'payment' },
        { id: '4', label: locale === 'fr' ? '🚚 Livraison' : '🚚 Delivery', action: 'delivery' },
        { id: '5', label: locale === 'fr' ? '📞 Contact' : '📞 Contact', action: 'contact' },
        { id: '6', label: locale === 'fr' ? 'ℹ️ À propos d\'ADS' : 'ℹ️ About ADS', action: 'about' }
      ]
    }]);
  }, [locale]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOption = (action: string) => {
    let response: { content: string; options?: { id: string; label: string; action: string }[]; action?: any };

    switch (action) {
      case 'products':
        response = {
          content: locale === 'fr'
            ? '🧪 Nos produits incluent :\n\n• Tests COVID-19, HIV, Malaria\n• Tests de grossesse, Syphilis, Hépatite\n• Réactifs de biochimie et hématologie\n• Kits de diagnostic\n\nQue souhaitez-vous faire ?'
            : '🧪 Our products include:\n\n• COVID-19, HIV, Malaria tests\n• Pregnancy, Syphilis, Hepatitis tests\n• Biochemistry and hematology reagents\n• Diagnostic kits\n\nWhat would you like to do?',
          options: [
            { id: '1', label: locale === 'fr' ? '🔍 Chercher un produit' : '🔍 Search for a product', action: 'search_product' },
            { id: '2', label: locale === 'fr' ? '📋 Voir le catalogue' : '📋 View catalog', action: 'catalog' },
            { id: '3', label: locale === 'fr' ? '🏭 Par laboratoire' : '🏭 By laboratory', action: 'laboratories' },
            { id: '0', label: locale === 'fr' ? '⬅️ Retour' : '⬅️ Back', action: 'main' }
          ]
        };
        break;

      case 'cart':
        const cartCount = cart.length;
        const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        response = {
          content: locale === 'fr'
            ? `🛒 Votre panier contient ${cartCount} article(s) pour un total de ${cartTotal.toLocaleString()} FCFA.\n\nQue souhaitez-vous faire ?`
            : `🛒 Your cart contains ${cartCount} item(s) for a total of ${cartTotal.toLocaleString()} FCFA.\n\nWhat would you like to do?`,
          options: [
            { id: '1', label: locale === 'fr' ? '👁️ Voir le panier' : '👁️ View cart', action: 'view_cart' },
            { id: '2', label: locale === 'fr' ? '✅ Passer commande' : '✅ Checkout', action: 'checkout' },
            { id: '3', label: locale === 'fr' ? '🗑️ Vider le panier' : '🗑️ Clear cart', action: 'clear_cart' },
            { id: '0', label: locale === 'fr' ? '⬅️ Retour' : '⬅️ Back', action: 'main' }
          ],
          action: {
            type: 'link',
            label: locale === 'fr' ? 'Voir le panier' : 'View cart',
            href: '/cart'
          }
        };
        break;

      case 'payment':
        response = {
          content: locale === 'fr'
            ? '💳 Nous acceptons :\n\n• Orange Money\n• MTN Mobile Money\n\nPaiement sécurisé et rapide.\n\nQue souhaitez-vous savoir ?'
            : '💳 We accept:\n\n• Orange Money\n• MTN Mobile Money\n\nSecure and fast payment.\n\nWhat would you like to know?',
          options: [
            { id: '1', label: locale === 'fr' ? '📱 Comment payer avec Orange Money' : '📱 How to pay with Orange Money', action: 'orange_payment' },
            { id: '2', label: locale === 'fr' ? '📱 Comment payer avec MTN' : '📱 How to pay with MTN', action: 'mtn_payment' },
            { id: '0', label: locale === 'fr' ? '⬅️ Retour' : '⬅️ Back', action: 'main' }
          ]
        };
        break;

      case 'delivery':
        response = {
          content: locale === 'fr'
            ? '🚚 Livraison :\n\n• Livraison express dans toute l\'Afrique centrale\n• Délai: 2-5 jours ouvrés\n• Suivi en temps réel\n• Livraison gratuite à partir de 50 000 FCFA\n\nQue souhaitez-vous savoir ?'
            : '🚚 Delivery:\n\n• Express delivery across Central Africa\n• Timeline: 2-5 business days\n• Real-time tracking\n• Free delivery from 50,000 FCFA\n\nWhat would you like to know?',
          options: [
            { id: '1', label: locale === 'fr' ? '📍 Zones de livraison' : '📍 Delivery zones', action: 'delivery_zones' },
            { id: '2', label: locale === 'fr' ? '⏱️ Délais de livraison' : '⏱️ Delivery times', action: 'delivery_times' },
            { id: '0', label: locale === 'fr' ? '⬅️ Retour' : '⬅️ Back', action: 'main' }
          ]
        };
        break;

      case 'contact':
        response = {
          content: locale === 'fr'
            ? `📞 Contactez-nous :\n\n📍 Adresse: Yaoundé, Carrefour Intendance, Cameroun\n📞 Orange: +237 697 12 13 28\n📞 MTN: +237 686 09 42 05\n📧 Email: angeladiagnostics8@gmail.com\n\nComment pouvons-nous vous aider ?`
            : `📞 Contact us:\n\n📍 Address: Yaoundé, Carrefour Intendance, Cameroon\n📞 Orange: +237 697 12 13 28\n📞 MTN: +237 686 09 42 05\n📧 Email: angeladiagnostics8@gmail.com\n\nHow can we help you?`,
          options: [
            { id: '1', label: locale === 'fr' ? '📧 Envoyer un email' : '📧 Send email', action: 'send_email' },
            { id: '2', label: locale === 'fr' ? '📱 Appeler' : '📱 Call', action: 'call' },
            { id: '0', label: locale === 'fr' ? '⬅️ Retour' : '⬅️ Back', action: 'main' }
          ],
          action: {
            type: 'link',
            label: locale === 'fr' ? 'Page de contact' : 'Contact page',
            href: '/contact'
          }
        };
        break;

      case 'about':
        response = {
          content: locale === 'fr'
            ? 'ℹ️ À propos d\'ADS :\n\nADS - Angela Diagnostics et Services est votre partenaire de confiance pour la distribution de réactifs de laboratoire et solutions diagnostiques en Afrique.\n\n• Produits certifiés ISO 9001\n• Plus de 500 produits\n• 20+ laboratoires partenaires\n• Service client 24/7\n\nQue souhaitez-vous savoir ?'
            : 'ℹ️ About ADS:\n\nADS - Angela Diagnostics and Services is your trusted partner for laboratory reagents and diagnostic solutions distribution in Africa.\n\n• ISO 9001 certified products\n• 500+ products\n• 20+ partner laboratories\n• 24/7 customer service\n\nWhat would you like to know?',
          options: [
            { id: '1', label: locale === 'fr' ? '🏢 Nos laboratoires' : '🏢 Our laboratories', action: 'laboratories' },
            { id: '2', label: locale === 'fr' ? '📖 Notre histoire' : '📖 Our story', action: 'story' },
            { id: '0', label: locale === 'fr' ? '⬅️ Retour' : '⬅️ Back', action: 'main' }
          ],
          action: {
            type: 'link',
            label: locale === 'fr' ? 'À propos' : 'About',
            href: '/about'
          }
        };
        break;

      case 'catalog':
        response = {
          content: locale === 'fr'
            ? '📋 Voici nos catégories de produits :\n\n• Tests rapides\n• Tests ELISA\n• Biochimie\n• Hématologie\n• Immunologie\n• Microbiologie\n\nQue souhaitez-vous faire ?'
            : '📋 Here are our product categories:\n\n• Rapid tests\n• ELISA tests\n• Biochemistry\n• Hematology\n• Immunology\n• Microbiology\n\nWhat would you like to do?',
          options: [
            { id: '1', label: locale === 'fr' ? '🔍 Chercher par catégorie' : '🔍 Search by category', action: 'search_category' },
            { id: '2', label: locale === 'fr' ? '🌐 Voir tout le catalogue' : '🌐 View full catalog', action: 'view_all' },
            { id: '0', label: locale === 'fr' ? '⬅️ Retour' : '⬅️ Back', action: 'products' }
          ],
          action: {
            type: 'link',
            label: locale === 'fr' ? 'Voir le catalogue' : 'View catalog',
            href: '/products'
          }
        };
        break;

      case 'laboratories':
        response = {
          content: locale === 'fr'
            ? '🏭 Nos laboratoires partenaires :\n\n• Fortress Diagnostics\n• Bioline\n• Hightop\n• Et bien d\'autres...\n\nQue souhaitez-vous faire ?'
            : '🏭 Our partner laboratories:\n\n• Fortress Diagnostics\n• Bioline\n• Hightop\n• And many more...\n\nWhat would you like to do?',
          options: [
            { id: '1', label: locale === 'fr' ? '🔍 Voir les produits Fortress' : '🔍 View Fortress products', action: 'fortress' },
            { id: '2', label: locale === 'fr' ? '🔍 Voir les produits Bioline' : '🔍 View Bioline products', action: 'bioline' },
            { id: '0', label: locale === 'fr' ? '⬅️ Retour' : '⬅️ Back', action: 'products' }
          ]
        };
        break;

      case 'view_cart':
        response = {
          content: locale === 'fr'
            ? '👁️ Redirection vers votre panier...'
            : '👁️ Redirecting to your cart...',
          action: {
            type: 'link',
            label: locale === 'fr' ? 'Voir le panier' : 'View cart',
            href: '/cart'
          }
        };
        break;

      case 'checkout':
        response = {
          content: locale === 'fr'
            ? '✅ Redirection vers le paiement...'
            : '✅ Redirecting to checkout...',
          action: {
            type: 'link',
            label: locale === 'fr' ? 'Passer commande' : 'Checkout',
            href: '/checkout'
          }
        };
        break;

      case 'clear_cart':
        response = {
          content: locale === 'fr'
            ? '🗑️ Pour vider le panier, allez sur la page du panier et cliquez sur "Vider le panier".'
            : '🗑️ To clear the cart, go to the cart page and click "Clear cart".',
          action: {
            type: 'link',
            label: locale === 'fr' ? 'Voir le panier' : 'View cart',
            href: '/cart'
          }
        };
        break;

      case 'main':
        response = {
          content: locale === 'fr'
            ? '👋 Comment puis-je vous aider ? Tapez le numéro de votre choix :'
            : '👋 How can I help you? Type the number of your choice:',
          options: [
            { id: '1', label: locale === 'fr' ? '🔍 Rechercher des produits' : '🔍 Search products', action: 'products' },
            { id: '2', label: locale === 'fr' ? '🛒 Voir mon panier' : '🛒 View my cart', action: 'cart' },
            { id: '3', label: locale === 'fr' ? '💳 Modes de paiement' : '💳 Payment methods', action: 'payment' },
            { id: '4', label: locale === 'fr' ? '🚚 Livraison' : '🚚 Delivery', action: 'delivery' },
            { id: '5', label: locale === 'fr' ? '📞 Contact' : '📞 Contact', action: 'contact' },
            { id: '6', label: locale === 'fr' ? 'ℹ️ À propos d\'ADS' : 'ℹ️ About ADS', action: 'about' }
          ]
        };
        break;

      default:
        response = {
          content: locale === 'fr'
            ? '🤔 Je n\'ai pas compris. Tapez le numéro de votre choix ou utilisez les options ci-dessus.'
            : '🤔 I didn\'t understand. Type the number of your choice or use the options above.',
          options: [
            { id: '0', label: locale === 'fr' ? '⬅️ Menu principal' : '⬅️ Main menu', action: 'main' }
          ]
        };
    }

    return response;
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

    // Check if input is a number (option selection)
    const numberInput = parseInt(input.trim());
    const lastMessage = messages[messages.length - 1];

    if (!isNaN(numberInput) && lastMessage?.options) {
      const selectedOption = lastMessage.options.find(opt => opt.id === input.trim());
      if (selectedOption) {
        const response = handleOption(selectedOption.action);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          options: response.options,
          action: response.action
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        return;
      }
    }

    // Handle keyword input
    const lowerMsg = input.toLowerCase();
    let action = '';

    if (lowerMsg.includes('produit') || lowerMsg.includes('product')) action = 'products';
    else if (lowerMsg.includes('panier') || lowerMsg.includes('cart')) action = 'cart';
    else if (lowerMsg.includes('paiement') || lowerMsg.includes('payment')) action = 'payment';
    else if (lowerMsg.includes('livraison') || lowerMsg.includes('delivery')) action = 'delivery';
    else if (lowerMsg.includes('contact')) action = 'contact';
    else if (lowerMsg.includes('à propos') || lowerMsg.includes('about')) action = 'about';
    else if (lowerMsg.includes('retour') || lowerMsg.includes('back') || input === '0') action = 'main';

    const response = handleOption(action);
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      options: response.options,
      action: response.action
    };
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    handleSend();
  };

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
                  {message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setInput(option.id);
                            handleSend();
                          }}
                          className="w-full text-left px-4 py-2 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded-lg text-sm font-medium hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
                        >
                          {option.id}. {option.label}
                        </button>
                      ))}
                    </div>
                  )}
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
                {locale === 'fr' ? 'Tapez le numéro de votre choix :' : 'Type the number of your choice :'}
              </p>
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
