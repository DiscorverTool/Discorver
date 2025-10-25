![Discorver Logo](/src/lib/assets/wordmark.svg)
Discorver is a self-hosted utility for discovering information on certain users or guilds on Discord. It provides a simple interface to search through Discord's public API and retrieve relevant data.

## Features
- User Lookup: Just provide a discord user ID to retrieve public information about that user.
- Invite Resolver: Input a Discord invite link to get detailed information about the associated guild, user, or group.
- Stats: View interesting statistics about your own Discord account.

## License
This project is licensed under the Opinionated Queer License v1.2. See the [LICENSE](./LICENSE.md) file for details.

## Setup & Self-Hosting
### Vercel Deployment
The easiest way to deploy Discorver is through Vercel. Simply click the button below to get started:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDiscorverTool%2FDiscorver&env=DISCORD_TOKEN,PUBLIC_OAUTH_URL,PUBLIC_ENABLE_COMMUNITY_ANALYTICS,PUBLIC_UMAMI_WEBSITE_ID,PUBLIC_GITHUB_URL&envDescription=Discord%20bot%20token,%20OAuth%20URL,%20and%20analytics%20configuration&envLink=https%3A%2F%2Fdiscord.com%2Fdevelopers%2Fdocs%2Fquick-start%2Fgetting-started&project-name=discorver&repository-name=discorver)

### Other Hosting Platforms
For other hosting platforms, just use this repository as the source and make sure to fill in the required environment variables, particularly `DISCORD_TOKEN`.

### Manual Deployment
1. Clone the repository
2. Install dependencies using `npm install`
3. Set up environment variables as per the `.env.example` file
4. Start the application using `npm run dev` for development or `npm run build` for production.

## Configuration
Configuration is done through environment variables. A sample `.env.example` file is provided in the repository to guide you on what variables need to be set.

### Credentials & OAuth
The following are *required* environment variables:
- `DISCORD_TOKEN`: A Discord bot token with the necessary permissions to access the Discord API.
- `PUBLIC_OAUTH_URL`: The OAuth2 URL for your Discord application, used for user authentication. While the app may function with this set to the default value, certain features may be limited.

### Analytics (Optional)
Discorver uses Umami for analytics. We have made it optional to respect user privacy. If you wish to disable analytics, you can set the following environment variables:
- `PUBLIC_ENABLE_COMMUNITY_ANALYTICS`: Set to `false` to disable community analytics.
- `PUBLIC_UMAMI_WEBSITE_ID`: Your Umami website ID if you want to use your own analytics.

### Protection
Discorver does not implement any protection against abuse or rate limiting. It is recommended to deploy it behind a reverse proxy like cloudflare to determine who can access what parts of the application.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your changes. While there is no style guide, please try to keep your code clean (You can just do this by hitting Ctrl+Shift+I in VSCode) and somewhat consistent with the existing codebase.

## We are not discord
Discorver is not affiliated with, endorsed, sponsored, or specifically approved by Discord Inc.