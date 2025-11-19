'use client';

import { FormBox } from '@components/form/form-box.component';
import { useApi, useApiService } from '@services/api-service';
import { Button, Divider, Icon } from '@sk-web-gui/react';
import _ from 'lodash';
import { Info, Pen } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ContactSettingsFormLogic from './components/contact-settings-form-logic.component';
import { Trans, useTranslation } from 'react-i18next';
import { NextLink } from '@sk-web-gui/next';
import { ClientContactSetting, ClientContactSettingAddress } from '@data-contracts/backend/data-contracts';

const EmptyField = (text: string) => {
  return <span className="italic">{text}</span>;
};

const getAddress = (address?: ClientContactSettingAddress | null) => {
  if (address) {
    return `${address.street ? `${_.capitalize(address.street)}, ` : ''}${address.postcode} ${_.capitalize(address.city)}`;
  } else {
    return null;
  }
};

export const ContactDetails = () => {
  const queryClient = useApiService((s) => s.queryClient);
  const { t } = useTranslation(['common', 'profile']);

  const { data: contactsettings, isError } = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'get',
    queryKey: ['contactsetting'],
  });
  const [isEditPhone, setIsEditPhone] = useState<boolean>(false);
  const [isEditEmail, setIsEditEmail] = useState<boolean>(false);

  useEffect(() => {
    if (isError) {
      queryClient.setQueryData(['contactsetting'], []);
      queryClient.setQueryData(['delegates'], []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const setIsEditFalse = () => {
    setIsEditPhone(false);
    setIsEditEmail(false);
  };

  return (
    <div className="pt-40">
      <div className="flex items-start max-w-fit mb-40 gap-6">
        <Icon icon={<Info />} className="shrink-0 mr-6" />
        <Trans
          i18nKey="profile:contactSetting.information"
          components={{
            Link: <NextLink href={t('profile:contactSetting.taxAgencyUrl')} external />,
          }}
        />
      </div>

      <ContactSettingsFormLogic onSubmitSuccess={() => setIsEditFalse()} formData={contactsettings}>
        <>
          <FormBox header={t('profile:name')}>
            <div data-cy="form-box-name">{contactsettings?.name ?? EmptyField(t('profile:noName'))}</div>
          </FormBox>
          <Divider className="my-16" />
          <FormBox header={t('common:address')}>
            <div data-cy="form-box-address">
              {getAddress(contactsettings?.address) ?? EmptyField(t('profile:noAddress'))}
            </div>
          </FormBox>
          <Divider className="my-16" />

          <FormBox name="email" header={isEditEmail ? t('profile:editEmail') : t('profile:email')} isEdit={isEditEmail}>
            {isEditEmail ? (
              <div className="flex gap-16 mt-16">
                <Button variant="secondary" data-cy="cancel-edit-email-button" onClick={() => setIsEditEmail(false)}>
                  {t('profile:cancel')}
                </Button>
                <Button type="submit" data-cy="save-email-button">
                  {t('profile:save')}
                </Button>
              </div>
            ) : (
              <>
                <div data-cy="form-box-email">{contactsettings?.email ?? EmptyField(t('profile:noEmail'))}</div>
                <Button
                  size="md"
                  variant="secondary"
                  leftIcon={<Icon icon={<Pen />} />}
                  onClick={() => setIsEditEmail(true)}
                  className="mt-32"
                  data-cy="edit-email-button"
                >
                  {t('profile:editEmail')}
                </Button>
              </>
            )}
          </FormBox>
          <Divider className="my-16" />

          <FormBox name="phone" header={isEditPhone ? t('profile:editPhone') : t('profile:phone')} isEdit={isEditPhone}>
            {isEditPhone ? (
              <div className="flex gap-16 mt-16">
                <Button variant="secondary" data-cy="cancel-edit-phone-button" onClick={() => setIsEditPhone(false)}>
                  {t('profile:cancel')}
                </Button>
                <Button type="submit" data-cy="save-phone-button">
                  {t('profile:save')}
                </Button>
              </div>
            ) : (
              <>
                <div data-cy="form-box-phone">{contactsettings?.phone ?? EmptyField(t('profile:noPhone'))}</div>
                <Button
                  size="md"
                  variant="secondary"
                  leftIcon={<Icon icon={<Pen />} />}
                  onClick={() => setIsEditPhone(true)}
                  className="mt-32"
                  data-cy="edit-phone-button"
                >
                  {t('profile:editPhone')}
                </Button>
              </>
            )}
          </FormBox>
        </>
      </ContactSettingsFormLogic>
    </div>
  );
};
