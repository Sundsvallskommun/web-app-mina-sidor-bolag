'use client';

import { Todos } from './overview/todo/todos.component';
import { Consumption } from '@layouts/pages/mypages-sections/overview/consumption/consumption.component';
import { Announcements } from '@layouts/pages/mypages-sections/overview/announcements/announcements.component';
import { ContactSettingsConfirmation } from '@components/contact-settings-confirmation/contact-settings-confirmation.component';
import ContactSettingsFormLogic from '@layouts/pages/mypages-sections/profile/components/contact-settings-form-logic.component';
import { useApi } from '@services/api-service';
import { ClientContactSetting } from '@interfaces/contactsettings';

export default function Overview() {
  const { data: contactSettings } = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'get',
    queryKey: ['contactsetting'],
  });

  return (
    <div>
      <Consumption />
      <Todos />
      <Announcements />

      <ContactSettingsFormLogic formData={contactSettings}>
        <ContactSettingsConfirmation />
      </ContactSettingsFormLogic>
    </div>
  );
}
