<script lang="ts">
    import { page } from "$app/state";
    import { fetchWithCache } from "$lib";
    import { Button, Card, Icon, LoadingIndicator, TextField } from "m3-svelte";
    import { onMount } from "svelte";
    import iconSearch from "@ktibow/iconset-material-symbols/search";
    import type { WidgetResult } from "./types";
    import { ChannelType, type APIInvite } from "discord-api-types/v10";
    import UserCard from "../user/UserCard.svelte";
    import type { User } from "../user/types";

    let guildId = page.url.searchParams.get("id") || "";
    let guild: WidgetResult | null = null;
    let inviteData: APIInvite | null = null;
    let fetching = false;
    let fetchFailed = false;
    let fetchError = "";

    async function fetchWidget(): Promise<WidgetResult | null> {
        const response = await fetchWithCache(
            `https://discord.com/api/guilds/${guildId}/widget.json`,
            {},
            60 * 1000, // cache for 1 minute
        );

        if (response.ok) {
            return response.json() as unknown as WidgetResult;
        }

        return null;
    }

    async function fetchGuildData() {
        fetching = true;
        fetchFailed = false;
        fetchError = "";

        if (guildId) {
            const widgetResult = await fetchWidget();

            if (widgetResult) {
                guild = widgetResult;
            } else {
                guild = null;
                fetchFailed = true;
                fetchError =
                    "Failed to fetch guild data. Please ensure the Guild ID is correct and the guild has the widget enabled.";
            }
        } else {
            fetchFailed = true;
            fetchError = "Please enter a Guild ID.";
        }

        if (guild?.instant_invite) {
            const inviteCode = guild.instant_invite.split("/").pop();
            if (!inviteCode) return (fetching = false);

            const inviteResponse = await fetchWithCache(
                `https://discord.com/api/invites/${inviteCode}?with_counts=true`,
                {},
                60 * 1000, // cache for 1 minute
            );

            if (inviteResponse.ok) {
                inviteData = await inviteResponse.json();
            }
        }

        fetching = false;
    }

    onMount(async () => {
        if (guildId) {
            await fetchGuildData();
        }
    });

    function formatName(input: string): string {
        return input
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
</script>

<h1>Guild Lookup</h1>
<center>
    <p>
        Looking to look up a guild by invite? Check out the <a href="/invite"
            >invite resolver</a
        >.
    </p>
</center>
<center>
    <div class="row input">
        <TextField label="Guild ID" bind:value={guildId} />
        <Button variant="filled" onclick={async () => await fetchGuildData()}>
            <Icon icon={iconSearch} />
        </Button>
    </div>

    {#if fetching}
        <LoadingIndicator />
    {:else if fetchFailed}
        <Card variant="filled" style="margin-top: 1rem; max-width: 400px;">
            <p style="color: red;">{fetchError}</p>
        </Card>
    {/if}
</center>

<center style="text-align: left; margin-top: 1rem;">
    {#if guild}
        <div class="card">
            <Card variant="filled">
                <div class="identity">
                    <div class="banner">
                        {#if inviteData?.guild?.banner}
                            <img
                                src={`https://cdn.discordapp.com/banners/${inviteData.guild.id}/${inviteData.guild.banner}?size=1024`}
                                alt="Guild Banner"
                                style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 16px;"
                            />
                        {/if}
                    </div>
                    <div class="row">
                        <img
                            src={inviteData?.guild?.icon
                                ? `https://cdn.discordapp.com/icons/${inviteData.guild.id}/${inviteData.guild.icon}.png?size=256`
                                : "https://cdn.discordapp.com/embed/avatars/0.png"}
                            alt="Guild Icon"
                            style="width: 100px; height: 100px; border-radius: 50%; margin-right: 16px;"
                        />
                        <div class="column">
                            <h2 style="margin-bottom: 0;">
                                {guild.name}
                            </h2>
                            <p class="small" style="margin-top: 0;">
                                ID: {guild.id}{#if inviteData}{" "}•
                                    {Intl.NumberFormat().format(
                                        inviteData.approximate_member_count ??
                                            0,
                                    )} members •
                                    {Intl.NumberFormat().format(
                                        inviteData.approximate_presence_count ??
                                            0,
                                    )} online{/if}
                            </p>
                        </div>
                    </div>
                </div>
                <h2>Invite Data</h2>
                {#if inviteData != null && inviteData.guild != null}
                    <div class="details" style="margin-top: 16px;">
                        <p>
                            <strong>Description</strong>: {inviteData.guild
                                .description ?? "No description available."}
                        </p>
                        <p>
                            <strong>Vanity URL Code</strong>: {inviteData.guild
                                .vanity_url_code ?? "N/A"}
                        </p>
                        <p>
                            <strong>Boosts</strong>: {Intl.NumberFormat().format(
                                inviteData.guild.premium_subscription_count ??
                                    0,
                            )}
                        </p>
                        <p>
                            <strong>Verification Level</strong>:
                            {["None", "Low", "Medium", "High", "Very High"][
                                inviteData.guild.verification_level
                            ]}
                        </p>
                        <p>
                            <strong
                                >Invite flags ({inviteData.flags ?? 0})</strong
                            >:
                            <!-- https://docs.discord.food/resources/invite#invite-flags -->
                            {#if (inviteData.flags ?? 0) & (1 << 0)}
                                <span class="chip">Voice Guest</span>
                            {/if}
                            {#if (inviteData.flags ?? 0) & (1 << 1)}
                                <span class="chip">Is Viewed</span>
                            {/if}
                            {#if (inviteData.flags ?? 0) & (1 << 2)}
                                <span class="chip">IS_ENHANCED</span>
                                <!-- No documentation on what this is -->
                            {/if}
                            {#if (inviteData.flags ?? 0) & (1 << 3)}
                                <span class="chip">Bypass Join Request</span>
                            {/if}
                        </p>
                        <p>
                            <strong>Features</strong>:
                            {#if inviteData.guild.features.length === 0}
                                <span class="chip">None</span>
                            {:else}
                                {#each inviteData.guild.features as feature}
                                    <span class="chip"
                                        >{formatName(feature)}</span
                                    >
                                {/each}
                            {/if}
                        </p>
                    </div>
                    <br />
                    <h3>Invite Background (Splash)</h3>
                    {#if inviteData.guild.splash}
                        <img
                            src={`https://cdn.discordapp.com/splashes/${inviteData.guild.id}/${inviteData.guild.splash}.png?size=1024`}
                            alt="Guild Splash"
                            style="width: 100%; border-radius: 8px;"
                        />
                    {:else}
                        <p>No splash available.</p>
                    {/if}
                    <br />
                    <h3>Channel</h3>
                    {#if inviteData.channel}
                        <p>
                            <strong>Name:</strong>
                            {inviteData.channel.name} <br />
                            <strong>ID:</strong>
                            {inviteData.channel.id} <br />
                            <strong>Type:</strong>
                            {ChannelType[inviteData.channel.type].replace(
                                "Guild",
                                "",
                            )}
                        </p>
                    {:else}
                        <p>No channel information available.</p>
                    {/if}
                    <h3>Inviter</h3>
                    {#if inviteData.inviter}
                        <UserCard
                            user={inviteData.inviter as User}
                            style="background-color: rgb(var(--m3-scheme-surface));"
                        />
                    {:else}
                        <p>No inviter information available.</p>
                    {/if}
                    <br />
                    <Button
                        variant="filled"
                        href={`https://discord.com/invite/${inviteData.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Join Guild
                    </Button>
                {:else}
                    <p>No invite data available. Information may be limited.</p>
                {/if}
            </Card>
        </div>
    {/if}
</center>

<style>
    .input {
        gap: 1rem;
        margin-top: 1rem;

        display: flex;
        flex-direction: row;
        align-items: center;

        width: fit-content;
    }

    .card {
        width: 100%;
        max-width: 50rem;
        margin: auto;
    }

    .small {
        font-size: 0.875rem;
        color: rgb(var(--m3-scheme-on-surface-variant));
    }

    .chip {
        display: inline-block;
        background-color: rgb(var(--m3-scheme-surface));
        color: rgb(var(--m3-scheme-on-surface));
        padding: 0.25rem 0.75rem;
        border-radius: 16px;
        font-size: 0.875rem;
        margin-right: 0.5rem;
    }

    .details {
        margin-top: .25rem;
    }

    .details :first-child {
        margin-top: 0;
    }

    h2, h3 {
        margin-bottom: 0.5rem;
    }
</style>
