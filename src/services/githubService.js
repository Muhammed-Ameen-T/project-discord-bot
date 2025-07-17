import axios from 'axios';
import { botConfig } from '../config/bot.js';

const github = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Authorization': `token ${botConfig.github.token}`,
    'Accept': 'application/vnd.github.v3+json',
  },
});

export async function getLatestCommits(count = 5) {
  try {
    const response = await github.get(`/repos/${botConfig.github.owner}/${botConfig.github.repo}/commits`, {
      params: { per_page: count },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching commits:', error);
    throw error;
  }
}

export async function getOpenIssues(count = 5) {
  try {
    const response = await github.get(`/repos/${botConfig.github.owner}/${botConfig.github.repo}/issues`, {
      params: { state: 'open', per_page: count },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw error;
  }
}

export async function getOpenPullRequests(count = 5) {
  try {
    const response = await github.get(`/repos/${botConfig.github.owner}/${botConfig.github.repo}/pulls`, {
      params: { state: 'open', per_page: count },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    throw error;
  }
}

export async function getContributors(count = 10) {
  try {
    const response = await github.get(`/repos/${botConfig.github.owner}/${botConfig.github.repo}/contributors`, {
      params: { per_page: count },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contributors:', error);
    throw error;
  }
}

export async function getRepositoryInfo() {
  try {
    const response = await github.get(`/repos/${botConfig.github.owner}/${botConfig.github.repo}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching repository info:', error);
    throw error;
  }
}