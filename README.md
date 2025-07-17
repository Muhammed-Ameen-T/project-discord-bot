# Community Discord Bot

A modern Discord bot built with Node.js and discord.js v14 for open-source community automation and GitHub integration.

## Features

### 🤖 Community Automation
- **Welcome System**: Automatically welcome new members with custom messages
- **Activity Tracking**: Monitor user activity and message counts
- **Engagement**: Appreciate helpful replies and engage inactive members
- **Scheduled Tasks**: Weekly project status summaries and daily fun facts

### 🔗 GitHub Integration
- **Real-time Notifications**: Issues, pull requests, commits, stars, and forks
- **Webhook Support**: Secure GitHub webhook handling with Express
- **Repository Queries**: Slash commands for commits, issues, PRs, and contributors
- **Project Statistics**: Automated weekly summaries with repository metrics

### 🛠️ Advanced Utilities
- **Slash Commands**: Modern Discord slash command system
- **User Profiles**: Track contributions and activity
- **Leaderboards**: Message and contribution leaderboards
- **Role Management**: Automatic role assignment based on activity
- **AI Integration**: Optional OpenAI integration for smart replies

## Installation

### Prerequisites
- Node.js 18+
- MongoDB
- Discord Bot Token
- GitHub Personal Access Token

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd community-discord-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env`

5. **Create Discord Bot**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application and bot
   - Copy the bot token to `DISCORD_TOKEN` in `.env`
   - Copy the client ID to `DISCORD_CLIENT_ID` in `.env`

6. **Set up GitHub Integration**
   - Create a GitHub Personal Access Token with repo permissions
   - Add it to `GITHUB_TOKEN` in `.env`
   - Configure repository details in `.env`

7. **Configure Discord Server**
   - Invite the bot to your server with required permissions
   - Create channels for different notifications
   - Update channel IDs in `.env`

8. **Set up GitHub Webhooks**
   - Go to your GitHub repository settings
   - Add a webhook pointing to `http://your-server:3001/webhook/github`
   - Set content type to `application/json`
   - Add your webhook secret to `GITHUB_WEBHOOK_SECRET` in `.env`

### Running the Bot

**Development Mode**
```bash
npm run dev
```

**Production Mode**
```bash
npm start
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Discord bot token | Yes |
| `DISCORD_CLIENT_ID` | Discord application client ID | Yes |
| `DISCORD_GUILD_ID` | Discord server ID | Yes |
| `GITHUB_TOKEN` | GitHub personal access token | Yes |
| `GITHUB_WEBHOOK_SECRET` | GitHub webhook secret | Yes |
| `GITHUB_OWNER` | GitHub username or organization | Yes |
| `GITHUB_REPO` | Repository name | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key (optional) | No |
| `WELCOME_CHANNEL_ID` | Channel ID for welcome messages | Yes |
| `GITHUB_CHANNEL_ID` | Channel ID for GitHub notifications | Yes |
| `GENERAL_CHANNEL_ID` | Channel ID for general announcements | Yes |

### Discord Permissions

The bot requires the following permissions:
- Read Messages
- Send Messages
- Embed Links
- Use Slash Commands
- Manage Roles (optional)
- Add Reactions
- Read Message History

## Commands

### GitHub Commands
- `/commits [count]` - View latest commits
- `/issues [count]` - View open issues
- `/pulls [count]` - View open pull requests
- `/contributors [count]` - View top contributors

### Community Commands
- `/profile [user]` - View user profile
- `/leaderboard [type]` - View community leaderboard

### Utility Commands
- `/help [command]` - Get help information
- `/ping` - Check bot latency

## Project Structure

```
src/
├── commands/           # Slash commands
│   ├── github/        # GitHub-related commands
│   ├── community/     # Community commands
│   └── utility/       # Utility commands
├── events/            # Discord event handlers
├── handlers/          # Command and event loaders
├── models/            # Database models
├── services/          # External service integrations
├── utils/             # Utility functions
└── config/            # Configuration files
```

## Webhook Events

The bot handles the following GitHub webhook events:
- `issues` - Issue opened/closed/reopened
- `pull_request` - PR opened/closed/merged
- `push` - New commits pushed
- `star` - Repository starred
- `fork` - Repository forked
- `release` - New release published

## Scheduled Tasks

- **Weekly Status**: Every Sunday at 9 AM
- **Inactive Member Check**: Daily at 8 AM
- **Daily Fun Fact**: Every day at 10 AM

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Join our Discord server
- Check the documentation

## Roadmap

- [ ] Advanced AI integration
- [ ] More GitHub webhook events
- [ ] Custom command creation
- [ ] Database migrations
- [ ] Docker support
- [ ] Advanced analytics dashboard

---

Built with ❤️ for the open-source community