import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';
import { createSignedSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '$lib/auth';

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username');
		const password = data.get('password');

		let rawEnvUser = process.env['DASHBOARD_USERNAME'] || env.DASHBOARD_USERNAME;
		let rawEnvPass = process.env['DASHBOARD_PASSWORD'] || env.DASHBOARD_PASSWORD;
		
		let envUsername = rawEnvUser || 'admin';
		let envPassword = rawEnvPass || 'matapadi123';
		
		envUsername = envUsername.replace(/^["']|["']$/g, '');
		envPassword = envPassword.replace(/^["']|["']$/g, '');

		const isUserMatch = username && username.toString().trim() === envUsername;
		const isPassMatch = password && password.toString().trim() === envPassword;

		if (isUserMatch && isPassMatch) {
			const signedToken = createSignedSessionToken(envUsername);
			cookies.set(SESSION_COOKIE_NAME, signedToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				maxAge: SESSION_MAX_AGE_SECONDS
			});

			throw redirect(303, '/');
		}

		return fail(401, { 
			incorrect: true
		});
	}
} satisfies Actions;
