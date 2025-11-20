![Discorver Logo](/src/lib/assets/wordmark.svg)<br/>
Discorver is a self-hosted utility for discovering information on certain users or guilds on Discord. It provides a simple interface to search through Discord's public API and retrieve relevant data.

## Features
- User Lookup: Just provide a discord user ID to retrieve public information about that user.
- Invite Resolver: Input a Discord invite link to get detailed information about the associated guild, user, or group.
- Stats: View interesting statistics about your own Discord account.

## License
This project is licensed under the Opinionated Queer License v1.2. See the [LICENSE](./LICENSE.md) file for details.

## Setup & Self-Hosting
### Vercel Deployment
1. Fork this respository
2. Go to [create a vercel project](https://vercel.com/new)
3. Under `Import Git Repository` go to the github account / organisation you made your fork under and select it
4. Now you probably want to change your vercel project name to ensure the accuracy of this so for example set it to `discorver-fork-[your name]`
5. Under `Environment Variables` paste the following into the first `key` field
```dotenv
# Discord api details
# Any bot token will work, it is recommended to create a separate bot for this purpose
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
# Just make the redirect uri [hostname]/api/oauth/authorized, and the scopes identity and guilds (we'll handle the rest)
PUBLIC_OAUTH_URL=YOUR_DISCORD_OAUTH_URL_HERE

# Umami analytics
# Send back anonymous usage data to the community analytics server (May include lookup info or hostname)
PUBLIC_ENABLE_COMMUNITY_ANALYTICS=true
# Specify this if you want to use your own analytics (https://umami.is/) on top of the community one
PUBLIC_UMAMI_WEBSITE_ID=

PUBLIC_GITHUB_URL=https://github.com/DiscorverTool/Discorver
```
5. Now we need to fill those in:
DISCORD_TOKEN: For this you need to make a discord application and copy the bot token (as shown in [this guide](https://discordjs.guide/legacy/preparations/app-setup))
PUBLIC_OAUTH_URL: Assuming your project name is unique (why we renamed it in step 4) your hostname will be `[project name].vercel.app`. Now on your discord application page go to the OAuth2 tab and add a Redirect URI with the text `[your hostname here]/api/oauth/authorized` after which in the OAuth2 URL Generator section you want to select `identify` and `guilds` at which point you will select the redirect uri you just added and copy the link into this field.
PUBLIC_ENABLE_COMMUNITY_ANALYTICS: This a simple `true` or `false` on whether or not you want to send back analytics from your users to the community umami site.
PUBLIC_UMAMI_WEBSITE_ID: If you have your umami website id you can specify it here to also send analytics there
PUBLIC_GITHUB_URL: The link to the source code of your instance, can be left as default or modified to point to your own repo if you want
6. Hit deploy, everything may take a minute to build but shortly after you will end up with a functional discorver update

### Other Hosting Platforms
For other hosting platforms, just use this repository as the source and make sure to fill in the required environment variables, particularly `DISCORD_TOKEN`.

### Manual Deployment
1. Clone the repository
2. Install dependencies using `npm install`
3. Set up environment variables as per the `.env.example` file
4. Start the application using `npm run dev` for development or `npm run build` for production.

### Updating
Vercel (potentially other hosting platforms): Simply just hit Sync Fork at the top of the repo page and the rest will happen automatically, you should get a email and a visual indicator if anything fails during the process.
Manual: Simply pull down the new repo data (`git pull`) and restart your instance (make sure to rebuild if running in prod)

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
