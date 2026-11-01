import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ cookies }) => {
		// Hapus cookie sesi
		cookies.delete('sparrow_session', { path: '/' });
		throw redirect(303, '/login');
	}
} satisfies Actions;
