import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { verifySignedSessionToken, SESSION_COOKIE_NAME } from '$lib/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);
	const isAuthenticated = verifySignedSessionToken(sessionToken);
	const isLoginPage = event.url.pathname === '/login';
	const isApiRoute = event.url.pathname.startsWith('/api');

	// Jika belum terotentikasi dan mencoba mengakses selain login
	if (!isAuthenticated && !isLoginPage) {
		if (isApiRoute) {
			return new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Sesi tidak valid atau telah berakhir' } }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		throw redirect(303, '/login');
	}

	// Jika sudah login tapi mencoba masuk ke halaman login
	if (isAuthenticated && isLoginPage) {
		throw redirect(303, '/');
	}

	const response = await resolve(event);
	return response;
};
