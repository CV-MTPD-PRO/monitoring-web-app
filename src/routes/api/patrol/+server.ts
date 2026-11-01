import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const RPI_URL = env.RPI_ENDPOINT_URL || 'http://100.122.214.106:8080';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const mode = body.mode; // 'start' atau 'stop'

        const res = await fetch(`${RPI_URL}/api/camera/patrol`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': env.API_SECRET_KEY || 'mtpd_sec_7x9Qk2vL4mN8pW1zR6yH3cB5fJ0dK4tG'
            },
            body: JSON.stringify({ mode })
        });

        if (!res.ok) {
            throw new Error(`RPI returned status ${res.status}`);
        }

        const data = await res.json();
        return json({ success: true, data });
    } catch (e: any) {
        return json({ success: false, error: e.message }, { status: 502 });
    }
};

