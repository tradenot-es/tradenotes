// Same rule as the server (server/src/auth.ts, minPasswordLength). Length beats composition rules:
// a long passphrase is stronger than "Passw0rd!" and easier to remember (NIST SP 800-63B).
export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;
