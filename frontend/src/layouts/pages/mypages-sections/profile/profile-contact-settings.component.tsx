'use client';

import { Button, Checkbox, FormControl, FormLabel, Icon } from '@sk-web-gui/react';
import { Info, Pen } from 'lucide-react';
import { useState } from 'react';
import ContactSettingsFormLogic from './components/contact-settings-form-logic.component';
import { ConnectForm } from '@components/form/connect-form.component';
import { useApi } from '@services/api-service';
import { useTranslation } from 'react-i18next';
import { ClientContactSetting } from '@data-contracts/backend/data-contracts';

export const ContactSettings = () => {
  const { data: contactsettings } = useApi<ClientContactSetting>({ url: '/contactsettings', method: 'get' });
  const [isEdit, setIsEdit] = useState(false);
  const { t } = useTranslation(['profile', 'notifications']);

  const getContactWayString = (email: boolean, phone: boolean) => {
    switch (true) {
      case email && phone:
        return t('notifications:contactBy', { contactWay: t('notifications:smsAndEmail') });
      case !email && phone:
        return t('notifications:contactBy', { contactWay: t('notifications:email') });
      case email && !phone:
        return t('notifications:contactBy', { contactWay: t('notifications:sms') });
      default:
        return t('notifications:none');
    }
  };

  return (
    <div>
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
                      <FormLabel className="text-large">{t('notifications:subTitle')}</FormLabel>
                      <Checkbox.Group>
                        <Checkbox
                          {...register('notifications.email_enabled')}
                          data-cy="notification-channel-email-checkbox"
                          className="mt-8"
                          disabled={!hasEmail}
                        >
                          {t('notifications:byEmail')}
                        </Checkbox>
                        {hasEmail ? null : (
                          <div className="flex items-center gap-6">
                            <Icon size={16} icon={<Info />} className="ml-32 w-4 h-4 shrink-0" />
                            <p className="text-small">{t('notifications:byEmailWarning')}</p>
                          </div>
                        )}

                        <Checkbox
                          {...register('notifications.phone_enabled')}
                          data-cy="notification-channel-sms-checkbox"
                          disabled={!hasPhone}
                        >
                          {t('notifications:bySms')}
                        </Checkbox>
                        {hasPhone ? null : (
                          <div className="flex items-center gap-6">
                            <Icon size={16} icon={<Info />} className="ml-32 w-4 h-4 shrink-0" />
                            <p className="text-small">{t('notifications:bySmsWarning')}</p>
                          </div>
                        )}
                      </Checkbox.Group>
                    </FormControl>
                  );
                } else {
                  return (
                    <div className="text-content">
                      <h3 className="text-large font-bold">{t('notifications:subTitle')}</h3>
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
                      {t('profile:cancel')}
                    </Button>
                    <Button type="submit" data-cy="save-notification-channel-button">
                      {t('profile:save')}
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
                    {t('notifications:edit')}
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
