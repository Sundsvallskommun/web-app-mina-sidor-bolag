'use client';

import { Button, Checkbox, FormControl, FormLabel, Icon } from '@sk-web-gui/react';
import { Info, Pen } from 'lucide-react';
import { useState } from 'react';
import ContactSettingsFormLogic from './components/contact-settings-form-logic.component';
import { ConnectForm } from '@components/form/connect-form.component';
import { ClientContactSetting } from '@interfaces/contactsettings';
import { useApi } from '@services/api-service';

export const ContactSettings = () => {
  const { data: contactsettings } = useApi<ClientContactSetting>({ url: '/contactsettings', method: 'get' });
  const [isEdit, setIsEdit] = useState(false);

  const getContactWayString = (email: boolean, phone: boolean) => {
    const contactWayString: string = 'Du har valt att få aviseringar via';

    switch (true) {
      case email && phone:
        return contactWayString.concat(' sms och e-post.');
      case !email && phone:
        return contactWayString.concat(' e-post.');
      case email && !phone:
        return contactWayString.concat(' sms.');
      default:
        return 'Du får inga aviseringar';
    }
  };

  return (
    <div className="pt-40">
      <ContactSettingsFormLogic onSubmitSuccess={() => setIsEdit(false)} formData={contactsettings}>
        <div>
          <div className="flex flex-col gap-y-40 pb-24">
            <ConnectForm>
              {({ register, watch, getValues }) => {
                const hasPhone = !!watch('phone');
                const hasEmail = !!watch('email');

                if (isEdit) {
                  return (
                    <FormControl fieldset>
                      <FormLabel className="text-large">
                        Aviseringar om avbrott i din strömförsörjning och fjärrvärme
                      </FormLabel>
                      <Checkbox.Group>
                        <Checkbox
                          {...register('notifications.email_enabled')}
                          data-cy="notification-channel-email-checkbox"
                          className="mt-8"
                          disabled={!hasEmail}
                        >
                          E-post
                        </Checkbox>
                        {hasEmail ? null : (
                          <div className="flex items-center gap-6">
                            <Icon size={16} icon={<Info />} className="ml-32 w-4 h-4 shrink-0" />
                            <p className="text-small">
                              För att få aviseringar via mail behöver du lägga till en e-post.
                            </p>
                          </div>
                        )}

                        <Checkbox
                          {...register('notifications.phone_enabled')}
                          data-cy="notification-channel-sms-checkbox"
                          disabled={!hasPhone}
                        >
                          Sms
                        </Checkbox>
                        {hasPhone ? null : (
                          <div className="flex items-center gap-6">
                            <Icon size={16} icon={<Info />} className="ml-32 w-4 h-4 shrink-0" />
                            <p className="text-small">
                              För att få aviseringar via sms behöver du lägga till ett mobilnummer.
                            </p>
                          </div>
                        )}
                      </Checkbox.Group>
                    </FormControl>
                  );
                } else {
                  return (
                    <div className="text-content">
                      <h3 className="text-large font-bold">
                        Aviseringar om avbrott i din strömförsörjning och fjärrvärme
                      </h3>
                      <p>
                        {getContactWayString(
                          getValues('notifications.phone_enabled'),
                          getValues('notifications.email_enabled')
                        )}
                      </p>
                    </div>
                  );
                }
              }}
            </ConnectForm>
          </div>

          <ConnectForm>
            {({ reset }) => (
              <div className="flex gap-16">
                {isEdit ? (
                  <>
                    <Button
                      size="md"
                      variant="secondary"
                      showBackground={false}
                      onClick={() => {
                        reset();
                        setIsEdit((isEdit) => !isEdit);
                      }}
                      data-cy="cancel-edit-notification-channel-button"
                    >
                      Avbryt
                    </Button>
                    <Button type="submit" data-cy="save-notification-channel-button">
                      Spara
                    </Button>
                  </>
                ) : (
                  <Button
                    size="md"
                    variant="secondary"
                    showBackground={false}
                    leftIcon={<Icon icon={<Pen />} />}
                    onClick={() => {
                      reset();
                      setIsEdit((isEdit) => !isEdit);
                    }}
                    data-cy="edit-notification-channel-button"
                  >
                    Ändra aviseringar
                  </Button>
                )}
              </div>
            )}
          </ConnectForm>
        </div>
      </ContactSettingsFormLogic>
    </div>
  );
};
