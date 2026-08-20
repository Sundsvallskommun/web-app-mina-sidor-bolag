import { cleanEnv, port, str, url, makeValidator } from 'envalid';

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/; // same as used in envalid

const emails = makeValidator(emailString => {
  const mailAdresses = emailString.split(',');
  mailAdresses.forEach(email => {
    if (!emailRegex.test(email))
      throw new Error('Emails not formatted correctly. Should be "a@example.com" or "a@example.com,b@example.com"');
  });
  return emailString;
});

// NOTE: Make sure we got these in ENV
const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    SECRET_KEY: str(),
    API_BASE_URL: str(),
    CLIENT_KEY: str(),
    CLIENT_SECRET: str(),
    PORT: port(),
    BASE_URL_PREFIX: str(),
    SAML_CALLBACK_URL: url(),
    SAML_FAILURE_REDIRECT: url(),
    SAML_ENTRY_SSO: url(),
    SAML_ISSUER: str(),
    SAML_IDP_PUBLIC_CERT: str(),
    SAML_PRIVATE_KEY: str(),
    SAML_PUBLIC_KEY: str(),
    SAML_LOGOUT_URL: str(),
    SAML_LOGOUT_CALLBACK_URL: str(),
    SAML_LOGOUT_REDIRECT: str(),
    SAML_SUCCESS_REDIRECT: str(),
    SAML_ADMIN_CALLBACK_URL: url(),
    SAML_ADMIN_FAILURE_REDIRECT: url(),
    SAML_ADMIN_ENTRY_SSO: url(),
    SAML_ADMIN_ISSUER: str(),
    SAML_ADMIN_IDP_PUBLIC_CERT: str(),
    SAML_ADMIN_PRIVATE_KEY: str(),
    SAML_ADMIN_PUBLIC_KEY: str(),
    SAML_ADMIN_LOGOUT_URL: str(),
    SAML_ADMIN_LOGOUT_CALLBACK_URL: str(),
    SAML_ADMIN_LOGOUT_REDIRECT: str(),
    SAML_ADMIN_SUCCESS_REDIRECT: str(),
    ENEO_API_KEY: str(),
    FEEDBACK_EMAIL: emails(),
    ADMIN_GROUP: str(),
    NAMESPACE: str(),
    WHITELISTED_ORGS: str(),
    OPENE_URL: str(),
    ELOMRADEN_API_USER: str(),
    ELOMRADEN_API_KEY: str(),
  });
};

export default validateEnv;
