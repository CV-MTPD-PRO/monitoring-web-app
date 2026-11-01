import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const RPI_URL = env.RPI_ENDPOINT_URL || 'http://100.122.214.106:8080';

export const GET: RequestHandler = async () => {
    try {
        const res = await fetch(`${RPI_URL}/stats`, {
            headers: {
                'x-api-key': env.API_SECRET_KEY || 'mtpd_sec_7x9Qk2vL4mN8pW1zR6yH3cB5fJ0dK4tG'
            }
        });
        
        if (!res.ok) {
            return json({ status: 'offline', error: 'Tunnel offline' }, { status: 502 });
        }
        
        const data = await res.json();
        return json(data);
    } catch (e: any) {
        return json({ status: 'offline', error: 'Connection Failed' }, { status: 500 });
    }
};
