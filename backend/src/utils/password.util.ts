import * as argon2 from 'argon2';

/**
 * Argon2id password hashing parameters according to docs/SECURITY_REQUIREMENTS.md:
 * - Algorithm: Argon2id
 * - Memory cost: 65536 KiB (64 MiB)
 * - Time cost (iterations): 3
 * - Parallelism (threads/lanes): 4
 */
const ARGON2_OPTIONS: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

/**
 * Hashes a plaintext password using Argon2id with cryptographically secure salt.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { ...ARGON2_OPTIONS, raw: false });
}

/**
 * Verifies a plaintext password against an Argon2id hash.
 * Resistant to timing attacks.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error('[Auth] Password verification error:', err);
    return false;
  }
}
