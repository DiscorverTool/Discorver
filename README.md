![Discorver Logo](/src/lib/assets/wordmark.svg)
Discorver is a self-hosted utility for discovering information on certain users or guilds on Discord. It provides a simple interface to search through Discord's public API and retrieve relevant data.

## Features
- User Lookup: Just provide a discord user ID to retrieve public information about that user.

## License
This project is licensed under the Opinionated Queer License v1.2. See the [LICENSE](./LICENSE.md) file for details.

## Setup & Self-Hosting
### Vercel Deployment
The easiest way to deploy Discorver is through Vercel. Simply click the button below to get started:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNotPiny%2FDiscorver&env=DISCORD_TOKEN&envDescription=Discord%20bot%20token%20for%20authentication&envLink=https%3A%2F%2Fdiscord.com%2Fdevelopers%2Fdocs%2Fquick-start%2Fgetting-started&project-name=discorver&repository-name=discorver)

### Other Hosting Platforms
For other hosting platforms, just use this repository as the source and make sure to fill in the required environment variables, particularly `DISCORD_TOKEN`.

### Manual Deployment
1. Clone the repository
2. Install dependencies using `npm install`
3. Set up environment variables as per the `.env.example` file
4. Start the application using `npm run dev` for development or `npm run build` for production.
