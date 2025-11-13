<script lang="ts">
    import { Button, Icon, LoadingIndicator, TextField } from "m3-svelte";
    import iconSearch from "@ktibow/iconset-material-symbols/search";
    import { type User } from "./types";
    import UserCard from "./UserCard.svelte";
    import { convertSnowflakeToDate, validateSnowflake } from "$lib";
    import { page } from "$app/state";
    import { onMount } from "svelte";

    // I love runes :) [Not really]
    let userId = $state(page.url.searchParams.get('id') ?? '');
    let fetching = $state(false);
    let fetchFailed = $state(false);
    let fetchError = $state('');
    let { data } = $props();
    let user = $state<User | null>(data.user || null);


    function fetchUser(id: string) {
        try {
            validateSnowflake(id);
        } catch (e) {
            fetchFailed = true;
            fetchError = (e as Error).message;
            user = null;
            return;
        }
        fetching = true;
        user = null;
        fetch(`/user/lookup?id=${id}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                user = data;
                fetchFailed = false;
            })
            .catch(err => {
                console.error('Error fetching user:', err);
                fetchFailed = true;
                fetchError = err.message;
                user = null;
            })
            .finally(() => {
                fetching = false;
            });
    }

    onMount(() => {
        if (userId) {
            fetchUser(userId);
        }
    });
</script>

<svelte:head>
    <title>{user ? `${user.global_name} • User Lookup • Discorver` : 'User Lookup • Discorver'}</title>
    {#if user}
        <!-- Preview embed data -->
        <meta property="og:title" content="{user.global_name} • User Lookup • Discorver" />
        <meta property="og:description" content="Find out more about Discord user @{user.username} using Discorver.\n\nID: {user.id}\nCreated: {convertSnowflakeToDate(user.id).toISOString()}\nBot: {user.bot ? 'Yes' : 'No'}\n\nBanner Colour: {user.banner_color ?? 'Unknown'}\nAccent Colour: #{user.accent_color ? user.accent_color.toString(16).padStart(6, '0') : 'Unknown'}" />
        {#if user.accent_color || user.banner_color}
            <meta name="theme-color" content="{user.accent_color ? `#${user.accent_color.toString(16).padStart(6, '0')}` : user.banner_color}" />
        {/if}
        {#if user.avatar}
            <meta property="og:image" content="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png" />
        {/if}
    {/if}
</svelte:head>

<h1>
    User Lookup
</h1>
<center>
    <div class="input">
        <TextField label="User ID" bind:value={userId} onsubmit={() => {
            console.log('Submitted user ID:', userId);
        }} />
        <Button onclick={() => {
            console.log('Button clicked with user ID:', userId);
            fetchUser(userId);
        }}>
            <Icon icon={iconSearch} />
        </Button>
    </div><br/><br/>
    <UserCard {user}>
        <svelte:fragment slot="empty">
            {#if fetching}
                <LoadingIndicator />
            {:else if fetchFailed}
                <p style="color: red;">Failed to fetch user. Please check the User ID and try again.<br/>Details: {fetchError}</p>
            {:else}
                <p>Enter a User ID and click the search button to look up a Discord user.</p>
            {/if}
        </svelte:fragment>
    </UserCard>
</center>

<style>
    .input {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: center;
    }

    center {
        /* I get why its the default but its also dumb */
        text-align: left;
    }
</style>