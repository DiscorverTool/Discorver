<script>
    import { onMount } from "svelte";

    onMount(async () => {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = params.get("access_token") ?? "";
        const tokenType = params.get("token_type") ?? "";
        const expiresIn = params.get("expires_in") ?? "0";

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

        window.location.href = "/";
    });
</script>

<h1>Authorizing...</h1>