import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const RPI_URL = env.RPI_ENDPOINT_URL || 'http://100.122.214.106:8080';

export const GET: RequestHandler = async () => {
    try {
        const upstream = await fetch(`${RPI_URL}/stream`, {
            headers: {
                'x-api-key': env.API_SECRET_KEY || 'mtpd_sec_7x9Qk2vL4mN8pW1zR6yH3cB5fJ0dK4tG'
            }
        });

        if (!upstream.ok || !upstream.body) {
            return new Response('Live stream not available from Raspberry Pi edge node', { 
                status: 502,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        return new Response(upstream.body, {
            status: 200,
            headers: {
                'Content-Type': upstream.headers.get('content-type') || 'multipart/x-mixed-replace; boundary=frame',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Connection': 'keep-alive',
                'Pragma': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        });
    } catch (e: any) {
        return new Response(`Stream proxy error: ${e.message}`, { 
            status: 502,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
};
