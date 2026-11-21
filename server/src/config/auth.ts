export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim().length < 64) {
    throw new Error('JWT_SECRET must be set to a cryptographically random value of at least 64 characters.');
  }

  return secret;
}
