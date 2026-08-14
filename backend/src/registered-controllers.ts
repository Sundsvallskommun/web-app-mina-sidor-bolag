import { AgreementController } from '@controllers/agreement.controller';
import { BFUSController } from '@controllers/bfus.controller';
import { CitizenController } from '@controllers/citizen.controller';
import { ContactSettingsController } from '@controllers/contact-settings.controller';
import { DelegateController } from '@controllers/delegate.controller';
import { DisturbancesController } from '@controllers/disturbances.controller';
import EventLogController from '@controllers/event-log.controller';
import { FacilityDelegationController } from '@controllers/facility-delegation.controller';
import { HealthController } from '@controllers/health.controller';
import { ImpersonationController } from '@controllers/impersonation.controller';
import { IndexController } from '@controllers/index.controller';
import { InvoicesController } from '@controllers/invoices.controller';
import { LegalEntityController } from '@controllers/legal-entity.controller';
import { MandateController } from '@controllers/mandate.controller';
import { MeasurementDataController } from '@controllers/measurement-data.controller';
import { NetOwnerController } from '@controllers/netowner.controller';
import { NotificationsController } from '@controllers/notifications.controller';
import { RepresentingController } from '@controllers/representing.controller';
import { SelfServiceAiController } from '@controllers/self-service-ai.controller';
import { SignController } from '@controllers/sign.controller';
import { UserController } from '@controllers/user.controller';

export const registeredControllers = [
  IndexController,
  LegalEntityController,
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
  ImpersonationController,
  DisturbancesController,
];
