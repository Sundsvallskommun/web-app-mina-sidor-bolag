'use client';

import { DelegatedContactDetails } from './profile-delegate-details.component';
import { ContactSettings } from './profile-contact-settings.component';
import { ContactDetails } from './profile-contact-details.component';
import { Disclosure, Divider } from '@sk-web-gui/react';

export const Profile = () => {
  return (
    <div className="flex flex-col gap-24">
      <h1 className="mb-16">Din profil och inställningar</h1>

      <Disclosure
        className="bg-background-content rounded-cards shadow-50 md:py-16 py-32 px-24"
        header={
          <>
            <h4 className="text-h4-md">Kontaktuppgifter</h4>
            <p className="sm:text-base font-normal mb-0 text-small">
              Uppdatera dina kontaktuppgifter så att vi kan nå dig.
            </p>
          </>
        }
      >
        <ContactDetails />
      </Disclosure>

      <Disclosure
        className="bg-background-content rounded-cards shadow-50 md:py-16 py-32 px-24"
        header={
          <>
            <h4 className="text-h4-md">Aviseringar</h4>
            <p className="sm:text-base font-normal mb-0 text-small">
              Välj hur du vill ha aviseringar och lägg till fler kontaktpersoner.
            </p>
          </>
        }
      >
        <ContactSettings />

        <Divider className="my-48 mx-8" />

        <DelegatedContactDetails />
      </Disclosure>

      {/*

      Yet to be implemented

      <Disclosure
        className="bg-background-content rounded-cards shadow-50 md:py-16 py-32 px-24"
        header={
          <>
            <h4 className="text-h4-md">Behörigheter</h4>
            <p className="text-base font-normal mb-0">Hantera dina behörigheter för Mina sidor.</p>
          </>
        }
      ></Disclosure>*/}
    </div>
  );
};
