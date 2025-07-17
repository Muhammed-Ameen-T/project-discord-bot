import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function generateReplySuggestion(messageContent, context = '') {
  if (!openai) {
    logger.warn('OpenAI API key not configured');
    return null;
  }

  try {
    const prompt = `You are a helpful community Discord bot. Based on the following message, suggest a helpful and engaging reply that would be appropriate for a software development community:

Message: "${messageContent}"
Context: ${context}

Provide a concise, helpful reply that encourages discussion and provides value to the community. Keep it under 200 characters.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim();
  } catch (error) {
    logger.error('Error generating AI reply:', error);
    return null;
  }
}

export async function generateProjectSummary(commits, issues, pullRequests) {
  if (!openai) {
    return null;
  }

  try {
    const prompt = `Generate a brief, engaging summary of recent project activity based on:

Recent commits: ${commits.length} commits
Open issues: ${issues.length} issues
Open pull requests: ${pullRequests.length} pull requests

Create a motivational summary that highlights progress and encourages community participation. Keep it under 300 characters.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content?.trim();
  } catch (error) {
    logger.error('Error generating project summary:', error);
    return null;
  }
}