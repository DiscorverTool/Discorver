<script lang="ts">
    import UserCard from "../user/UserCard.svelte";
    import { onMount } from "svelte";
    import { fetchWithCache, getAccessToken } from '$lib/index';
    import type { User } from "../user/types";
    import { Card, LoadingIndicator } from "m3-svelte";

    let user: User | null = null;

    onMount(async () => {
        const token = getAccessToken();
        const res = await fetchWithCache('https://discord.com/api/v10/users/@me', {
            headers: {
                'Authorization': `${token.token_type} ${token.token}`
            }
        });
        user = await res.json();
    });
</script>

<svelte:head>
    <title>
        You • Discorver
    </title>
</svelte:head>

<center>
    <h2>Your Information</h2>
</center>
{#if user}
    <UserCard {user} />
{:else}
    <center><LoadingIndicator /></center>
{/if}
<br/>
<center>
    <Card variant="filled" style="width: 100%; max-width: 50rem;" onclick={() => {
        window.location.href = '/self/guilds';
    }}>
        <h3>Guilds</h3>
        <p>
            Get a complete list of your guilds with their respective details including features, and your permissions within them.
        </p>
    </Card>
</center>