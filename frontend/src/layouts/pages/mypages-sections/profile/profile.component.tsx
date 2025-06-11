import { DelegatedContactDetails } from './profile-delegated-contact-details.component';
import { ContactSettings } from './profile-contact-settings.component';
import { ContactDetails } from './profile-contact-details.component copy';

export const Profile = () => {
  return (
    <div className="flex flex-col gap-40">
      <h1 className="mb-0">Din profil och inställningar</h1>
      <ContactDetails />
      <ContactSettings />
      <DelegatedContactDetails />
    </div>
  );
};
