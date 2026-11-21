import fileSettings from '../settings.json';

/**
 * Runtime configuration.
 * Non-secret defaults come from settings.json. Secrets and deployment-specific values
 * are read from environment variables, so they never need to live in the repository.
 * See .env.example for the full list.
 */
const env = process.env;

const config = {
  ...fileSettings,
  port: Number(env.PORT) || fileSettings.port,
  origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map(s => s.trim()) : fileSettings.origin,
  MONGODB_URL: env.MONGODB_URL || fileSettings.MONGODB_URL,
  SMTP_HOST: env.SMTP_HOST || fileSettings.SMTP_HOST,
  SMTP_PORT: env.SMTP_PORT || fileSettings.SMTP_PORT,
  SMTP_USER: env.SMTP_USER || '',
  SMTP_PASSWORD: env.SMTP_PASSWORD || '',
  EMAIL_NAME: env.EMAIL_NAME || fileSettings.EMAIL_NAME,
  EMAIL_FROM: env.EMAIL_FROM || fileSettings.EMAIL_FROM,
  secret: env.JWT_SECRET || '',
};

if (!config.secret) {
  throw new Error('JWT_SECRET environment variable is required (see .env.example)');
}

export default config;
