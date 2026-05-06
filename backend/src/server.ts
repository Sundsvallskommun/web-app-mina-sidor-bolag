import App from '@/app';
import { BusinessEngagementController } from '@controllers/business-engagement.controller';
import { IndexController } from '@controllers/index.controller';
import { NotificationsController } from '@controllers/notifications.controller';
import { RepresentingController } from '@controllers/representing.controller';
import { UserController } from '@controllers/user.controller';
import validateEnv from '@utils/validateEnv';
import { ContactSettingsController } from './controllers/contact-settings.controller';
import { HealthController } from './controllers/health.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { AgreementController } from '@controllers/agreement.controller';
import { MeasurementDataController } from '@controllers/measurement-data.controller';
import { DelegateController } from './controllers/delegate.controller';
import { NetOwnerController } from './controllers/netowner.controller';
import { FacilityDelegationController } from '@controllers/facility-delegation.controller';
import { SignController } from './controllers/sign.controller';
import { MandateController } from './controllers/mandate.controller';
import { CitizenController } from './controllers/citizen.controller';
import EventLogController from '@controllers/event-log.controller';
import { BFUSController } from './controllers/bfus.controller';
import { SelfServiceAiController } from '@controllers/self-service-ai.controller';
import { DisturbancesController } from '@controllers/disturbances.controller';

validateEnv();

const app = new App([
  IndexController,
  BusinessEngagementController,
  RepresentingController,
  UserController,
  NotificationsController,
  InvoicesController,
  HealthController,
  ContactSettingsController,
  AgreementController,
  MeasurementDataController,
  DelegateController,
  NetOwnerController,
  FacilityDelegationController,
  SignController,
  MandateController,
  CitizenController,
  EventLogController,
  BFUSController,
  SelfServiceAiController,
  DisturbancesController,
]);

app.listen();
