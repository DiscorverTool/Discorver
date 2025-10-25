import { browser } from '$app/environment'
import { PUBLIC_OAUTH_URL } from '$env/static/public';

export function getAccessToken(): {token: string, token_type: string, expires_at: number} {
    if (browser) {
        if (localStorage.getItem('accessToken')) {
			return JSON.parse(localStorage.getItem('accessToken')!);
		} else {
			const oauthURL = new URL(PUBLIC_OAUTH_URL);
			
			// If otherwise specified, don't annoy people with login prompts
			if (!oauthURL.searchParams.has('prompt'))
				oauthURL.searchParams.set('prompt', 'none');

			// We don't want to need a fancy server-side route for this
			oauthURL.searchParams.set('response_type', 'token');

			window.location.href = oauthURL.toString();
		}
    }

	// Default return value for SSR or no token found
	return {
		token: 'NONE',
		token_type: 'NONE',
		expires_at: 0
	}
}

export async function fetchWithCache(url: string, options: RequestInit = {}, cacheDuration: number = 300_000): Promise<Response> {
	const cacheKey = `fetchCache_${btoa(url + JSON.stringify(options))}`;
	const cached = sessionStorage.getItem(cacheKey);
	if (cached) {
		const { timestamp, data } = JSON.parse(cached);
		if (Date.now() - timestamp < cacheDuration) {
			return Promise.resolve(new Response(new Blob([data])));
		} else {
			sessionStorage.removeItem(cacheKey);
		}
	}

	return fetch(url, options).then(response => {
		response.clone().text().then(data => {
			sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
		});
		return response;
	});
}

/**
 * TAKEN FROM: https://github.com/vegeta897/snow-stamp/blob/main/src/convert.js
 */
export const DISCORD_EPOCH = 1420070400000

// Converts a snowflake ID string into a JS Date object using the provided epoch (in ms), or Discord's epoch if not provided
export function convertSnowflakeToDate(snowflake: string, epoch = DISCORD_EPOCH) {
	// Convert snowflake to BigInt to extract timestamp bits
	// https://discord.com/developers/docs/reference#snowflakes
	const milliseconds = BigInt(snowflake) >> 22n
	return new Date(Number(milliseconds) + epoch)
}

// Validates a snowflake ID string and returns a JS Date object if valid
export function validateSnowflake(snowflake: string, epoch = DISCORD_EPOCH) {
	if (!Number.isInteger(+snowflake)) {
		throw new Error(
			"That doesn't look like a snowflake. Snowflakes contain only numbers."
		)
	}

	if (+snowflake < 4194304) {
		throw new Error(
			"That doesn't look like a snowflake. Snowflakes are much larger numbers."
		)
	}

	const timestamp = convertSnowflakeToDate(snowflake, epoch)

	if (Number.isNaN(timestamp.getTime())) {
		throw new Error(
			"That doesn't look like a snowflake. Snowflakes have fewer digits."
		)
	}

	return timestamp
}