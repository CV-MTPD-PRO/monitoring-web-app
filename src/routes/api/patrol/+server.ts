import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchRpi } from '$lib/rpiClient';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const mode = body.mode; // 'start' atau 'stop'

        const res = await fetchRpi('/api/camera/patrol', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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

