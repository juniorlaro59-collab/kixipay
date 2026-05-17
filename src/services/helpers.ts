export function normalizeAngolaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("244")) return `+${digits}`;
  return `+244${digits}`;
}

export function fallbackBiNumber(seed: string): string {
  const digits = seed.replace(/\D/g, "").slice(-9).padStart(9, "0");
  return `${digits}LA000`;
}
