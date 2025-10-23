<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import iconHome from "@ktibow/iconset-material-symbols/home-outline";
	import iconHomeS from "@ktibow/iconset-material-symbols/home";
	import iconSearch from "@ktibow/iconset-material-symbols/search";
	import iconSearchS from "@ktibow/iconset-material-symbols/search-sharp";
	import '$lib/assets/m3.css';
	import {page} from '$app/state';
    import { NavCMLX, NavCMLXItem } from 'm3-svelte';

	let { children } = $props();

	const pages = [
		{ href: '/', text: 'Home', icon: iconHome, iconSelected: iconHomeS },
		{ href: '/user', text: 'User', icon: iconSearch, iconSelected: iconSearchS },
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
			selected={page.url.pathname === p.href}
			icon={page.url.pathname === p.href ? p.iconSelected : p.icon}
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
<footer></footer>

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

	main :global(h1) {
		font-size: 2rem;
		font-weight: 500;
		margin-bottom: 16px;

		text-align: center;
	}
</style>