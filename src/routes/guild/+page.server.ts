import type { PageServerLoad } from './$types';
import { validateSnowflake } from '$lib';

export const load: PageServerLoad = async ({ url, fetch, request }) => {
    const guildId = url.searchParams.get('id');

    if (!guildId) {
        return { guild: null };
    }

    if (!request.headers.get('user-agent')?.toLowerCase().includes('discordbot')) {
        // We only want to serve this data to Discord's bot for rich embeds, this is in no way a security measure any more than ensuring we don't make requests directly
        // for any clients that are capable of making it themselves.
        return { guild: null };
    }

    try {
        validateSnowflake(guildId);

        const res = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`);

        if (!res.ok) {
            return { guild: null, error: 'Failed to fetch guild' };
        }

        const guild = await res.json();
        
        // If the guild has an instant invite, fetch invite data for additional info
        let inviteData = null;
        if (guild.instant_invite) {
            const inviteCode = guild.instant_invite.split('/').pop();
            console.log('[Guild Server] Found instant invite, code:', inviteCode);
            if (inviteCode) {
                try {
                    const inviteRes = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);
                    if (inviteRes.ok) {
                        inviteData = await inviteRes.json();
                        console.log('[Guild Server] Successfully fetched invite data:', {
                            guild: inviteData.guild?.name,
                            members: inviteData.approximate_member_count,
                            online: inviteData.approximate_presence_count
                        });
                    } else {
                        console.log('[Guild Server] Invite fetch failed with status:', inviteRes.status);
                    }
                } catch (inviteError) {
                    // Silently fail if invite fetch fails, we still have guild data
                    console.error('[Guild Server] Failed to fetch invite data:', inviteError);
                }
            }
        } else {
            console.log('[Guild Server] No instant invite available for guild');
        }
        
        return { guild, inviteData };
    } catch (e) {
        return { guild: null, error: (e as Error).message };
    }
};
