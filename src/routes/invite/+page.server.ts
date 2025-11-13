import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch, request }) => {
    const inviteCode = url.searchParams.get('code');

    if (!inviteCode) {
        return { invite: null };
    }

    if (!request.headers.get('user-agent')?.toLowerCase().includes('discordbot')) {
        return { invite: null };
    }

    try {
        // Standardize the invite code (remove URL parts if present)
        const standardizedCode = inviteCode.includes('/') 
            ? inviteCode.split('/').pop() || inviteCode
            : inviteCode;

        const res = await fetch(`https://discord.com/api/v10/invites/${standardizedCode}?with_counts=true`);

        if (!res.ok) {
            return { invite: null, error: 'Failed to fetch invite' };
        }

        const invite = await res.json();
        return { invite };
    } catch (e) {
        return { invite: null, error: (e as Error).message };
    }
}