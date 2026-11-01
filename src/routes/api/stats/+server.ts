import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchRpi } from '$lib/rpiClient';

export const GET: RequestHandler = async () => {
    try {
        const res = await fetchRpi('/stats');
        
        if (!res.ok) {
            return json({ status: 'offline', error: `RPi status ${res.status}` }, { status: 502 });
        }
        
        const data = await res.json();
        return json(data);
    } catch (e: any) {
        return json({ status: 'offline', error: e.message || 'Connection Failed' }, { status: 500 });
    }
};
