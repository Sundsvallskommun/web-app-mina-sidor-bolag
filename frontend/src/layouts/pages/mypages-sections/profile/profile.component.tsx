'use client';

import { useAppContext } from '@contexts/app.context';
import { FacilityDelegates } from '@layouts/pages/mypages-sections/profile/profile-facility-delegates.component';
import { useTranslation } from 'react-i18next';

export const Profile = () => {
  const { t } = useTranslation('profile');

  return (
    <div className="flex flex-col gap-24">
      <h1 className="mb-16">{t('profile:title')}</h1>

      <Disclosure
        className="bg-background-content px-24 py-8 rounded-button shadow-50"
        data-cy="contact-information-disclosure"
        header={
          <>
            <h4 className="text-h4-md">{t('profile:contactSetting.title')}</h4>
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
            <h4 className="text-h4-md">{t('notifications:title')}</h4>
            <p className="sm:text-base font-normal mb-0 text-small">{t('notifications:description')}</p>
          </>
        }
      >
        <ContactSettings />

        <Divider className="my-48 mx-8" />

        <DelegatedContactDetails />
      </Disclosure>

      <Disclosure
        className="bg-background-content rounded-cards shadow-50 md:py-8 px-24"
        data-cy="facility-delegates-disclosure"
        header={
          <>
            <h4 className="text-h4-md">{t('profile:delegates.title')}</h4>
            <p className="text-base font-normal mb-0">{t('profile:delegates.description')}</p>
          </>
        }
      >
        <FacilityDelegates />
      </Disclosure>
    </div>
  );
};
