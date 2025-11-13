import type { PageServerLoad } from './$types';
import { validateSnowflake } from '$lib';

export const load: PageServerLoad = async ({ url, fetch, request }) => {
    const userId = url.searchParams.get('id');

    if (!userId) {
        return { user: null };
    }

    if (!request.headers.get('user-agent')?.toLowerCase().includes('discordbot')) {
        // We only want to serve this data to Discord's bot for rich embeds, this is in no way a security measure any more than ensuring we don't make requests directly
        // for any clients that are capable of making it themselves.
        return { user: null };
    }

    try {
        validateSnowflake(userId);

        const res = await fetch(`/user/lookup?id=${userId}`);

        if (!res.ok) {
            return { user: null, error: 'Failed to fetch user' };
        }

        const user = await res.json();
        return { user };
    } catch (e) {
        return { user: null, error: (e as Error).message };
    }
};