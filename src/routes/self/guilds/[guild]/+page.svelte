<script lang="ts">
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import type { Guild } from "../../types";
    import { PERMISSIONS } from "../../types";
    import NoBanner from "$lib/assets/placeholders/no-banner.svg";
    import { fetchWithCache, getAccessToken } from "$lib";
    import { Card, LoadingIndicator, Icon } from "m3-svelte";
    import iconCrown from '@ktibow/iconset-material-symbols/crown-outline';
    import iconConstruction from '@ktibow/iconset-material-symbols/construction';
    import iconShield from '@ktibow/iconset-material-symbols/shield-outline';

    let guildId = page.params.guild;
    let guild: Guild | null = null;
    let loading = true;

    function formatName(perm: string): string {
        return perm
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    onMount(async () => {
        const auth = getAccessToken();

        const response = await fetchWithCache(
            "https://discord.com/api/v10/users/@me/guilds",
            {
                headers: {
                    Authorization: `${auth.token_type} ${auth.token}`,
                },
            },
        );

        if (response.ok) {
            const guilds: Array<Guild> = await response.json();
            guild = guilds.find((g) => g.id === guildId) || null;

            loading = false;
        } else {
            console.error("Failed to fetch guilds:", response.statusText);
        }
    });
</script>

<svelte:head>
    <title
        >{guild
            ? `${guild.name} • Guild Details • Discorver`
            : "Guild Details • Discorver"}</title
    >
</svelte:head>

{#if loading}
    <center>
        <LoadingIndicator />
    </center>
{:else if !guild}
    <center>
        <p>Guild not found or you are not a member of this guild.</p>
    </center>
{:else if guild !== null}
    <center>
        <div class="guild-card">
            <Card variant="elevated">
                <div class="guild">
                    <div class="basic-info">
                        <img
                            src={guild.banner
                                ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=512`
                                : NoBanner}
                            alt="Guild Banner"
                            style="max-width: 100%; height: auto; border-radius: 8px;"
                        />
                        <div class="row">
                            <img
                                src={guild.icon
                                    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
                                    : "https://cdn.discordapp.com/embed/avatars/0.png"}
                                alt="Guild Icon"
                                style="width: 64px; height: 64px; border-radius: 50%;"
                            />
                            <h2>{guild.name}</h2>
                        </div>
                    </div>
                    <div class="details">
                        <div class="row">
                            <p>
                                Rank: {guild.owner
                                    ? "Owner"
                                    : (BigInt(guild.permissions) &
                                            BigInt(0x8)) ===
                                        BigInt(0x8)
                                      ? "Administrator"
                                      : (BigInt(guild.permissions) &
                                              BigInt(0x20)) ===
                                          BigInt(0x20)
                                        ? "Moderator"
                                        : "Member"}
                            </p>
                            <div class="icon">
                                {#if guild.owner}
                                    <Icon icon={iconCrown} />
                                {:else if (BigInt(guild.permissions) & BigInt(0x8))}
                                    <Icon icon={iconConstruction} />
                                {:else if (BigInt(guild.permissions) & BigInt(0x20))}
                                    <Icon icon={iconShield} />
                                {/if}
                            </div>
                        </div>
                        <p>
                            Permissions (<a
                                href="https://discordlookup.com/permissions-calculator/{guild.permissions}"
                                target="_blank"
                                rel="noopener noreferrer">View Calculator</a
                            >):
                            {#each Object.keys(PERMISSIONS).filter((perm) => (BigInt(guild?.permissions || "0") & BigInt(perm)) === BigInt(perm)) as perm, index (perm)}
                                <span class="chip"
                                    >{formatName(
                                        PERMISSIONS[
                                            perm as unknown as keyof typeof PERMISSIONS
                                        ],
                                    )}</span
                                >
                            {/each}
                        </p>
                        <p>
                            Features:
                            {#if guild.features.length === 0}
                                <span class="chip">None</span>
                            {:else}
                                {#each guild.features as feature}
                                    <span class="chip"
                                        >{formatName(feature)}</span
                                    >
                                {/each}
                            {/if}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    </center>
{/if}

<style>
    .guild-card {
        max-width: 35rem;
        width: 75%;
        margin: auto;
    }

    @media (max-width: 600px) {
        .guild-card {
            width: 90%;
            max-width: none;
        }
    }

    .guild {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .basic-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .row {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .details {
        text-align: left;
    }

    .chip {
        display: inline-block;
        background-color: rgb(var(--m3-scheme-surface-container));
        border-radius: 16px;
        padding: 4px 12px;
        margin: 2px;
        font-size: 0.875rem;
    }

    .icon {
        display: flex;
        align-items: center;
    }
</style>
