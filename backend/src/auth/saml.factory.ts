import { BASE_URL_PREFIX } from '@config';
import { Strategy, VerifiedCallback } from '@node-saml/passport-saml';
import { logger } from '@utils/logger';
import bodyParser from 'body-parser';
import express from 'express';
import passport from 'passport';
import { RequestWithUser } from '../interfaces/auth.interface';
import { Profile } from '../interfaces/profile.interface';
import { User } from '../interfaces/users.interface';
import { isValidOrigin } from '../utils/isValidOrigin';
import { isValidUrl } from '../utils/util';

/** Per-IdP configuration — the bits that differ between login flows. */
export interface SamlIdpConfig {
  callbackUrl: string;
  entryPoint: string;
  privateKey: string;
  idpCert: string;
  issuer: string;
  logoutUrl: string;
  logoutCallbackUrl: string;
  /** Public cert used for SP metadata generation. */
  publicKey: string;
  failureRedirect: string;
  successRedirect: string;
  logoutRedirect: string;
}

/** Runs inside `req.logIn` after a successful login. */
export type PostLoginHook = (
  req: RequestWithUser,
  user: User,
  relay: Record<string, any> | null,
) => Promise<void>;

export interface SamlFlowOptions {
  /** Passport strategy name, e.g. 'saml' or 'saml-admin'. */
  strategyName: string;
  /** Route sub-prefix appended to BASE_URL_PREFIX, e.g. '/saml' or '/saml/admin'. */
  routePrefix: string;
  config: SamlIdpConfig;
  verify: (profile: Profile, done: VerifiedCallback) => void | Promise<void>;
  logoutVerify: (profile: Profile, done: VerifiedCallback) => void | Promise<void>;
  /** Optional post-login side effects (session caching etc.). */
  onLoginSuccess?: PostLoginHook;
  /** Optional pre-logout side effects (e.g. clearing an AI session). */
  onLogout?: (req: RequestWithUser) => Promise<unknown>;
  rateLimiter: express.RequestHandler;
}

/**
 * Builds a passport-saml Strategy for a single IdP, registers it under a unique
 * passport name, and mounts the five SAML routes under the given sub-prefix.
 * Used once per IdP so multiple login flows can coexist.
 */
export function registerSamlFlow(app: express.Application, opts: SamlFlowOptions): void {
  const { strategyName, routePrefix, config, onLoginSuccess, onLogout, rateLimiter } = opts;

  const strategy = new Strategy(
    {
      disableRequestedAuthnContext: true,
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      callbackUrl: config.callbackUrl,
      entryPoint: config.entryPoint,
      privateKey: config.privateKey,
      idpCert: config.idpCert,
      issuer: config.issuer,
      wantAssertionsSigned: false,
      wantAuthnResponseSigned: false,
      audience: false,
      logoutUrl: config.logoutUrl,
      logoutCallbackUrl: config.logoutCallbackUrl,
      acceptedClockSkewMs: -1,
    },
    opts.verify,
    opts.logoutVerify,
  );

  passport.use(strategyName, strategy);

  const base = `${BASE_URL_PREFIX}${routePrefix}`;

  app.get(`${base}/login`, rateLimiter, (req, res, next) => {
    logger.info(`SAML login request received with query: ${JSON.stringify(req.query)}`);
    const relay: Record<string, any> = {};

    if (req.session.returnTo) {
      relay.returnTo = req.session.returnTo;
    } else if (req.query.successRedirect) {
      relay.returnTo = req.query.successRedirect;
    }

    if (req.query.representingMode != null) {
      relay.representingMode = req.query.representingMode;
    }

    req.url = `${req.path}?RelayState=${JSON.stringify(relay)}`;

    passport.authenticate(strategyName, {
      failureRedirect: config.failureRedirect,
    })(req, res, next);
  });

  app.get(`${base}/metadata`, (req, res) => {
    res.type('application/xml');
    const metadata = strategy.generateServiceProviderMetadata(config.publicKey, config.publicKey);
    res.status(200).send(metadata);
  });

  app.get(`${base}/logout`, async (req, res) => {
    if (req.session?.returnTo) {
      req.query.RelayState = req.session.returnTo;
    } else if (req.query.successRedirect) {
      req.query.RelayState = req.query.successRedirect;
    }

    if (!req.user || !req.user.nameID || !req.user.nameIDFormat) {
      logger.warn('User missing required SAML fields for logout', { user: req.user });
      res.redirect(config.logoutCallbackUrl);
      return;
    }

    await onLogout?.(req as RequestWithUser);

    strategy.logout(req as any, (err, url) => {
      if (err || !url) {
        logger.error('Failed to generate SAML logout URL', { err, user: req.user });
        res.redirect(config.logoutCallbackUrl);
        return;
      }

      try {
        logger.info(`Parsing url: ${url}`);
        const parsed = new URL(url);
        parsed.searchParams.set('RelayState', config.logoutCallbackUrl);

        const redirectUrl = parsed.toString();
        logger.info(`User ${req.user ? (req.user as User).partyId : 'unknown'} logged out`);
        logger.info(`Using logout url: ${redirectUrl}`);

        res.redirect(redirectUrl);
      } catch (parseErr) {
        logger.error('Error parsing SAML logout URL', { parseErr, url });
        res.status(500).send('Invalid logout URL');
      }
    });
  });

  app.get(`${base}/logout/callback`, rateLimiter, bodyParser.urlencoded({ extended: false }), (req, res) => {
    logger.info('SAML logout callback received', { query: req.query, body: req.body, user: req.user });
    req.logout(err => {
      if (err) return res.status(500).send(err);
      let successRedirect: URL = new URL(config.logoutRedirect);
      let failureRedirect: URL;
      const urls = req?.body?.RelayState?.split(',') ?? [];

      if (urls.length !== 0) {
        if (isValidUrl(urls[0])) {
          successRedirect = new URL(urls[0]);
        }
        if (isValidUrl(urls[1])) {
          failureRedirect = new URL(urls[1]);
        } else {
          failureRedirect = successRedirect;
        }
      }

      const queries = new URLSearchParams(failureRedirect?.searchParams);

      if (queries) {
        if (req.session.messages?.length > 0) {
          queries.append('failMessage', req.session.messages[0]);
        } else {
          queries.append('failMessage', 'SAML_UNKNOWN_ERROR');
        }
      }

      if (failureRedirect) {
        res.redirect(failureRedirect.toString());
      } else {
        res.redirect(successRedirect.toString());
      }
    });
  });

  app.post(`${base}/login/callback`, rateLimiter, bodyParser.urlencoded({ extended: false }), (req, res, next) => {
    const relay = typeof req?.body?.RelayState === 'string' ? JSON.parse(req.body.RelayState) : null;

    let successRedirect;
    if (typeof relay === 'object' && relay?.returnTo && isValidUrl(relay?.returnTo) && isValidOrigin(relay?.returnTo)) {
      successRedirect = relay.returnTo;
    } else if (isValidUrl(req.body.RelayState) && isValidOrigin(req.body.RelayState)) {
      successRedirect = req.body.RelayState;
    } else {
      successRedirect = config.successRedirect;
    }

    let failureRedirect;
    if (req.session.messages?.length > 0) {
      failureRedirect = successRedirect + `?failMessage=${req.session.messages[0]}`;
    } else {
      failureRedirect = successRedirect + `?failMessage=SAML_UNKNOWN_ERROR`;
    }

    // Authenticate before saving state to session, since otherwise state may be overwritten
    passport.authenticate(
      strategyName,
      {
        failureRedirect,
        failureMessage: true,
      },
      (err, user) => {
        if (err) return next(err);
        if (!user) return res.redirect(failureRedirect);

        req.logIn(user, async err => {
          if (err) return next(err);
          await onLoginSuccess?.(req as RequestWithUser, user, relay);
          req.session.save(saveErr => {
            if (saveErr) return next(saveErr);
            res.redirect(successRedirect);
          });
        });
      },
    )(req, res, next);
  });
}
