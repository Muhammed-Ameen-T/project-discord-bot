const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function formatLog(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const coloredLevel = colors[level === 'error' ? 'red' : level === 'warn' ? 'yellow' : level === 'info' ? 'green' : 'blue'];
  console.log(`${coloredLevel}[${timestamp}] ${level.toUpperCase()}:${colors.reset}`, message, ...args);
}

export const logger = {
  info: (message, ...args) => formatLog('info', message, ...args),
  warn: (message, ...args) => formatLog('warn', message, ...args),
  error: (message, ...args) => formatLog('error', message, ...args),
  debug: (message, ...args) => formatLog('debug', message, ...args),
};