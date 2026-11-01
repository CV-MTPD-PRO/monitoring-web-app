import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

const SESSION_SECRET = env.SESSION_SECRET_KEY || 'mtpd_sec_7x9Qk2vL4mN8pW1zR6yH3cB5fJ0dK4tG_session_signing_key_2026';
export const SESSION_COOKIE_NAME = 'sparrow_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 1 minggu

export function createSignedSessionToken(username: string): string {
    const payload = `${username}:${Date.now()}`;
    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    return `${Buffer.from(payload).toString('base64url')}.${signature}`;
}

export function verifySignedSessionToken(token: string | undefined): boolean {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [encodedPayload, signature] = parts;
    try {
        const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
        const [username, timestampStr] = payload.split(':');
        const timestamp = parseInt(timestampStr, 10);

        if (isNaN(timestamp)) return false;
        // Cek kadaluarsa sesi
        if (Date.now() - timestamp > SESSION_MAX_AGE_SECONDS * 1000) return false;

        const hmac = crypto.createHmac('sha256', SESSION_SECRET);
        hmac.update(payload);
        const expectedSignature = hmac.digest('hex');

        const sigBuf = Buffer.from(signature, 'hex');
        const expBuf = Buffer.from(expectedSignature, 'hex');

        if (sigBuf.length !== expBuf.length) return false;

        return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
        return false;
    }
}

