'use client';

import dynamic from 'next/dynamic';

const ChatBot = dynamic(() => import('./chatbot/ChatBot'), {
  ssr: false,
  loading: () => null,
});

export default function ClientExtras() {
  return <ChatBot />;
}
