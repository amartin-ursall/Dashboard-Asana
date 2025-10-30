/**
 * Generates a UUID v4 with fallback for browsers that don't support crypto.randomUUID()
 * @returns A UUID v4 string
 */
export function generateUUID(): string {
  // Try to use native crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (error) {
      console.warn('crypto.randomUUID failed, falling back to manual generation', error);
    }
  }

  // Fallback 1: Use crypto.getRandomValues (better browser support)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    try {
      return generateUUIDv4WithCrypto();
    } catch (error) {
      console.warn('crypto.getRandomValues failed, falling back to Math.random', error);
    }
  }

  // Fallback 2: Use Math.random (least secure but most compatible)
  return generateUUIDv4WithMath();
}

/**
 * Generates a UUID v4 using crypto.getRandomValues
 */
function generateUUIDv4WithCrypto(): string {
  // Use Uint8Array for better performance
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Set version (4) and variant bits according to RFC 4122
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

  // Convert to hex string in UUID format
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Generates a UUID v4 using Math.random (fallback for older browsers)
 * Note: This is less cryptographically secure but more compatible
 */
function generateUUIDv4WithMath(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
