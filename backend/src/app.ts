import 'reflect-metadata';

import ApiService from '@/services/api.service';
import {
  BASE_URL_PREFIX,
  CREDENTIALS,
  LOG_FORMAT,
  NODE_ENV,
  ORIGIN,
  PORT,
  SAML_ADMIN_CALLBACK_URL,
  SAML_ADMIN_ENTRY_SSO,
  SAML_ADMIN_FAILURE_REDIRECT,
  SAML_ADMIN_IDP_PUBLIC_CERT,
  SAML_ADMIN_ISSUER,
  SAML_ADMIN_LOGOUT_CALLBACK_URL,
  SAML_ADMIN_LOGOUT_REDIRECT,
  SAML_ADMIN_LOGOUT_URL,
  SAML_ADMIN_PRIVATE_KEY,
  SAML_ADMIN_PUBLIC_KEY,
  SAML_ADMIN_SUCCESS_REDIRECT,
  SAML_CALLBACK_URL,
  SAML_ENTRY_SSO,
  SAML_FAILURE_REDIRECT,
  SAML_IDP_PUBLIC_CERT,
  SAML_ISSUER,
  SAML_LOGOUT_CALLBACK_URL,
  SAML_LOGOUT_REDIRECT,
  SAML_LOGOUT_URL,
  SAML_PRIVATE_KEY,
  SAML_PUBLIC_KEY,
  SAML_SUCCESS_REDIRECT,
  SECRET_KEY,
  SESSION_MEMORY,
  SWAGGER_ENABLED,
} from '@config';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import { existsSync, mkdirSync } from 'fs';
import helmet from 'helmet';
import hpp from 'hpp';
import createMemoryStore from 'memorystore';
import morgan from 'morgan';
import passport from 'passport';
import { join } from 'path';
import { getMetadataArgsStorage, useExpressServer } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import createFileStore from 'session-file-store';
import swaggerUi from 'swagger-ui-express';
import { registerSamlFlow, SamlIdpConfig } from './auth/saml.factory';
import { adminVerify } from './auth/verify.admin';
import { customerLoginSuccess, customerVerify, noopLogoutVerify } from './auth/verify.customer';
import { deleteAISession } from '@services/selfserviceai.service';
import { additionalConverters } from '@utils/custom-validation-classes';

const SessionStoreCreate = SESSION_MEMORY ? createMemoryStore(session) : createFileStore(session);
const sessionTTL = 4 * 24 * 60 * 60;
// NOTE: memory uses ms while file uses seconds
const sessionStore = new SessionStoreCreate(
  SESSION_MEMORY ? { checkPeriod: sessionTTL * 1000 } : { sessionTTL, path: './data/sessions' },
);
const apiService = new ApiService();

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

const customerSamlConfig: SamlIdpConfig = {
  callbackUrl: SAML_CALLBACK_URL,
  entryPoint: SAML_ENTRY_SSO,
  privateKey: SAML_PRIVATE_KEY,
  idpCert: SAML_IDP_PUBLIC_CERT,
  issuer: SAML_ISSUER,
  logoutUrl: SAML_LOGOUT_URL,
  logoutCallbackUrl: SAML_LOGOUT_CALLBACK_URL,
  publicKey: SAML_PUBLIC_KEY,
  failureRedirect: SAML_FAILURE_REDIRECT,
  successRedirect: SAML_SUCCESS_REDIRECT,
  logoutRedirect: SAML_LOGOUT_REDIRECT,
};

const adminSamlConfig: SamlIdpConfig = {
  callbackUrl: SAML_ADMIN_CALLBACK_URL,
  entryPoint: SAML_ADMIN_ENTRY_SSO,
  privateKey: SAML_ADMIN_PRIVATE_KEY,
  idpCert: SAML_ADMIN_IDP_PUBLIC_CERT,
  issuer: SAML_ADMIN_ISSUER,
  logoutUrl: SAML_ADMIN_LOGOUT_URL,
  logoutCallbackUrl: SAML_ADMIN_LOGOUT_CALLBACK_URL,
  publicKey: SAML_ADMIN_PUBLIC_KEY,
  failureRedirect: SAML_ADMIN_FAILURE_REDIRECT,
  successRedirect: SAML_ADMIN_SUCCESS_REDIRECT,
  logoutRedirect: SAML_ADMIN_LOGOUT_REDIRECT,
};

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public swaggerEnabled: boolean;

  constructor(Controllers) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.swaggerEnabled = SWAGGER_ENABLED || false;

    this.initializeDataFolders();

    this.initializeMiddlewares();
    this.initializeRoutes(Controllers);
    if (this.swaggerEnabled) {
      this.initializeSwagger(Controllers);
    }
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    const samlLimiter = rateLimit({
      windowMs: 60 * 1000,
      limit: 100,
    });
    this.app.set('trust proxy', 1);

    this.app.use(
      session({
        secret: SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
          sameSite: 'lax',
        },
      }),
    );

    this.app.use(passport.initialize());
    this.app.use(passport.session());

    // External customer login flow
    registerSamlFlow(this.app, {
      strategyName: 'saml',
      routePrefix: '/saml',
      config: customerSamlConfig,
      verify: customerVerify(apiService),
      logoutVerify: noopLogoutVerify,
      onLoginSuccess: customerLoginSuccess,
      onLogout: deleteAISession,
      rateLimiter: samlLimiter,
    });

    // Internal admin login flow
    registerSamlFlow(this.app, {
      strategyName: 'saml-admin',
      routePrefix: '/saml/admin',
      config: adminSamlConfig,
      verify: adminVerify,
      logoutVerify: noopLogoutVerify,
      rateLimiter: samlLimiter,
    });
  }

  private initializeRoutes(controllers) {
    useExpressServer(this.app, {
      routePrefix: BASE_URL_PREFIX,
      cors: {
        origin: ORIGIN,
        credentials: CREDENTIALS,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
      controllers: controllers,
      defaultErrorHandler: false,
    });
  }

  private initializeSwagger(controllers) {
    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: '#/components/schemas/',
      additionalConverters: additionalConverters,
    });

    const routingControllersOptions = {
      controllers: controllers,
    };

    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
      components: {
        schemas,
        securitySchemes: {
          basicAuth: {
            scheme: 'basic',
            type: 'http',
          },
        },
      },
      info: {
        description: 'Mina Sidor',
        title: 'API',
        version: '1.0.0',
      },
    });
    this.app.use(`${BASE_URL_PREFIX}/swagger.json`, (_req, res, next) => {
      res.json(spec);
      next();
    });
    this.app.use(`${BASE_URL_PREFIX}/api-docs`, swaggerUi.serve, swaggerUi.setup(spec));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeDataFolders() {
    const databaseDir: string = join(__dirname, '../data/database');
    if (!existsSync(databaseDir)) {
      mkdirSync(databaseDir, { recursive: true });
    }
    const logsDir: string = join(__dirname, '../data/logs');
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
    const sessionsDir: string = join(__dirname, '../data/sessions');
    if (!existsSync(sessionsDir)) {
      mkdirSync(sessionsDir, { recursive: true });
    }
  }
}

export default App;
