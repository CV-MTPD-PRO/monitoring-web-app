import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Fitur Keamanan: Membaca cookie sesi
	const session = event.cookies.get('sparrow_session');
	const isLoginPage = event.url.pathname === '/login';

	const isApiRoute = event.url.pathname.startsWith('/api');

	// Jika belum login dan mencoba mengakses halaman selain login
	if (!session && !isLoginPage) {
		if (isApiRoute) {
			// Cegah SvelteKit me-redirect fetch JSON ke halaman HTML
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		throw redirect(303, '/login');
	}

	// Jika sudah login tapi mencoba masuk ke halaman login, lemparkan ke dashboard
	if (session === 'authenticated_true' && isLoginPage) {
		throw redirect(303, '/');
	}

	const response = await resolve(event);
	return response;
};
