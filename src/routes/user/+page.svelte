<script lang="ts">
    import { Button, Icon, LoadingIndicator, TextField } from "m3-svelte";
    import iconSearch from "@ktibow/iconset-material-symbols/search";
    import { type User } from "./types";
    import UserCard from "./UserCard.svelte";

    let userId = '';
    let fetching = false;
    let fetchFailed = false;
    let user: User | null = null;

    function fetchUser(id: string) {
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
                user = null;
            })
            .finally(() => {
                fetching = false;
            });
    }
</script>

<svelte:head>
    <title>{user ? `${user.global_name} • User Lookup • Discorver` : 'User Lookup • Discorver'}</title>
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
                <p style="color: red;">Failed to fetch user. Please check the User ID and try again.</p>
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