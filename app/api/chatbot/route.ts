import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCatalogSnapshot } from '@/lib/catalog-cache';
import {
  buildSiteKnowledgeContext,
  findLocalChatbotAnswer,
} from '@/lib/chatbot-knowledge';

const BASE_SYSTEM = `Tu es l'assistant commercial d'ADS (Angela Diagnostics et Services), distributeur de réactifs de laboratoire au Cameroun.
Réponds UNIQUEMENT à partir du CONTEXTE SITE ci-dessous. Si une info manque, invite à /contact ou /products.
Réponses courtes (2-4 phrases), professionnelles, en français sauf si l'utilisateur écrit en anglais.
Ne donne pas de conseils médicaux.`;

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];

export async function POST(request: NextRequest) {
  try {
    const { message, lang } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    const locale: 'fr' | 'en' = lang === 'en' ? 'en' : 'fr';
    const snapshot = await getCatalogSnapshot();
    const { products, laboratories, categories } = snapshot;

    const localAnswer = findLocalChatbotAnswer(
      message,
      products,
      laboratories,
      categories,
      locale
    );
    if (localAnswer) {
      return NextResponse.json({ response: localAnswer, source: 'catalog' });
    }

    const siteContext = buildSiteKnowledgeContext(
      products,
      laboratories,
      categories,
      locale
    );
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        response:
          locale === 'fr'
            ? `Je peux vous orienter vers notre catalogue (/products) ou notre page contact (/contact). Pour « ${message} », contactez-nous au ${process.env.NEXT_PUBLIC_CONTACT_PHONE || '+237 697 12 13 28'}.`
            : `Browse our catalog at /products or contact us at /contact for "${message}".`,
        source: 'fallback',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = `${BASE_SYSTEM}\n\n--- CONTEXTE SITE ---\n${siteContext}\n\n--- QUESTION ---\n${message}`;

    let lastError: Error | null = null;
    for (const modelName of GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text?.trim()) {
          return NextResponse.json({ response: text.trim(), source: 'gemini' });
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Gemini model ${modelName} failed:`, lastError.message);
      }
    }

    const fallback =
      locale === 'fr'
        ? `Je n'ai pas pu générer une réponse détaillée. Consultez notre catalogue : /products — ou contactez-nous : /contact.`
        : `I could not generate a detailed answer. See /products or /contact.`;

    return NextResponse.json({
      response: fallback,
      source: 'fallback',
      debug: lastError?.message,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur chatbot:', error);
    return NextResponse.json(
      { error: `Erreur lors de la génération de la réponse: ${msg}` },
      { status: 500 }
    );
  }
}
