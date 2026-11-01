import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const mode = body.mode; // 'force_on' atau 'auto'

        // Teruskan perintah ke RPi via Tailscale (Bypass Cloudflare)
        const res = await fetch('http://100.122.214.106:8080/api/buzzer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': env.API_SECRET_KEY || 'mtpd_sec_7x9Qk2vL4mN8pW1zR6yH3cB5fJ0dK4tG'
            },
            body: JSON.stringify({ mode })
        });

        if (!res.ok) {
            throw new Error('Failed to communicate with RPi Tunnel');
        }

        const data = await res.json();
        return json({ success: true, data });
    } catch (e) {
        return json({ success: false, error: e.message }, { status: 500 });
    }
};
