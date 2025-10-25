<script lang="ts">
    import { page } from "$app/state";
    import { Button, Card, Icon, LoadingIndicator, TextField } from "m3-svelte";
    import iconSearch from "@ktibow/iconset-material-symbols/search";
    import { fetchWithCache } from "$lib";
    import {
        ChannelType,
        InviteType,
        type APIInvite,
    } from "discord-api-types/v10";
    import UserCard from "../user/UserCard.svelte";
    import type { User } from "../user/types";
    import { onMount } from "svelte";

    let inviteCode = page.url.searchParams.get("code") || "";
    let fetching = false;
    let fetchFailed = false;
    let fetchError = "";
    let inviteData: APIInvite | null = null;

    function standardizeInvite(code: string): string {
        // Remove any URL parts if a full URL is provided
        const urlPattern =
            /^(https?:\/\/)?(www\.)?discord(app)?\.com\/invite\/([a-zA-Z0-9-]+)$/;
        const match = code.match(urlPattern);
        if (match) {
            return match[4]; // Return just the invite code part
        }
        return code; // Assume it's already a code
    }

    async function fetchInvite(code: string) {
        fetching = true;
        const standardizedCode = standardizeInvite(code);
        // Implement the fetch logic here using the standardizedCode
        console.log("Fetching invite for code:", standardizedCode);

        const response = await fetchWithCache(
            `https://discord.com/api/v10/invites/${standardizedCode}?with_counts=true`,
        );

        if (!response.ok) {
            console.error("Failed to fetch invite:", response.statusText);
            fetchFailed = true;
            fetchError = response.statusText;
            inviteData = null;
            fetching = false;
            return;
        }

        inviteData = await response.json();
        fetching = false;
    }

    function formatName(perm: string): string {
        return perm
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    onMount(() => {
        if (inviteCode) {
            fetchInvite(inviteCode);
        }
    });
</script>

<svelte:head>
    <title>Invite Resolver • Discorver</title>
</svelte:head>

<h1>Invite Resolver</h1>
<center style="text-align: left;">
    <div class="input">
        <TextField label="Discord Invite Code or URL" bind:value={inviteCode} />
        <Button
            variant="filled"
            onclick={() => {
                console.log("Submitted invite:", inviteCode);
                fetchInvite(inviteCode);
            }}
        >
            <Icon icon={iconSearch} />
        </Button>
    </div>
    <br /><br />
    {#if fetching}
        <center><LoadingIndicator /></center>
    {:else if fetchFailed}
        <p style="color: red;">
            Failed to fetch invite. Please check the code and try again.<br
            />Details: {fetchError}
        </p>
    {:else if inviteData}
        {#if inviteData.type == InviteType.Friend}
            <UserCard user={inviteData.inviter as User} />
        {:else if inviteData.type == InviteType.Guild && inviteData.guild}
            <div class="card">
                <Card variant="filled">
                    <div class="identity">
                        <div class="banner">
                            {#if inviteData.guild.banner}
                                <img
                                    src={`https://cdn.discordapp.com/banners/${inviteData.guild.id}/${inviteData.guild.banner}?size=1024`}
                                    alt="Guild Banner"
                                    style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 16px;"
                                />
                            {/if}
                        </div>
                        <div class="row">
                            <img
                                src={inviteData.guild.icon
                                    ? `https://cdn.discordapp.com/icons/${inviteData.guild.id}/${inviteData.guild.icon}.png?size=256`
                                    : "https://cdn.discordapp.com/embed/avatars/0.png"}
                                alt="Guild Icon"
                                style="width: 100px; height: 100px; border-radius: 50%; margin-right: 16px;"
                            />
                            <div class="column">
                                <h2 style="margin-bottom: 0;">
                                    {inviteData.guild.name}
                                </h2>
                                <p class="small" style="margin-top: 0;">
                                    ID: {inviteData.guild.id} •
                                    {Intl.NumberFormat().format(
                                        inviteData.approximate_member_count ??
                                            0,
                                    )} members •
                                    {Intl.NumberFormat().format(
                                        inviteData.approximate_presence_count ??
                                            0,
                                    )} online
                                </p>
                            </div>
                        </div>
                    </div>
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
                </Card>
            </div>
        {:else if inviteData.type == InviteType.GroupDM && inviteData.channel}
            <div class="card">
                <Card variant="filled">
                    <div class="row">
                        <img
                            src={inviteData.channel.icon
                                ? `https://cdn.discordapp.com/channel-icons/${inviteData.channel.id}/${inviteData.channel.icon}.png?size=256`
                                : "https://cdn.discordapp.com/embed/avatars/0.png"}
                            alt="Group DM Icon"
                            style="width: 100px; height: 100px; border-radius: 50%; margin-right: 16px;"
                        />
                        <div class="column">
                            <h2 style="margin-bottom: 0;">
                                {inviteData.channel.name ||
                                    "Unnamed Group DM"}
                            </h2>
                            <p class="small" style="margin-top: 0;">
                                ID: {inviteData.channel.id} •
                                {inviteData.approximate_member_count ?? 'Unknown'} members
                            </p>
                        </div>
                    </div><br/>
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
                        Join Group DM
                    </Button>
                </Card>
            </div>
        {:else}
            <p>Unknown invite type.</p>
        {/if}
    {/if}
</center>

<style>
    .input {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        justify-content: center;
        margin-top: 1rem;
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

    h3 {
        margin-bottom: 0.5rem;
    }
</style>
