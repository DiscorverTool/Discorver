import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {env} from '$env/dynamic/private';

export const GET: RequestHandler = async({ url }) => {
	const token = env.DISCORD_TOKEN;
    if (!token) {
        throw error(500, 'DISCORD_TOKEN is not set in environment variables');
    }
    const userId = url.searchParams.get('id');
    if (!userId) {
        throw error(400, 'User ID is required');
    }

    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
        headers: {
            'Authorization': `Bot ${token}`
        }
    });

    if (!response.ok) {
        throw error(response.status, `Failed to fetch user: ${response.statusText}`);
    }
    
    const userData = await response.json();
    return new Response(JSON.stringify(userData), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};