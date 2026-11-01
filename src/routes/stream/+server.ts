import type { RequestHandler } from './$types';
import { fetchRpi } from '$lib/rpiClient';

export const GET: RequestHandler = async () => {
    try {
        const upstream = await fetchRpi('/stream');

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

