'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Accordion, Button, Divider, Icon, Link, Modal } from '@sk-web-gui/react';
import { Mail, Smartphone } from 'lucide-react';
import { FormBox } from '@components/form/form-box.component';
import { useFormContext } from 'react-hook-form';
import { useApi } from '@services/api-service';
import { ClientContactSetting } from '@interfaces/contactsettings';
import ContactSettingsFormLogic from '@layouts/pages/mypages-sections/profile/components/contact-settings-form-logic.component';

interface ContactSettingsCOnfirmationContentProps {
  onClose: () => void;
}

const ContactSettingsConfirmationContent: React.FC<ContactSettingsCOnfirmationContentProps> = ({onClose}) => {
  const methods = useFormContext();
  const { getValues, reset } = methods;
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const handleToggleEdit = useCallback(() => {
    if (isEdit) {
      reset();
    }
    setIsEdit(!isEdit);
  }, [isEdit, setIsEdit, reset]);

  return (
    <Modal.Content className="px-0 lg:px-56 gap-32 md:gap-40">
      <div>
        <h1 className="pb-8">Bekräfta kontaktuppgifter</h1>
        <p>
          Vi behöver dina kontaktuppgifter för att skicka viktig information, bekräftelser och påminnelser. Stämmer
          uppgifterna nedan?
        </p>
      </div>

      <Divider />

      <div className="flex items-center">
        <div
          className={`bg-background-color-mixin-2 flex justify-center items-center w-46 h-46 md:h-56 md:w-56 p-10 lg:p-12 rounded-button mr-16`}
        >
          <Icon icon={<Mail />} size={56} />
        </div>
        <div>
          <FormBox name="email" header={'E-postadress'} isEdit={isEdit}>
            {isEdit ? null : (getValues()?.email ?? 'Ingen e-postadress tillagd')}
          </FormBox>
        </div>
      </div>

      <div className="flex items-center">
        <div
          className={`bg-background-color-mixin-2 flex justify-center items-center w-46 h-46 md:h-56 md:w-56 p-10 lg:p-12 rounded-button mr-16`}
        >
          <Icon icon={<Smartphone />} size={56} />
        </div>
        <div>
          <FormBox name="phone" header={'Mobilnummer'} isEdit={isEdit}>
            {isEdit ? null : (getValues()?.phone ?? 'Inget mobilnummer tillagt')}
          </FormBox>
        </div>
      </div>

      <div>
        <Divider className="py-0 my-0" />
        <Accordion>
          <Accordion.Item header="Hantering av personuppgifter">
            <p className="pb-16">
              Vi använder din e-postadress och ditt mobilnummer för att kunna skicka viktig information, bekräftelser
              och påminnelser som rör dina avtal. Sundsvall Elnät och Sundsvall Energi är personuppgiftsansvarig och
              behandlar dina uppgifter enligt dataskyddsförordningen (GDPR).
            </p>
            <p>
              <Link
                href="https://sundsvallelnat.se/om-bolaget/lagar-och-krav/regler-for-hantering-av-personuppgifter"
                target="_blank"
                variant="tertiary"
                external
              >
                Läs mer om hur Sundsvall Elnät hanterar dina personuppgifter
              </Link>
            </p>
            <p>
              <Link
                href="https://sundsvallenergi.se/om-oss/detta-ar-vi/anvandarupplevelse/integritetspolicy"
                target="_blank"
                variant="tertiary"
                external
              >
                Läs mer om hur Sundsvall Energi hanterar dina personuppgifter
              </Link>
            </p>
          </Accordion.Item>
        </Accordion>
        <Divider className="py-0 my-0"/>
      </div>

      <Modal.Footer className="gap-16 flex-col-reverse md:flex-row">
        {isEdit ? (
          <>
            <Button
              variant="secondary"
              onClick={handleToggleEdit}
            >
              Avbryt
            </Button>
            <Button type="submit" onClick={onClose}>Spara uppgifter</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={handleToggleEdit}>
              Nej, ändra
            </Button>
            <Button
              type="submit"
              onClick={onClose}
            >
              Ja, bekräfta
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal.Content>
  );
};

export const ContactSettingsConfirmation: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const { data: contactSettings } = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'get',
    queryKey: ['contactsetting'],
  });

  const closeHandler = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <div>
      <Modal
        className="sm:mx-auto sm:my-auto sm:bottom-auto sm:relative sm:inline-flex sm:max-w-[720px] w-full block left-0 bottom-0 fixed rounded-0 rounded-t-cards sm:rounded-b-cards"
        disableCloseOutside={false}
        show={isOpen}
        hideClosebutton
      >
        <ContactSettingsFormLogic formData={contactSettings}>
          <ContactSettingsConfirmationContent onClose={closeHandler}/>
        </ContactSettingsFormLogic>
      </Modal>
    </div>
  );
};
