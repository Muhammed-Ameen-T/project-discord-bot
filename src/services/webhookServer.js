import express from 'express';
import crypto from 'crypto';
import { EmbedBuilder } from 'discord.js';
import { GitHubEvent } from '../models/GitHubEvent.js';
import { botConfig } from '../config/bot.js';
import { logger } from '../utils/logger.js';

const app = express();

// Middleware to verify GitHub webhook signature
function verifySignature(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    logger.warn('Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }

  next();
}

app.use(express.json());

export function startWebhookServer(client) {
  app.post('/webhook/github', verifySignature, async (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    try {
      await handleGitHubEvent(client, event, payload);
      res.status(200).send('OK');
    } catch (error) {
      logger.error('Error handling GitHub event:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  const port = process.env.WEBHOOK_PORT || 3001;
  app.listen(port, () => {
    logger.info(`Webhook server running on port ${port}`);
  });
}

async function handleGitHubEvent(client, event, payload) {
  const channel = client.channels.cache.get(botConfig.channels.github);
  if (!channel) return;

  let embed;
  
  switch (event) {
    case 'issues':
      embed = await handleIssueEvent(payload);
      break;
    case 'pull_request':
      embed = await handlePullRequestEvent(payload);
      break;
    case 'push':
      embed = await handlePushEvent(payload);
      break;
    case 'star':
      embed = await handleStarEvent(payload);
      break;
    case 'fork':
      embed = await handleForkEvent(payload);
      break;
    case 'release':
      embed = await handleReleaseEvent(payload);
      break;
    default:
      logger.info(`Unhandled GitHub event: ${event}`);
      return;
  }

  if (embed) {
    const message = await channel.send({ embeds: [embed] });
    
    // Save event to database
    const githubEvent = new GitHubEvent({
      eventType: event,
      eventData: payload,
      channelId: channel.id,
      messageId: message.id,
    });
    await githubEvent.save();
  }
}

async function handleIssueEvent(payload) {
  const action = payload.action;
  const issue = payload.issue;
  const user = payload.sender;

  let color = botConfig.embedColor;
  let title = '';
  let description = '';

  switch (action) {
    case 'opened':
      color = botConfig.warningColor;
      title = `🐛 New Issue Opened: #${issue.number}`;
      description = issue.title;
      break;
    case 'closed':
      color = botConfig.embedColor;
      title = `✅ Issue Closed: #${issue.number}`;
      description = issue.title;
      break;
    case 'reopened':
      color = botConfig.warningColor;
      title = `🔄 Issue Reopened: #${issue.number}`;
      description = issue.title;
      break;
    default:
      return null;
  }

  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setURL(issue.html_url)
    .setAuthor({ name: user.login, iconURL: user.avatar_url, url: user.html_url })
    .addFields(
      { name: 'Repository', value: payload.repository.full_name, inline: true },
      { name: 'Labels', value: issue.labels.map(label => label.name).join(', ') || 'None', inline: true }
    )
    .setTimestamp();
}

async function handlePullRequestEvent(payload) {
  const action = payload.action;
  const pr = payload.pull_request;
  const user = payload.sender;

  let color = botConfig.embedColor;
  let title = '';
  let description = '';

  switch (action) {
    case 'opened':
      color = botConfig.embedColor;
      title = `🔀 New Pull Request: #${pr.number}`;
      description = pr.title;
      break;
    case 'closed':
      if (pr.merged) {
        color = botConfig.embedColor;
        title = `✅ Pull Request Merged: #${pr.number}`;
      } else {
        color = botConfig.errorColor;
        title = `❌ Pull Request Closed: #${pr.number}`;
      }
      description = pr.title;
      break;
    case 'reopened':
      color = botConfig.embedColor;
      title = `🔄 Pull Request Reopened: #${pr.number}`;
      description = pr.title;
      break;
    default:
      return null;
  }

  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setURL(pr.html_url)
    .setAuthor({ name: user.login, iconURL: user.avatar_url, url: user.html_url })
    .addFields(
      { name: 'Repository', value: payload.repository.full_name, inline: true },
      { name: 'Branch', value: `${pr.head.ref} → ${pr.base.ref}`, inline: true },
      { name: 'Changes', value: `+${pr.additions} -${pr.deletions}`, inline: true }
    )
    .setTimestamp();
}

async function handlePushEvent(payload) {
  const commits = payload.commits;
  const pusher = payload.pusher;
  const ref = payload.ref;

  if (commits.length === 0) return null;

  const branch = ref.replace('refs/heads/', '');
  const commitCount = commits.length;
  const commitText = commitCount === 1 ? 'commit' : 'commits';

  return new EmbedBuilder()
    .setTitle(`📝 ${commitCount} new ${commitText} to ${branch}`)
    .setColor(botConfig.embedColor)
    .setURL(payload.compare)
    .setAuthor({ name: pusher.name, url: `https://github.com/${pusher.name}` })
    .addFields(
      { name: 'Repository', value: payload.repository.full_name, inline: true },
      { name: 'Branch', value: branch, inline: true },
      { name: 'Commits', value: commits.map(commit => `\`${commit.id.substring(0, 7)}\` ${commit.message.split('\n')[0]}`).join('\n').substring(0, 1000) }
    )
    .setTimestamp();
}

async function handleStarEvent(payload) {
  const action = payload.action;
  const user = payload.sender;
  const repo = payload.repository;

  if (action !== 'created') return null;

  return new EmbedBuilder()
    .setTitle('⭐ New Star!')
    .setDescription(`${user.login} starred the repository`)
    .setColor(botConfig.embedColor)
    .setURL(repo.html_url)
    .setAuthor({ name: user.login, iconURL: user.avatar_url, url: user.html_url })
    .addFields(
      { name: 'Repository', value: repo.full_name, inline: true },
      { name: 'Total Stars', value: repo.stargazers_count.toString(), inline: true }
    )
    .setTimestamp();
}

async function handleForkEvent(payload) {
  const user = payload.sender;
  const repo = payload.repository;

  return new EmbedBuilder()
    .setTitle('🍴 New Fork!')
    .setDescription(`${user.login} forked the repository`)
    .setColor(botConfig.embedColor)
    .setURL(repo.html_url)
    .setAuthor({ name: user.login, iconURL: user.avatar_url, url: user.html_url })
    .addFields(
      { name: 'Repository', value: repo.full_name, inline: true },
      { name: 'Total Forks', value: repo.forks_count.toString(), inline: true }
    )
    .setTimestamp();
}

async function handleReleaseEvent(payload) {
  const action = payload.action;
  const release = payload.release;
  const user = payload.sender;

  if (action !== 'published') return null;

  return new EmbedBuilder()
    .setTitle(`🚀 New Release: ${release.tag_name}`)
    .setDescription(release.name || release.tag_name)
    .setColor(botConfig.embedColor)
    .setURL(release.html_url)
    .setAuthor({ name: user.login, iconURL: user.avatar_url, url: user.html_url })
    .addFields(
      { name: 'Repository', value: payload.repository.full_name, inline: true },
      { name: 'Pre-release', value: release.prerelease ? 'Yes' : 'No', inline: true }
    )
    .setTimestamp();
}