export interface User {
  id: string
  username: string
  avatar: string | null
  discriminator: string
  public_flags: number
  flags: number
  banner: string | null
  accent_color: number | null
  global_name: string | null
  avatar_decoration_data: AvatarDecorationData | null
  collectibles: any
  display_name_styles: any | null
  banner_color: string | null
  clan: Clan | null
  primary_guild: PrimaryGuild | null
  bot: boolean;
}

export interface Clan {
  identity_guild_id: string
  identity_enabled: boolean
  tag: string
  badge: string
}

export interface PrimaryGuild {
  identity_guild_id: string
  identity_enabled: boolean
  tag: string
  badge: string
}

export interface AvatarDecorationData {
  asset: string
  sku_id: string
  expires_at: number | null
}

export interface UserFlag {
  name: string
  description: string
  isPublic: boolean
}

export const USER_FLAGS: Record<number, UserFlag> = {
  [1 << 0]: { name: 'STAFF', description: 'Discord Staff', isPublic: true },
  [1 << 1]: { name: 'PARTNER', description: 'Partnered Server Owner', isPublic: true },
  [1 << 2]: { name: 'HYPESQUAD', description: 'HypeSquad Events', isPublic: true },
  [1 << 3]: { name: 'BUG_HUNTER_LEVEL_1', description: 'Level 1 Discord Bug Hunter', isPublic: true },
  [1 << 4]: { name: 'MFA_SMS', description: 'SMS enabled as a multi-factor authentication backup', isPublic: false },
  [1 << 5]: { name: 'PREMIUM_PROMO_DISMISSED', description: 'User has dismissed the current premium (Nitro) promotion', isPublic: false },
  [1 << 6]: { name: 'HYPESQUAD_ONLINE_HOUSE_1', description: 'HypeSquad Bravery', isPublic: true },
  [1 << 7]: { name: 'HYPESQUAD_ONLINE_HOUSE_2', description: 'HypeSquad Brilliance', isPublic: true },
  [1 << 8]: { name: 'HYPESQUAD_ONLINE_HOUSE_3', description: 'HypeSquad Balance', isPublic: true },
  [1 << 9]: { name: 'PREMIUM_EARLY_SUPPORTER', description: 'Early Premium (Nitro) Supporter', isPublic: true },
  [1 << 10]: { name: 'TEAM_PSEUDO_USER', description: 'User is a Team', isPublic: true },
  [1 << 11]: { name: 'IS_HUBSPOT_CONTACT', description: 'User is registered on Discord\'s HubSpot customer platform, used for official Discord programs (e.g. partner)', isPublic: false },
  [1 << 12]: { name: 'SYSTEM', description: 'User is a system user (i.e. official Discord account)', isPublic: true },
  [1 << 13]: { name: 'HAS_UNREAD_URGENT_MESSAGES', description: 'User has unread urgent system messages; an urgent message is one sent from Trust and Safety', isPublic: false },
  [1 << 14]: { name: 'BUG_HUNTER_LEVEL_2', description: 'Level 2 Discord Bug Hunter', isPublic: true },
  [1 << 15]: { name: 'UNDERAGE_DELETED', description: 'User is scheduled for deletion for being under the minimum required age', isPublic: false },
  [1 << 16]: { name: 'VERIFIED_BOT', description: 'Verified Bot', isPublic: true },
  [1 << 17]: { name: 'VERIFIED_DEVELOPER', description: 'Early Verified Bot Developer', isPublic: true },
  [1 << 18]: { name: 'CERTIFIED_MODERATOR', description: 'Moderator Programs Alumni', isPublic: true },
  [1 << 19]: { name: 'BOT_HTTP_INTERACTIONS', description: 'Bot uses only HTTP interactions and is shown in the online member list', isPublic: true },
  [1 << 20]: { name: 'SPAMMER', description: 'User is marked as a spammer and has their messages collapsed in the UI', isPublic: true },
  [1 << 21]: { name: 'DISABLE_PREMIUM', description: 'User has manually disabled premium (Nitro) features', isPublic: false },
  [1 << 22]: { name: 'ACTIVE_DEVELOPER', description: 'Active Developer', isPublic: true },
  [1 << 23]: { name: 'PROVISIONAL_ACCOUNT', description: 'User is a provisional account used with the social layer integration', isPublic: true },
  [1 << 33]: { name: 'HIGH_GLOBAL_RATE_LIMIT', description: 'User has their global ratelimit raised to 1,200 requests per second', isPublic: false },
  [1 << 34]: { name: 'DELETED', description: 'User\'s account is deleted', isPublic: false },
  [1 << 35]: { name: 'DISABLED_SUSPICIOUS_ACTIVITY', description: 'User\'s account is disabled for suspicious activity and must reset their password to regain access', isPublic: false },
  [1 << 36]: { name: 'SELF_DELETED', description: 'User deleted their own account', isPublic: false },
  [1 << 37]: { name: 'PREMIUM_DISCRIMINATOR', description: 'User has a premium (Nitro) custom discriminator', isPublic: false },
  [1 << 38]: { name: 'USED_DESKTOP_CLIENT', description: 'User has used the desktop client', isPublic: false },
  [1 << 39]: { name: 'USED_WEB_CLIENT', description: 'User has used the web client', isPublic: false },
  [1 << 40]: { name: 'USED_MOBILE_CLIENT', description: 'User has used the mobile client', isPublic: false },
  [1 << 41]: { name: 'DISABLED', description: 'User\'s account is disabled', isPublic: false },
  [1 << 43]: { name: 'HAS_SESSION_STARTED', description: 'User has started at least one Gateway session and is now eligible to send messages', isPublic: false },
  [1 << 44]: { name: 'QUARANTINED', description: 'User is quarantined and cannot create DMs or accept invites', isPublic: false },
  [1 << 47]: { name: 'PREMIUM_ELIGIBLE_FOR_UNIQUE_USERNAME', description: 'User is eligible for early access to unique usernames', isPublic: false },
  [1 << 50]: { name: 'COLLABORATOR', description: 'User is a collaborator and is considered staff', isPublic: false },
  [1 << 51]: { name: 'RESTRICTED_COLLABORATOR', description: 'User is a restricted collaborator and is considered staff', isPublic: false },
};

export function getUserFlags(flags: number): UserFlag[] {
  const userFlags: UserFlag[] = [];
  
  for (const [flagValue, flagInfo] of Object.entries(USER_FLAGS)) {
    const flagBit = parseInt(flagValue);
    if (flags & flagBit) {
      userFlags.push(flagInfo);
    }
  }
  
  return userFlags;
}