<script>
    import { onMount } from "svelte";

    onMount(async () => {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = params.get("access_token") ?? "";
        const tokenType = params.get("token_type") ?? "";
        const expiresIn = params.get("expires_in") ?? "0";
        const state = JSON.parse(atob(params.get("state") || btoa(JSON.stringify({referrer: '/'}))));
        const referrer = new URL(state.referrer);

        if (!accessToken || !tokenType || !expiresIn) {
            alert(
                "Got invalid OAuth2 response from Discord. Please try again.",
            );
        } else {
            localStorage.setItem(
                "accessToken",
                JSON.stringify({
                    token: accessToken,
                    token_type: tokenType,
                    expires_at: Date.now() + parseInt(expiresIn) * 1000,
                }),
            );
        }

        referrer.searchParams.set('result', 'authorized');
        window.location.href = referrer.toString();
    });
</script>
<svelte:head>
    <title>Authorizing... • Discorver</title>
</svelte:head>
<h1>Authorizing...</h1>