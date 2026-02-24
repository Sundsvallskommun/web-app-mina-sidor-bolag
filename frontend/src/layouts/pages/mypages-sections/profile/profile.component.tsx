'use client';

import { useAppContext } from '@contexts/app.context';
import { FacilityDelegates } from '@layouts/pages/mypages-sections/profile/profile-facility-delegates.component';
import { Divider } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { Mandates } from './components/mandates/mandates.component';
import { ProfileAccordion } from './components/profile-accordion.component';
import { ContactDetails } from './profile-contact-details.component';
import { ContactSettings } from './profile-contact-settings.component';
import { DelegatedContactDetails } from './profile-delegate-details.component';

export const Profile = () => {
  const { t } = useTranslation('profile');
  const { isRepresentingModeBusiness, isRepresentingModePrivate } = useAppContext();
  return (
    <div className="flex flex-col gap-24">
      <h1 className="mb-16">{t('profile:title')}</h1>
      <ProfileAccordion
        data-cy="contact-information-disclosure"
        title={t('profile:contactSetting.title')}
        subTitle={t('profile:contactSetting.description')}
      >
        <ContactDetails />
      </ProfileAccordion>

      <ProfileAccordion
        title={t('notifications:title')}
        subTitle={t('notifications:description')}
        data-cy="notifications-disclosure"
      >
        <ContactSettings />

        <Divider className="my-48 mx-8" />

        <DelegatedContactDetails />
      </ProfileAccordion>

      {isRepresentingModePrivate && (
        <ProfileAccordion
          subTitle={t('profile:delegates.description')}
          title={t('profile:delegates.title')}
          data-cy="facility-delegates-disclosure"
        >
          <FacilityDelegates />
        </ProfileAccordion>
      )}

      {isRepresentingModeBusiness && <Mandates />}
    </div>
  );
};
