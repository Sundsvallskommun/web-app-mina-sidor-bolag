'use client';

import { useAppContext } from '@contexts/app.context';
import { FacilityDelegates } from '@layouts/pages/mypages-sections/profile/profile-facility-delegates.component';
import { Disclosure, Divider } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { Mandates } from './components/mandates/mandates.component';
import { ContactDetails } from './profile-contact-details.component';
import { ContactSettings } from './profile-contact-settings.component';
import { DelegatedContactDetails } from './profile-delegate-details.component';

export const Profile = () => {
  const { t } = useTranslation('profile');
  const { isRepresentingModeBusiness } = useAppContext();

  return (
    <div className="flex flex-col gap-24">
      <h1 className="mb-16">{t('profile:title')}</h1>

      <Disclosure
        className="bg-background-content px-24 py-8 rounded-button shadow-50"
        data-cy="contact-information-disclosure"
        header={
          <>
            <h2 className="text-h4-md">{t('profile:contactSetting.title')}</h2>
            <p className="sm:text-base font-normal mb-0 text-small">{t('profile:contactSetting.description')}</p>
          </>
        }
      >
        <ContactDetails />
      </Disclosure>

      <Disclosure
        className="bg-background-content px-24 py-8 rounded-button shadow-50"
        data-cy="notifications-disclosure"
        header={
          <>
            <h2 className="text-h4-md">{t('notifications:title')}</h2>
            <p className="sm:text-base font-normal mb-0 text-small">{t('notifications:description')}</p>
          </>
        }
      >
        <ContactSettings />

        <Divider className="my-48 mx-8" />

        <DelegatedContactDetails />
      </Disclosure>

      <Disclosure
        className="bg-background-content px-24 py-8 rounded-button shadow-50"
        data-cy="facility-delegates-disclosure"
        header={
          <>
            <h2 className="text-h4-md">{t('profile:delegates.title')}</h2>
            <p className="text-base font-normal mb-0">{t('profile:delegates.description')}</p>
          </>
        }
      >
        <FacilityDelegates />
      </Disclosure>

      {isRepresentingModeBusiness && <Mandates />}
    </div>
  );
};
