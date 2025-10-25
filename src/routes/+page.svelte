<script>
    import { Card } from "m3-svelte";
    import Wordmark from '$lib/assets/wordmark.svg';
</script>

<svelte:head>
    <title>
        Discorver
    </title>
</svelte:head>

<center>
    <div class="wordmark">
        <img src={Wordmark} alt="Discorver Wordmark" />
    </div>
    <h1>Welcome to Discorver</h1>
    <p>
        Discorver is a simple tool that helps find information from the Discord API quickly and cleanly. Just select the tool, input the required information, and let us sift through the data for you!
    </p>

    {#snippet tool(/** @type {string} */ name, /** @type {string} */ description, /** @type {string} */ link)}
        <Card
            variant="filled"
            onclick={() => {
                window.location.href = link;
            }}
        >
        {#snippet children()}
            <h3>{name}</h3>
            <p>{description}</p>
        {/snippet}
        </Card>
    {/snippet}

    <h2>Tools</h2>
    <div class="tools-list">
        {@render tool(
            "User Lookup",
            "Find information about a Discord user by their ID.",
            "/user"
        )}
    </div>
</center>

<style>
    .tools-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 600px;
        margin-top: 1rem;
    }

    h1 {
        margin-top: 1rem;
        font-size: 2.5rem;
    }
    h2 {
        margin-top: 2rem;
        font-size: 2rem;
    }
    h3 {
        margin: 0;
        font-size: 1.5rem;
    }

    p {
        font-size: 1.125rem;
        line-height: 1.5;
        max-width: 750px;
    }

    .wordmark img {
        width: 50rem;
        max-width: 90vw;
    }
</style>