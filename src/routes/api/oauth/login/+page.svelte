<script>
    import { page } from "$app/state";
    import { PUBLIC_OAUTH_URL } from "$env/static/public";
    import { Button, Dialog } from "m3-svelte";
    import { onMount } from "svelte";

    let envErrorDialogOpen = false;
    const referrer = new URL(new URL(page.url).searchParams.get("ref") ?? '/');
    referrer.searchParams.set('bounce', 'login'); // If we need to refer to the referrer within this file, it's probably to bounce back after a failed login

    onMount(() => {
        if (
            PUBLIC_OAUTH_URL == "" ||
            PUBLIC_OAUTH_URL == "YOUR_DISCORD_OAUTH_URL_HERE"
        )
            envErrorDialogOpen = true;
        else {
            const oauthURL = new URL(PUBLIC_OAUTH_URL);

            // If otherwise specified, don't annoy people with login prompts
            if (!oauthURL.searchParams.has("prompt"))
                oauthURL.searchParams.set("prompt", "none");

            // We don't want to need a fancy server-side route for this
            oauthURL.searchParams.set("response_type", "token");

            oauthURL.searchParams.set('state', btoa(JSON.stringify({referrer: referrer.toString()})));

            window.location.href = oauthURL.toString();
        }
    });
</script>

<svelte:head>
    <title>Logging In • Discorver</title>
</svelte:head>

<Dialog open={envErrorDialogOpen} headline="Environment Error">
    <p>
        Something has gone wrong with the configuration of this instance
        (default or blank OAuth URL). We are unable to proceed with the login
        process. Please contact the host of this instance to inform them of
        this issue.
    </p>
    {#snippet buttons()}
        <Button href={`${referrer}`}>Go back</Button>
    {/snippet}
</Dialog>

<h1>Logging In...</h1>
<center><p>Please give us a moment while we log you in.</p></center>