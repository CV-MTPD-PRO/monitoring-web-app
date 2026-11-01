import { env } from '$env/dynamic/private';

function cleanEnv(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  return val.trim().replace(/^["']|["']$/g, '');
}

const PRIMARY_URL = cleanEnv(env.RPI_ENDPOINT_URL, 'https://embed.matapadi.biz.id');
const FALLBACK_URL = PRIMARY_URL.includes('embed.matapadi.biz.id') 
  ? 'http://100.122.214.106:8080' 
  : 'https://embed.matapadi.biz.id';

const API_KEY = cleanEnv(env.API_SECRET_KEY, 'mtpd_sec_7x9Qk2vL4mN8pW1zR6yH3cB5fJ0dK4tG');

/**
 * Robust fetch wrapper that queries Raspberry Pi via primary endpoint
 * and automatically falls back to secondary tunnel if primary fails or times out.
 */
export async function fetchRpi(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('x-api-key')) {
    headers.set('x-api-key', API_KEY);
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. Coba Primary Endpoint dengan Timeout 3.5 detik
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${PRIMARY_URL}${cleanPath}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timer);

    if (res.ok) return res;
    // Jika 401 atau error lain dari server yang merespon, kembalikan langsung
    if (res.status === 401 || res.status === 403) return res;
  } catch (err) {
    // Primary gagal (timeout, ECONNREFUSED, unroutable IP di Docker overlay)
  }

  // 2. Fallback Otomatis ke Secondary Endpoint (Cloudflare Tunnel atau Tailscale)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${FALLBACK_URL}${cleanPath}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timer);
    return res;
  } catch (err: any) {
    throw new Error(`Koneksi ke RPi gagal di kedua jalur: ${err.message}`);
  }
}

