/**
 * Decodes the payload of a JWT token without verifying the signature.
 *
 * ⚠️ SECURITY NOTE:
 * This is used ONLY for reading non-sensitive claims (like the user's role)
 * to drive UI decisions. The actual access control is enforced server-side.
 * Never trust client-side role checks for sensitive operations.
 *
 * @param {string} token - A JWT string
 * @returns {Object|null} The decoded payload, or null if invalid
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // The payload is the second segment, Base64Url encoded
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Pad the string if necessary
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    // Malformed token — return null silently
    return null;
  }
}

/**
 * Extracts the user's role from the JWT token.
 * Returns the role string (e.g. "ROLE_ADMIN", "ROLE_USER") or null.
 *
 * @param {string} token
 * @returns {string|null}
 */
export function getRoleFromToken(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // Spring Boot JWT usually stores roles in one of these fields:
  return payload.role || payload.roles?.[0] || payload.authorities?.[0] || null;
}
