import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizePlainText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

export function sanitizeInput(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';
  return sanitizePlainText(input).slice(0, maxLength);
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned) ? cleaned.slice(0, 254) : '';
}

export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^0-9+\-().\s]/g, '').trim().slice(0, 30);
}

export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return sanitizePlainText(name).slice(0, 100);
}

export function sanitizeAddress(address: string): string {
  if (!address || typeof address !== 'string') return '';
  return sanitizePlainText(address).slice(0, 300);
}

export function sanitizeNumeric(value: string | number): number | null {
  if (typeof value === 'number') {
    return isNaN(value) || !isFinite(value) ? null : value;
  }
  if (!value || typeof value !== 'string') return null;
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) || !isFinite(num) ? null : num;
}

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  
  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) {
      return '';
    }
    return trimmed.slice(0, 2048);
  } catch {
    if (trimmed.startsWith('/') && !trimmed.includes('//')) {
      return sanitizePlainText(trimmed).slice(0, 500);
    }
    return '';
  }
}

export function sanitizeTextarea(text: string, maxLength = 5000): string {
  if (!text || typeof text !== 'string') return '';
  return sanitizePlainText(text).slice(0, maxLength);
}

export function sanitizeRichText(html: string, maxLength = 10000): string {
  if (!html || typeof html !== 'string') return '';
  return sanitizeHtml(html).slice(0, maxLength);
}

export function createSanitizedFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      if (key.toLowerCase().includes('email')) {
        (sanitized as any)[key] = sanitizeEmail(value);
      } else if (key.toLowerCase().includes('phone')) {
        (sanitized as any)[key] = sanitizePhone(value);
      } else if (key.toLowerCase().includes('name')) {
        (sanitized as any)[key] = sanitizeName(value);
      } else if (key.toLowerCase().includes('address')) {
        (sanitized as any)[key] = sanitizeAddress(value);
      } else if (key.toLowerCase().includes('message') || key.toLowerCase().includes('notes') || key.toLowerCase().includes('description')) {
        (sanitized as any)[key] = sanitizeTextarea(value);
      } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
        (sanitized as any)[key] = sanitizeUrl(value);
      } else {
        (sanitized as any)[key] = sanitizeInput(value);
      }
    }
  }
  
  return sanitized;
}
