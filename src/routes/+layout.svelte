<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import iconHome from "@ktibow/iconset-material-symbols/home-outline";
	import iconHomeS from "@ktibow/iconset-material-symbols/home";
	import iconPerson from "@ktibow/iconset-material-symbols/person-outline";
	import iconPersonS from "@ktibow/iconset-material-symbols/person";
	import iconPersonSearch from "@ktibow/iconset-material-symbols/person-search-outline";
	import iconPersonSearchS from "@ktibow/iconset-material-symbols/person-search";
	import iconCode from "@ktibow/iconset-material-symbols/code";
	import '$lib/assets/m3.css';
	import {page} from '$app/state';
    import { Button, Card, Icon, NavCMLX, NavCMLXItem } from 'm3-svelte';

	let { children } = $props();

	const pages = [
		{ href: '/', text: 'Home', icon: iconHome, iconSelected: iconHomeS },
		{ href: '/user', text: 'User', icon: iconPersonSearch, iconSelected: iconPersonSearchS },
		{ href: '/self', text: 'You', icon: iconPerson, iconSelected: iconPersonS },
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#snippet nav()}
	{#each pages as p (p.href)}
		<NavCMLXItem 
			variant="auto"
			href={p.href}
			selected={p.href == '/' ? page.url.pathname === p.href : page.url.pathname.startsWith(p.href)}
			icon={(p.href == '/' ? page.url.pathname === p.href : page.url.pathname.startsWith(p.href)) ? p.iconSelected : p.icon}
			text={p.text}
		/>
	{/each}
{/snippet}

<div class="navigation">
	<NavCMLX variant="medium" children={nav}></NavCMLX>
</div>
<main>
	{@render children?.()}
</main>
<footer>
	<Card variant="filled" style="width: 100%; text-align: center; padding: 8px 0;">
		<p class="small">
			Not affiliated with, endorsed, sponsored, or specifically approved by Discord Inc. All Discord logos and trademarks are property of Discord Inc.
		</p>
		<div class="centered-row">
			<Button href="https://github.com/NotPiny/Discorver" variant="tonal">
				<Icon icon={iconCode} />
			</Button>
		</div>
	</Card>
</footer>

<style>
	.navigation {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
		background-color: rgb(var(--m3-scheme));
	}

	main {
		margin-top: 4rem;
		padding: 16px;
		background-color: rgb(var(--m3-scheme-surface-variant));

		/* height: calc(100vh - 48px); */
		overflow-y: auto;

		font-family: Roboto, sans-serif;
	}

	footer {
		position: relative;
		bottom: .5rem;
		width: 100%;
		margin-top: 16px;
	}

	main :global(h1) {
		font-size: 2rem;
		font-weight: 500;
		margin-bottom: 16px;

		text-align: center;
	}

	.centered-row {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 8px;
	}

	:global(.row) {
		display: flex;
		flex-direction: row;
		gap: 16px;
	}

	:global(.column) {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	:global(.small) {
		font-size: 0.875rem;
		color: var(--m3-scheme-on-surface-variant);
		font-family: Roboto, sans-serif;
	}
</style>