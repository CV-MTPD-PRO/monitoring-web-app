import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username');
		const password = data.get('password');

		// Mencegah Vite melakukan static replacement saat build
		let rawEnvUser = process.env['DASHBOARD_USERNAME'] || env.DASHBOARD_USERNAME;
		let rawEnvPass = process.env['DASHBOARD_PASSWORD'] || env.DASHBOARD_PASSWORD;
		
		// Gunakan nilai dari .env, atau gunakan fallback default jika .env tidak disetel/kosong
		let envUsername = rawEnvUser || 'admin';
		let envPassword = rawEnvPass || 'matapadi123';
		
		// Pembersih tanda kutip jika terbawa dari .env
		envUsername = envUsername.replace(/^["']|["']$/g, '');
		envPassword = envPassword.replace(/^["']|["']$/g, '');

		// Validasi kedua field
		const isUserMatch = username && username.toString().trim() === envUsername;
		const isPassMatch = password && password.toString().trim() === envPassword;

		if (isUserMatch && isPassMatch) {
			cookies.set('sparrow_session', 'authenticated_true', {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 1 minggu
			});

			throw redirect(303, '/');
		}

		// Ambil 5 keys terakhir dari process.env untuk membuktikan apakah Docker meneruskan env
		const envKeys = Object.keys(process.env).slice(-5).join(', ');

		return fail(401, { 
			incorrect: true
		});
	}
} satisfies Actions;
