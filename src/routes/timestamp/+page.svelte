<script lang="ts">
    import { page } from "$app/state";

    let date: string = ``;
    let ts = 0;

    let dateTimeInput: HTMLInputElement | null = null;
    let snowflakeInput: HTMLInputElement | null = null;
    let timestampInput: HTMLInputElement | null = null;

    function updateTimestamp(source: "datetime" | "snowflake" | "timestamp", value?: string) {
        console.log(`Updating from ${source} with value ${value}`);
        if (source == "datetime") {
            date = value || ``;
            if (!date) {
                ts = 0;
                return;
            }

            const d = new Date(date);
            ts = Math.floor(d.getTime() / 1000);

            // Update snowflake input
            const unixMs = BigInt(d.getTime());
            const discordEpoch = 1420070400000n;
            const snowflake = ((unixMs - discordEpoch) << 22n).toString();
            if (snowflakeInput) {
                snowflakeInput.value = snowflake;
            }
        }

        if (source == "snowflake") {
            if (!value) {
                ts = 0;
                date = ``;
                return;
            }

            const snowflake = BigInt(value);
            const unixMs = Number((snowflake >> 22n) + 1420070400000n);
            const d = new Date(unixMs);
            ts = Math.floor(d.getTime() / 1000);
            date = d.toISOString().slice(0, 19);

            // Update datetime input
            if (dateTimeInput) {
                dateTimeInput.value = date;
            }
        }

        if (source == "timestamp") {
            if (!value) {
                ts = 0;
                date = ``;
                return;
            }

            ts = parseInt(value);
            const d = new Date(ts * 1000);
            date = d.toISOString().slice(0, 19);

            // Update inputs
            if (dateTimeInput) {
                dateTimeInput.value = date;
            }
            const unixMs = BigInt(d.getTime());
            const discordEpoch = 1420070400000n;
            const snowflake = ((unixMs - discordEpoch) << 22n).toString();
            if (snowflakeInput) {
                snowflakeInput.value = snowflake;
            }
        }
    }

    const letterNameMappings = {
        t: "Short Time",
        T: "Long Time",
        d: "Short Date",
        D: "Long Date",
        f: "Short Date/Time",
        F: "Long Date/Time",
        R: "Relative Time",
    }

    /**
     * Adapted from https://github.com/3ventic/discord-timestamps/blob/main/index.html
     */
    const typeFormats = {
        t: { timeStyle: "short" as const },
        T: { timeStyle: "medium" as const },
        d: { dateStyle: "short" as const },
        D: { dateStyle: "long" as const },
        f: { dateStyle: "long" as const, timeStyle: "short" as const },
        F: { dateStyle: "full" as const, timeStyle: "short" as const },
        R: { style: "long" as const, numeric: "auto" as const },
    };

    function relativeTime(date: Date) {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const absDiff = Math.abs(diff);
        const isFuture = diff < 0;

        const seconds = Math.floor(absDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        const prefix = isFuture ? "in " : "";
        const postfix = isFuture ? "" : " ago";

        if (years > 0)
            return `${prefix}${years == 1 ? "a" : years} year${years > 1 ? "s" : ""}${postfix}`;
        if (months > 0)
            return `${prefix}${months == 1 ? "a" : months} month${months > 1 ? "s" : ""}${postfix}`;
        if (weeks > 0)
            return `${prefix}${weeks == 1 ? "a" : weeks} week${weeks > 1 ? "s" : ""}${postfix}`;
        if (days > 0)
            return `${prefix}${days == 1 ? "a" : days} day${days > 1 ? "s" : ""}${postfix}`;
        if (hours > 0)
            return `${prefix}${hours == 1 ? "an" : hours} hour${hours > 1 ? "s" : ""}${postfix}`;
        if (minutes > 0)
            return `${prefix}${minutes == 1 ? "a" : minutes} minute${minutes > 1 ? "s" : ""}${postfix}`;
        return `${prefix}${seconds} seconds${postfix}`; // Discord uses "seconds" even for 1 second
    }

    /**
     * Parse time parameter - accepts unix timestamps (seconds or ms) or date strings
     */
    function parseTimeParam(timeParam: string): { date: Date; timestamp: number } | null {
        if (!timeParam) return null;

        // Try parsing as a number first (unix timestamp)
        const numericValue = Number(timeParam);
        if (!isNaN(numericValue)) {
            // If it's a reasonable unix timestamp in seconds (between 1970 and 2100)
            if (numericValue > 0 && numericValue < 4102444800) {
                const date = new Date(numericValue * 1000);
                return { date, timestamp: numericValue };
            }
            // If it's in milliseconds (13 digits)
            if (numericValue > 1000000000000) {
                const date = new Date(numericValue);
                return { date, timestamp: Math.floor(numericValue / 1000) };
            }
        }

        // Try parsing as a date string
        const date = new Date(timeParam);
        if (!isNaN(date.getTime())) {
            return { date, timestamp: Math.floor(date.getTime() / 1000) };
        }

        return null;
    }
</script>

<svelte:head>
    <title>Timestamps • Discorver</title>
    {#if page.url.searchParams.get('time')}
        {@const timeParam = page.url.searchParams.get('time')}
        {@const parsed = parseTimeParam(timeParam || '')}
        {#if parsed}
            {@const { date: timestampDate, timestamp } = parsed}
            {@const formattedTimestamps = Object.entries(typeFormats).map(([type, options]) => {
                return `${letterNameMappings[type as keyof typeof letterNameMappings]}: <t:${timestamp}:${type}>`;
            }).join('\n')}
            <meta property="og:title" content="Timestamps • Discorver" />
            <meta property="og:description" content="Formatted timestamps for input time:{'\n'}{formattedTimestamps}" />
        {/if}
    {/if}
</svelte:head>

<h1>Timestamps</h1>
<div class="touching-column">
    <input
        bind:this={dateTimeInput}
        id="datetime-input"
        type="datetime-local"
        step="1000"
        on:change={(e) =>
            updateTimestamp("datetime", (e.target as HTMLInputElement)?.value)}
    />
    <input
        bind:this={timestampInput}
        id="timestamp-input"
        type="number"
        placeholder="🕒 Unix Timestamp (seconds)"
        on:input={(e) => {
            updateTimestamp("timestamp", (e.target as HTMLInputElement)?.value);
        }}
    />
    <input
        bind:this={snowflakeInput}
        id="snowflake-input"
        type="text"
        placeholder="❄️ Discord Snowflake ID"
        on:input={(e) => {
            updateTimestamp("snowflake", (e.target as HTMLInputElement)?.value);
        }}
    />
</div>

<h2>Formatted Timestamps</h2>
<!-- <ul>
    {#each Object.entries(typeFormats) as [type, options]}
        <li>
            <strong>{type}</strong>:
            {#if type === "R"}
                <code>&lt;t:{ts}:{type}&gt;</code> → {relativeTime(
                    new Date(date),
                )}
            {:else}
                <code>&lt;t:{ts}:{type}&gt;</code> →
                {new Intl.DateTimeFormat(
                    "default",
                    // @ts-ignore
                    options,
                ).format(new Date(date))}
            {/if}
        </li>
    {/each}
</ul> -->
{#if date}
<table>
    <thead>
        <tr>
            <th>Type</th>
            <th>Formatted</th>
            <th>Raw</th>
        </tr>
    </thead>
    <tbody>
        {#each Object.entries(typeFormats) as [type, options]}
            <tr>
                <td>
                    {letterNameMappings[type as keyof typeof letterNameMappings]}
                </td>
                <td>
                    {#if type === "R"}
                        {relativeTime(new Date(date))}
                    {:else}
                        {new Intl.DateTimeFormat(
                            "default",
                            // @ts-ignore
                            options,
                        ).format(new Date(date))}
                    {/if}
                </td>
                <td><code>&lt;t:{ts}:{type}&gt;</code></td>
            </tr>
        {/each}
    </tbody>
</table>
{:else}
<p>Please enter a date, timestamp, or snowflake ID to see formatted timestamps.</p>
{/if}

<style>
    input {
        margin-top: 8px;
        margin-bottom: 16px;
        padding: 8px;
        font-size: 1rem;
        border: 1px solid rgb(var(--m3-scheme-on-surface-variant));
        border-radius: .5rem;
        background-color: rgb(var(--m3-scheme-surface-container-highest));
        color: rgb(var(--m3-scheme-on-surface));
        width: calc(100% - 16px);
        font-family: 'Roboto', sans-serif;
    }

    .touching-column {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .touching-column * {
        margin: 0;
    }

    .touching-column input:first-child {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    .touching-column input:not(:first-child):not(:last-child) {
        border-radius: 0;
        border-top: none;
    }
    
    .touching-column input:last-child {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        border-top: none;
    }

    table {
        width: calc(100% - 1px);
        border-collapse: collapse;
        margin-top: 16px;
        border: 1px solid rgb(var(--m3-scheme-on-surface-variant));
        border-radius: .5rem;
        background-color: rgb(var(--m3-scheme-surface-container-highest));
        color: rgb(var(--m3-scheme-on-surface));
    }

    th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid rgb(var(--m3-scheme-on-surface-variant));
    }
</style>
