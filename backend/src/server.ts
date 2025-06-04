import App from '@/app';
import { BusinessEngagementController } from '@controllers/business-engagement.controller';
import { FeedbackController } from '@controllers/feedback.controller';
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

validateEnv();

const app = new App([
  IndexController,
  BusinessEngagementController,
  RepresentingController,
  UserController,
  NotificationsController,
  FeedbackController,
  InvoicesController,
  HealthController,
  ContactSettingsController,
  AgreementController,
  MeasurementDataController,
]);

app.listen();
