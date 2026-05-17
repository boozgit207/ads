/** Normalise un numéro pour comparaison (9 derniers chiffres Cameroun) */
export function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 9) {
    return digits.slice(-9);
  }
  return digits;
}

export function formatPhoneForStorage(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9 && cleaned.startsWith('6')) {
    cleaned = '237' + cleaned;
  }
  return cleaned;
}
