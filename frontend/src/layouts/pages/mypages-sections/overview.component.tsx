'use client';

import { Todos } from './overview/todo/todos.component';
import { Consumption } from '@layouts/pages/mypages-sections/overview/consumption/consumption.component';
import { Announcements } from '@layouts/pages/mypages-sections/overview/announcements/announcements.component';
import { ContactSettingsConfirmation } from '@components/contact-settings-confirmation/contact-settings-confirmation.component';
import { OngoingDisturbances } from '@layouts/pages/mypages-sections/overview/ongoing-disturbances/ongoing-disturbances.component';

export default function Overview() {
  return (
    <div>
      <Consumption />
      <Todos />
      {process.env.NEXT_PUBLIC_FEATURE_DISTURBANCES === 'true' ? <OngoingDisturbances /> : null}
      <Announcements />
      <ContactSettingsConfirmation />
    </div>
  );
}
