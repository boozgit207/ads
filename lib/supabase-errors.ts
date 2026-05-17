/** Erreurs Cloudflare / indisponibilité Supabase (HTML dans le message). */
export function isTransientSupabaseError(error: { message?: string; code?: string } | null): boolean {
  if (!error?.message) return false;
  const msg = error.message;
  return (
    msg.includes('<!DOCTYPE') ||
    msg.includes('Connection timed out') ||
    msg.includes('522') ||
    msg.includes('525') ||
    msg.includes('ECONNRESET') ||
    msg.includes('fetch failed')
  );
}

export function logCatalogError(label: string, error: unknown): void {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String((error as { message: string }).message);
    if (msg.includes('<!DOCTYPE')) {
      console.warn(`${label}: base de données temporairement indisponible (timeout réseau)`);
      return;
    }
  }
  console.error(label, error);
}
