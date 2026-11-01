import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async () => {
    try {
        // Modular Monolith: Backend menyedot data dari RPi via Tailscale (Bypass Cloudflare)
        const res = await fetch('http://100.122.214.106:8080/stats', {
            headers: {
                'x-api-key': env.API_SECRET_KEY || 'mtpd_sec_7x9Qk2vL4mN8pW1zR6yH3cB5fJ0dK4tG'
            }
        });
        
        if (!res.ok) {
            return json({ status: 'offline', error: 'Tunnel offline' }, { status: 502 });
        }
        
        const data = await res.json();
        return json(data);
    } catch (e) {
        return json({ status: 'offline', error: 'Connection Failed' }, { status: 500 });
    }
};
