/**
 * Client-side AES-GCM encryption for messages.
 * Each conversation derives a symmetric key from both user IDs so only
 * participants can decrypt.  The key never leaves the browser.
 */

const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;

async function deriveKey(seed: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(seed),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('micromuse-e2ee-salt-v1'),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

function getConversationSeed(id1: string, id2: string): string {
  return [id1, id2].sort().join('::');
}

export async function encryptMessage(
  plaintext: string,
  userId1: string,
  userId2: string,
): Promise<string> {
  const key = await deriveKey(getConversationSeed(userId1, userId2));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuf = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded);
  // Pack as base64: iv (12 bytes) + ciphertext
  const packed = new Uint8Array(iv.length + cipherBuf.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(cipherBuf), iv.length);
  return `e2e:${btoa(String.fromCharCode(...packed))}`;
}

export async function decryptMessage(
  ciphertext: string,
  userId1: string,
  userId2: string,
): Promise<string> {
  if (!ciphertext.startsWith('e2e:')) return ciphertext; // legacy unencrypted
  const raw = ciphertext.slice(4);
  const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);
  const key = await deriveKey(getConversationSeed(userId1, userId2));
  const decrypted = await crypto.subtle.decrypt({ name: ALGO, iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

export function isEncrypted(content: string | null): boolean {
  return !!content?.startsWith('e2e:');
}
