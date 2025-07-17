export const botConfig = {
  prefix: process.env.BOT_PREFIX || '!',
  activityCheckDays: parseInt(process.env.ACTIVITY_CHECK_DAYS) || 7,
  inactiveThresholdDays: parseInt(process.env.INACTIVE_THRESHOLD_DAYS) || 14,
  maxCooldownTime: 60000, // 1 minute
  embedColor: 0x00ff00,
  errorColor: 0xff0000,
  warningColor: 0xffff00,
  
  channels: {
    welcome: process.env.WELCOME_CHANNEL_ID,
    github: process.env.GITHUB_CHANNEL_ID,
    general: process.env.GENERAL_CHANNEL_ID,
  },
  
  github: {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    token: process.env.GITHUB_TOKEN,
  },
  
  roles: {
    contributor: 'Contributor',
    maintainer: 'Maintainer',
    active: 'Active Member',
  }
};