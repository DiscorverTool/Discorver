<script lang="ts">
    import { fetchWithCache, getAccessToken } from "$lib";
    import { Card, Icon, LoadingIndicator } from "m3-svelte";
    import NoBanner from "$lib/assets/placeholders/no-banner.svg";
    import iconCrown from '@ktibow/iconset-material-symbols/crown-outline';
    import iconConstruction from '@ktibow/iconset-material-symbols/construction';
    import iconShield from '@ktibow/iconset-material-symbols/shield-outline';
    import { onMount } from "svelte";
    import type { Guild } from "../types";

    let loading = true;
    let guilds: Array<Guild> = [];

    // Function to truncate guild names
    function truncateGuildName(name: string, maxLength: number = 20): string {
        if (name.length <= maxLength) {
            return name;
        }
        return name.substring(0, maxLength) + '...';
    }

    onMount(async () => {
        const auth = getAccessToken();

        const response = await fetchWithCache(
            "https://discord.com/api/v10/users/@me/guilds",
            {
                headers: {
                    Authorization: `${auth.token_type} ${auth.token}`,
                },
            }
        )

        if (response.ok) {
            guilds = await response.json();
            loading = false;
            console.table(guilds);
        } else {
            console.error("Failed to fetch guilds:", response.statusText);
        }
    });
</script>

<svelte:head>
    <title>Your Guilds • Discorver</title>
</svelte:head>

<h1>Your Guilds</h1>
{#if guilds.length === 0}
    <center>
        <p>
            {#if loading}
                <LoadingIndicator />
            {:else}
                You are not a member of any guilds.
            {/if}
        </p>
    </center>
{:else}
    <center>
        <!-- Total: {guilds.length} | You own: {guilds.filter(g => g.owner).length} | You Administrate: {guilds.filter(g => (parseInt(g.permissions) & 0x8) === 0x8).length} | You Moderate: {guilds.filter(g => (parseInt(g.permissions) & 0x20) === 0x20).length} -->
        <p class="chip">
            Total: {guilds.length}
        </p>
        <p class="chip">
            You own: {guilds.filter(g => g.owner).length} ({((guilds.filter(g => g.owner).length / guilds.length) * 100).toFixed(1)}%)
        </p>
        <p class="chip">
            You Administrate: {guilds.filter(g => (BigInt(g.permissions) & BigInt(0x8)) === BigInt(0x8) && !g.owner).length} ({((guilds.filter(g => (BigInt(g.permissions) & BigInt(0x8)) === BigInt(0x8) && !g.owner).length / guilds.length) * 100).toFixed(1)}%)
        </p>
        <p class="chip">
            You Moderate: {guilds.filter(g => (BigInt(g.permissions) & BigInt(0x20)) === BigInt(0x20) && !g.owner && !(BigInt(g.permissions) & BigInt(0x8))).length} ({((guilds.filter(g => (BigInt(g.permissions) & BigInt(0x20)) === BigInt(0x20) && !g.owner && !(BigInt(g.permissions) & BigInt(0x8))).length / guilds.length) * 100).toFixed(1)}%)
        </p>
        <p class="chip">
            Other: {guilds.filter(g => !(g.owner) && !(BigInt(g.permissions) & BigInt(0x8)) && !(BigInt(g.permissions) & BigInt(0x20))).length} ({((guilds.filter(g => !(g.owner) && !(BigInt(g.permissions) & BigInt(0x8)) && !(BigInt(g.permissions) & BigInt(0x20))).length / guilds.length) * 100).toFixed(1)}%)
        </p>
    </center><br/>
    <div class="guilds-list">
        {#each guilds as guild}
            <div class="guild-card">
                <Card
                    variant="elevated"
                    onclick={() => {
                        window.location.href = `/self/guilds/${guild.id}`;
                    }}
                >
                    <div class="guild">
                        <div class="basic-info">
                            <img
                                src={guild.banner ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=512` : NoBanner}
                                alt="Guild Banner"
                                class="guild-banner"
                                class:placeholder={!guild.banner}
                                style="width: 50rem; height: 12.5rem; border-radius: 8px; margin-bottom: 16px; max-width: 100%;"
                            />
                            <div class="row">
                                <div class="icon">
                                    {#if guild.icon}
                                        <img
                                            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=256`}
                                            alt="Guild Icon"
                                        />
                                    {:else}
                                        <img
                                            src="https://cdn.discordapp.com/embed/avatars/0.png"
                                            alt="No Guild Icon"
                                        />
                                    {/if}
                                </div>
                                <div class="identity">
                                    <div class="row">
                                        <h2 class="guild-name" title={guild.name}>{truncateGuildName(guild.name)}</h2>
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
                                    <p class="small" style="margin: 0;">{guild.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        {/each}
    </div>
{/if}

<style>
    .guilds-list {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        justify-content: center;
    }

    .guild-card {
        width: 30%;
        max-width: 50rem;
    }

    .guild {
        width: 100%;
        max-width: 100%;
    }

    @media (max-width: 900px) {
        .guild-card {
            width: 100%;
            max-width: 100%;
        }
    }

    @media (max-width: 600px) {
        .guild-card {
            width: 100%;
            max-width: 100%;
        }
    }

    .icon {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .icon img {
        width: 64px;
        height: 64px;
        border-radius: 8px;
    }

    .chip {
        display: inline-block;
        background-color: rgb(var(--m3-scheme-surface-bright));
        border-radius: 16px;
        padding: 4px 12px;
        margin: 2px;
        font-size: 0.875rem;
    }

    .guild-banner {
        object-fit: cover;
        background-color: #9ba9ef;
    }

    .guild-banner.placeholder {
        object-fit: contain;
    }

    .guild-name {
        margin-top: 0;
        margin-bottom: .5rem;
        flex: 1;
    }

    .row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .identity .row {
        justify-content: space-between;
        width: 100%;
    }

    .basic-info .row {
        gap: 16px;
    }
</style>
