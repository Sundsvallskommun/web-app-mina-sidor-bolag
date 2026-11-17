import { config } from 'dotenv';
import { existsSync } from 'fs';

import { APIS } from './api-config';
export { APIS };

const env = process.env.NODE_ENV || 'development';

config({ path: `.env.${env}.local` });

const fallbackEnvFile = `.env.${env}`;
if (existsSync(fallbackEnvFile)) {
  config({ path: fallbackEnvFile });
}

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const LOG_DIR = process.env.LOG_DIR ?? '../../data/logs';
export const SWAGGER_ENABLED = process.env.SWAGGER_ENABLED === 'true';
export const SESSION_MEMORY = process.env.SESSION_MEMORY === 'true';

// Namespaces every Redis key this application owns. Only needs overriding via
// REDIS_KEY_PREFIX when several applications share one Redis instance.
const DEFAULT_REDIS_KEY_PREFIX = 'web-app-mina-sidor-bolag';

type RedisConfig =
  { enabled: false } | { enabled: true; host: string; keyPrefix: string; port: number; password?: string };

function parseRedisPort(value: string): number {
  const parsedPort = Number(value);

  if (!/^\d+$/.test(value) || !Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65_535) {
    throw new Error('REDIS_PORT must be an integer between 1 and 65535');
  }

  return parsedPort;
}

/**
 * Redis is enabled by setting REDIS_HOST. Without it the app runs on a single instance with
 * local sessions (memory or file) and an in-memory API token.
 */
export function createRedisConfig(environment: NodeJS.ProcessEnv): RedisConfig {
  const redisHost = environment.REDIS_HOST?.trim() ?? '';
  const configuredKeyPrefix = environment.REDIS_KEY_PREFIX?.trim() ?? '';
  const redisKeyPrefix = configuredKeyPrefix === '' ? DEFAULT_REDIS_KEY_PREFIX : configuredKeyPrefix;
  const redisPort = environment.REDIS_PORT?.trim() ?? '';
  const redisPassword = environment.REDIS_PASSWORD ?? '';

  if (!redisHost) {
    if (redisPort || redisPassword) {
      throw new Error('REDIS_HOST is required when REDIS_PORT or REDIS_PASSWORD is configured');
    }

    return { enabled: false };
  }

  const connection = {
    host: redisHost,
    keyPrefix: redisKeyPrefix,
    port: parseRedisPort(redisPort || '6379'),
  };

  return redisPassword ? { enabled: true, ...connection, password: redisPassword } : { enabled: true, ...connection };
}

export const REDIS_CONFIG = createRedisConfig(process.env);

export const {
  NODE_ENV,
  PORT,
  API_BASE_URL,
  LOG_FORMAT,
  ORIGIN,
  SECRET_KEY,
  CLIENT_KEY,
  CLIENT_SECRET,
  BASE_URL_PREFIX,
  SAML_CALLBACK_URL,
  SAML_LOGOUT_URL,
  SAML_LOGOUT_CALLBACK_URL,
  SAML_LOGOUT_REDIRECT,
  SAML_FAILURE_REDIRECT,
  SAML_SUCCESS_REDIRECT,
  SAML_ENTRY_SSO,
  SAML_ISSUER,
  SAML_IDP_PUBLIC_CERT,
  SAML_PRIVATE_KEY,
  SAML_PUBLIC_KEY,
  SAML_ADMIN_CALLBACK_URL,
  SAML_ADMIN_LOGOUT_URL,
  SAML_ADMIN_LOGOUT_CALLBACK_URL,
  SAML_ADMIN_LOGOUT_REDIRECT,
  SAML_ADMIN_FAILURE_REDIRECT,
  SAML_ADMIN_SUCCESS_REDIRECT,
  SAML_ADMIN_ENTRY_SSO,
  SAML_ADMIN_ISSUER,
  SAML_ADMIN_IDP_PUBLIC_CERT,
  SAML_ADMIN_PRIVATE_KEY,
  SAML_ADMIN_PUBLIC_KEY,
  FEEDBACK_EMAIL,
  MUNICIPALITY_ID,
  MUNICIPALITY_ORG_NR,
  ENVIRONMENT,
  MOCK_ORGANIZATION_NAME,
  MOCK_ORGANIZATION_NUMBER,
  NAMESPACE,
  OPENE_URL,
  GRP_URL,
  GRP_SERVICE_ID,
  GRP_ACCESS_TOKEN,
  GRP_DISPLAY_NAME,
  GRP_DEV_PERSONNUMBER,
  BFUS_EXTERNAL_ID,
  BFUS_API_KEY,
  ENEO_API_KEY,
  ADMIN_GROUP,
  ELOMRADEN_API_USER,
  ELOMRADEN_API_KEY,
  RSS_FEED_URL,
  RSS_FEED_USERNAME,
  RSS_FEED_PASSWORD,
} = process.env;
