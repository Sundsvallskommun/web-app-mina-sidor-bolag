import { config } from 'dotenv';

import { APIS } from './api-config';
export { APIS };

const env = process.env.NODE_ENV || 'development';

config({ path: `.env.${env}.local` });
// Fallback to a committed, non-secret env file. Only `.env.test` exists today: jest
// forces NODE_ENV=test, and without this there is no env at all, so anything that
// reads config throws at import and takes the whole suite with it.
config({ path: `.env.${env}` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
// Defaulted rather than destructured below: dotenv loads `.env.${NODE_ENV}.local`,
// so under jest (NODE_ENV=test) there is no env file and an undefined LOG_DIR made
// logger.ts throw at import, taking every suite that touched it down with it.
export const LOG_DIR = process.env.LOG_DIR ?? '../../data/logs';
export const SWAGGER_ENABLED = process.env.SWAGGER_ENABLED === 'true';
export const SESSION_MEMORY = process.env.SESSION_MEMORY === 'true';

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
} = process.env;
