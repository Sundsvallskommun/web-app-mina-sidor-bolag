'use client';

import { Button, Checkbox, FormControl, FormLabel, Icon } from '@sk-web-gui/react';
import { Pen } from 'lucide-react';
import { useState } from 'react';
import ContactSettingsFormLogic from './components/contact-settings-form-logic.component';
import { ConnectForm } from '@components/form/connect-form.component';
import { ClientContactSetting } from '@interfaces/contactsettings';
import { useApi } from '@services/api-service';

export const ContactSettings = () => {
  const { data: contactsettings } = useApi<ClientContactSetting>({ url: '/contactsettings', method: 'get' });
  const [isEdit, setIsEdit] = useState(false);

  return (
    <div className="pt-40 px-16">
      <ContactSettingsFormLogic onSubmitSuccess={() => setIsEdit(false)} formData={contactsettings}>
        <div>
          <div className="flex flex-col gap-y-40 pb-24">
            <ConnectForm>
              {({ register, watch }) => {
                if (isEdit) {
                  return (
                    <FormControl fieldset>
                      <FormLabel className="text-large">
                        Aviseringar om avbrott i din strömförsörjning och fjärrvärme
                      </FormLabel>
                      <Checkbox.Group direction="row">
                        <Checkbox {...register('notifications.phone_disabled')}>Sms</Checkbox>
                        <Checkbox {...register('notifications.email_disabled')}>E-post</Checkbox>
                      </Checkbox.Group>
                    </FormControl>
                  );
                } else {
                  const contactWaysString =
                    watch('notifications.phone_disabled') && watch('notifications.email_disabled')
                      ? 'sms och e-post'
                      : watch('notifications.phone_disabled')
                        ? 'sms'
                        : watch('notifications.email_disabled')
                          ? 'e-post'
                          : '';

                  return (
                    <div className="text-content">
                      <h3 className="text-large font-bold">
                        Aviseringar om avbrott i din strömförsörjning och fjärrvärme
                      </h3>
                      <p>
                        {contactWaysString
                          ? `Du har valt att få aviseringar via ${contactWaysString}`
                          : 'Du får inga aviseringar'}
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
                    >
                      Avbryt
                    </Button>
                    <Button type="submit">Spara</Button>
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
