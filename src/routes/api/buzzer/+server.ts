import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchRpi } from '$lib/rpiClient';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const mode = body.mode; // 'force_on' atau 'auto'

        const res = await fetchRpi('/api/buzzer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mode })
        });

        if (!res.ok) {
            throw new Error(`Failed to communicate with RPi: status ${res.status}`);
        }

        const data = await res.json();
        return json({ success: true, data });
    } catch (e: any) {
        return json({ success: false, error: e.message }, { status: 500 });
    }
};
