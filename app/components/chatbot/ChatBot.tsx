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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('ads-language') as 'fr' | 'en';
    if (savedLang) setLang(savedLang);
    
    // Welcome message (no localStorage persistence)
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: lang === 'fr' 
        ? '👋 Bonjour ! Je suis l\'assistant ADS.\n\nJe peux vous aider avec :\n🔍 Recherche de produits\n🛒 Commande et panier\n💳 Paiement (Carte, OM, MTN, Virement)\n🚚 Livraison\n📞 Contact\n\nComment puis-je vous aider ?'
        : '👋 Hello! I\'m the ADS assistant.\n\nI can help you with:\n🔍 Product search\n🛒 Orders and cart\n💳 Payment (Card, OM, MTN, Bank Transfer)\n🚚 Delivery\n📞 Contact\n\nHow can I help you?',
      timestamp: new Date()
    }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): { content: string; action?: any } => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Product search
    if (lowerMsg.includes('covid') || lowerMsg.includes('test')) {
      return {
        content: lang === 'fr'
          ? '🧪 Tests COVID-19 disponibles :\n\n• Test Antigénique - 12 500 FCFA\n• Résultats en 15 minutes\n• Sensibilité 96.7%\n\nVoulez-vous voir tous nos tests rapides ?'
          : '🧪 COVID-19 tests available:\n\n• Rapid Antigen Test - 12,500 FCFA\n• Results in 15 minutes\n• Sensitivity 96.7%\n\nWould you like to see all our rapid tests?',
        action: {
          type: 'link',
          label: lang === 'fr' ? 'Voir les tests' : 'View tests',
          href: '/products?category=tests-rapides'
        }
      };
    }
    
    // Cart/Panier
    if (lowerMsg.includes('panier') || lowerMsg.includes('cart')) {
      const itemCount = cart.length;
      return {
        content: lang === 'fr'
          ? `🛒 Votre panier contient ${itemCount} article${itemCount > 1 ? 's' : ''}.\n\n${itemCount === 0 ? 'Ajoutez des produits pour commencer votre commande.' : 'Prêt à passer commande ?'}`
          : `🛒 Your cart has ${itemCount} item${itemCount > 1 ? 's' : ''}.\n\n${itemCount === 0 ? 'Add products to start your order.' : 'Ready to checkout?'}`,
        action: itemCount > 0 ? {
          type: 'link',
          label: lang === 'fr' ? 'Voir le panier' : 'View cart',
          href: '/cart'
        } : {
          type: 'link',
          label: lang === 'fr' ? 'Voir les produits' : 'View products',
          href: '/products'
        }
      };
    }
    
    // Payment/Paiement
    if (lowerMsg.includes('paiement') || lowerMsg.includes('payment') || lowerMsg.includes('payer')) {
      return {
        content: lang === 'fr'
          ? '💳 Modes de paiement acceptés :\n\n📱 Orange Money\n📱 MTN Mobile Money\n🏦 Virement bancaire\n\nTous les paiements sont sécurisés. Un reçu est généré après confirmation.'
          : '💳 Accepted payment methods:\n\n📱 Orange Money\n📱 MTN Mobile Money\n🏦 Bank Transfer\n\nAll payments are secure. A receipt is generated after confirmation.'
      };
    }
    
    // Order/Commande
    if (lowerMsg.includes('commande') || lowerMsg.includes('order') || lowerMsg.includes('acheter')) {
      return {
        content: lang === 'fr'
          ? '🛒 Pour passer une commande :\n\n1. Ajoutez des produits au panier\n2. Validez votre commande\n3. Choisissez le mode de paiement\n4. Recevez votre confirmation\n\nBesoin d\'aide pour un produit spécifique ?'
          : '🛒 To place an order:\n\n1. Add products to cart\n2. Checkout\n3. Choose payment method\n4. Receive confirmation\n\nNeed help with a specific product?',
        action: {
          type: 'link',
          label: lang === 'fr' ? 'Voir les produits' : 'View products',
          href: '/products'
        }
      };
    }
    
    // Delivery/Livraison
    if (lowerMsg.includes('livraison') || lowerMsg.includes('delivery')) {
      return {
        content: lang === 'fr'
          ? '🚚 Options de livraison :\n\n📍 Retrait gratuit - Yaoundé\n🚛 Livraison express - 1 500 FCFA (24-48h)\n🆓 Gratuit - Commandes > 500 000 FCFA\n\nLivraison dans toute l\'Afrique Centrale !'
          : '🚚 Delivery options:\n\n📍 Free pickup - Yaoundé\n🚛 Express delivery - 1,500 FCFA (24-48h)\n🆓 Free - Orders > 500,000 FCFA\n\nDelivery across Central Africa!'
      };
    }
    
    // Contact
    if (lowerMsg.includes('contact') || lowerMsg.includes('appeler') || lowerMsg.includes('whatsapp')) {
      return {
        content: lang === 'fr'
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
    if (lowerMsg.includes('aide') || lowerMsg.includes('help')) {
      return {
        content: lang === 'fr'
          ? '❓ Comment puis-je vous aider ?\n\n🔍 Rechercher un produit\n🛒 Vérifier le panier\n💳 Informations de paiement\n🚚 Options de livraison\n📞 Nous contacter\n\nChoisissez une option ci-dessus ou posez votre question.'
          : '❓ How can I help you?\n\n🔍 Search for a product\n🛒 Check cart\n💳 Payment information\n🚚 Delivery options\n📞 Contact us\n\nChoose an option above or ask your question.'
      };
    }
    
    // Stock inquiry
    if (lowerMsg.includes('stock') || lowerMsg.includes('disponible')) {
      return {
        content: lang === 'fr'
          ? '📦 Pour vérifier la disponibilité d\'un produit, utilisez notre page de recherche.\n\nLes stocks sont mis à jour en temps réel.\n\nQuel produit recherchez-vous ?'
          : '📦 To check product availability, use our search page.\n\nStock is updated in real-time.\n\nWhich product are you looking for?',
        action: {
          type: 'link',
          label: lang === 'fr' ? 'Rechercher' : 'Search',
          href: '/products'
        }
      };
    }
    
    // Default response
    return {
      content: lang === 'fr'
        ? `Je suis là pour vous aider !\n\nJe peux répondre à vos questions sur :\n• Nos produits\n• Le panier et les commandes\n• Les modes de paiement\n• La livraison\n• Le contact\n\nQue souhaitez-vous savoir ?`
        : `I'm here to help!\n\nI can answer questions about:\n• Our products\n• Cart and orders\n• Payment methods\n• Delivery\n• Contact\n\nWhat would you like to know?`
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

    // Simulate AI processing
    setTimeout(() => {
      const response = generateResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        action: response.action
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    handleSend();
  };

  const suggestions = [
    { icon: Package, label: lang === 'fr' ? 'Produits' : 'Products', action: lang === 'fr' ? 'Quels produits avez-vous ?' : 'What products do you have?' },
    { icon: ShoppingCart, label: lang === 'fr' ? 'Mon panier' : 'My cart', action: lang === 'fr' ? 'Mon panier' : 'My cart' },
    { icon: CreditCard, label: lang === 'fr' ? 'Paiement' : 'Payment', action: lang === 'fr' ? 'Modes de paiement' : 'Payment methods' },
    { icon: Truck, label: lang === 'fr' ? 'Livraison' : 'Delivery', action: lang === 'fr' ? 'Livraison' : 'Delivery' },
    { icon: Phone, label: lang === 'fr' ? 'Contact' : 'Contact', action: lang === 'fr' ? 'Contact' : 'Contact' },
    { icon: HelpCircle, label: lang === 'fr' ? 'Aide' : 'Help', action: lang === 'fr' ? 'Aide' : 'Help' }
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
                  {lang === 'fr' ? 'En ligne' : 'Online'}
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
                {lang === 'fr' ? 'Suggestions rapides :' : 'Quick suggestions :'}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 4).map((suggestion) => (
                  <button
                    key={suggestion.label}
                    onClick={() => {
                      handleQuickAction(suggestion.action);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
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
                placeholder={lang === 'fr' ? 'Posez votre question...' : 'Ask your question...'}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
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
