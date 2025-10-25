<script lang="ts">
    import { Button, Card, Dialog, Icon } from "m3-svelte";
    import iconTick from "@ktibow/iconset-material-symbols/check-circle-outline";
    import iconCross from "@ktibow/iconset-material-symbols/cancel-outline";
    import iconHelp from "@ktibow/iconset-material-symbols/help-outline";
    import { getUserFlags, type User } from "./types";
    import { browser } from "$app/environment";
    import { convertSnowflakeToDate } from "$lib";

    export let user: User | null;

    let bannerType = 'gif';
    let platform = 'desktop';
    let showUserFlagsHelp = false;
    
    if (browser) {
        if (window.innerWidth <= 768) {
            platform = 'mobile';
        } else {
            platform = 'desktop';
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                platform = 'mobile';
            } else {
                platform = 'desktop';
            }
        });
    }
</script>

{#if showUserFlagsHelp}
    <Dialog
        headline="User Flags Information"
        open={true}
    >
    User flags are special attributes assigned to Discord users that indicate certain achievements, roles, or statuses within the Discord community. These flags can represent various things such as being a Discord employee, a Nitro subscriber, a bug hunter, or other special recognitions.
    <br/><br/>
    Each flag has a specific meaning and may come with its own perks or recognitions. Some flags are public and visible to other users, while others are private and only visible to the user themselves.
    <br/><br/>
    For more info the current users flags are {user ? user?.flags || 'unknown' : 'nothing as you have no user selected'}, you can find the full list of flags and their meanings on the <a href="https://discord.com/developers/docs/resources/user#user-object-user-flags" target="_blank" rel="noopener noreferrer">Discord Developer Documentation</a> or <a href="https://flags.lewisakura.moe/" target="_blank" rel="noopener noreferrer">This community resource</a>.
    {#snippet buttons()}
        <Button onclick={() => showUserFlagsHelp = false}>
            Close
        </Button>
    {/snippet}
    </Dialog>
{/if}

<div class="user-card">
    <Card variant="filled">
        {#if user}
            <div class="basic-info">
                {#if user.banner}
                    <img src={`https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${bannerType}?size=512`} alt="User Banner" style="width: 50rem; height: auto; border-radius: 8px; margin-bottom: 16px; max-width: 100%;" on:error={() => {
                        if (bannerType === 'gif') bannerType = 'webp'; // WebP is cooler than PNG
                        else if (bannerType === 'webp') bannerType = 'png';
                    }} />
                {/if}
                <div class="row">
                <div class="avatar">
                    <div class="avatar-container"></div>
                        <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`} alt="User Avatar" />
                        {#if user.avatar_decoration_data}
                            <img src={`https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png`} alt="User Avatar Decoration" class="avatar-decoration" />
                        {/if}
                    </div>
                    <div class="identity">
                        <!-- TODO: Add badges & Clan tags here -->
                        <pre><h2>{user.global_name || user.username}{#if platform == 'desktop'}{#if user.global_name} ({user.username}){/if}{#if user.bot} ({user.username}#{user.discriminator}){/if}{/if}</h2></pre>
                        <p class="small">{#if platform == 'mobile'}{#if user.global_name}({user.username}){/if}{#if user.bot} ({user.username}#{user.discriminator}){/if} •{' '}{/if}{user.id}</p>
                    </div>
                </div>
            </div>
            <div class="details">
                <p><strong>Discriminator:</strong> {user.discriminator === '0' ? 'N/A' : user.discriminator}</p>
                <div class="user-flags">
                    <p><strong>User Flags: <Icon icon={iconHelp} onclick={() => showUserFlagsHelp = true} style="cursor: pointer;" /></strong></p>
                    {#if getUserFlags(user.flags).length > 0}
                        <ul>
                            {#each getUserFlags(user.flags) as flag}
                                <li>
                                    <strong>{flag.name}:</strong> {flag.description}
                                    {#if !flag.isPublic}
                                        <span class="private-flag">(Private)</span>
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                    {:else}
                        <p class="no-flags">No flags set</p>
                    {/if}
                </div>
                <div class="align-vertical" style="gap: .5rem;">
                    Bot: {#if user.bot}
                        <Icon icon={iconTick} style="color: green;" />
                    {:else}
                        <Icon icon={iconCross} style="color: red;" />
                    {/if}
                </div>
                <div class="align-vertical" style="gap: .5rem;">
                    Spammer: {#if (user.flags & (1 << 20)) == (1 << 20)}
                        <Icon icon={iconTick} style="color: green;" />
                    {:else}
                        <Icon icon={iconCross} style="color: red;" />
                    {/if}
                </div><br/>
                <p>Created At: {convertSnowflakeToDate(user.id).toLocaleString()}</p>
                <p>Banner Colour: <input type="color" value={user.banner_color ? user.banner_color : '#000000'} on:click={(event) => event?.preventDefault()}/> {user.banner_color ? user.banner_color : 'N/A'}</p>
                <p>Accent Colour: <input type="color" value={user.accent_color ? user.accent_color : '#000000'} on:click={(event) => event?.preventDefault()}/> {user.accent_color ? user.accent_color : 'N/A'}</p>
                <div class="right-align">
                    <Button href={`https://discord.com/users/${user.id}`} target="_blank" rel="noopener noreferrer">
                        Open User Profile
                    </Button>
                </div>
            </div>
        {:else}
            <slot name="empty" />
        {/if}
    </Card>
</div>

<style>
    .user-card {
        width: 100%;
        max-width: 50rem;
        margin: auto;
    }

    .basic-info {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .row {
        display: flex;
        flex-direction: row;
        gap: 16px;
        align-items: center;
    }

    .avatar img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
    }

    .identity {
        display: flex;
        flex-direction: column;
    }

    .identity pre {
        margin: 0;
        padding: 0;
        font-family: Roboto, sans-serif;
        font-size: 1.5rem;
        font-weight: 500;
    }

    .identity h2 {
        margin: 0;
        padding-bottom: 4px;

        font-family: Roboto, sans-serif;
        font-size: 1.5rem;
        font-weight: 500;
    }

    .avatar {
        position: relative;
        display: inline-block;
    }

    .avatar-decoration {
        /* FIXME: This is being clipped incorrectly */
        position: absolute;
        top: 0;
        left: 0;
        width: 80px;
        height: 80px;
        transform: scale(1.2);
        pointer-events: none;
    }

    .small {
        font-size: 0.875rem;
        color: var(--m3-scheme-on-surface-variant);
        font-family: Roboto, sans-serif;
    }

    .user-flags ul {
        margin: 8px 0;
        padding-left: 20px;
    }

    .user-flags li {
        margin: 4px 0;
        font-size: 0.875rem;
    }

    .private-flag {
        color: var(--m3-scheme-on-surface-variant);
        font-size: 0.75rem;
        font-style: italic;
    }

    .no-flags {
        font-style: italic;
        color: var(--m3-scheme-on-surface-variant);
        margin: 8px 0;
    }

    .align-vertical {
        display: flex;
        align-items: center;
        margin-top: 16px;
    }

    .right-align {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
    }
</style>