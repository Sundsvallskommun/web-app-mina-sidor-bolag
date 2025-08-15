'use client';

import React, { useEffect, useState } from 'react';
import { Accordion, Button, Divider, Icon, Link, Modal } from '@sk-web-gui/react';
import { Mail, Smartphone } from 'lucide-react';
import { FormBox } from '@components/form/form-box.component';
import { useFormContext } from 'react-hook-form';

export const ContactSettingsConfirmation: React.FC = () => {
  const methods = useFormContext();
  const { getValues, reset } = methods;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const openHandler = () => {
    setIsOpen(true);
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <div>
      <Button onClick={openHandler}>Knapp</Button>
      <Modal
        className="sm:mx-auto sm:my-auto sm:bottom-auto sm:relative sm:inline-flex sm:max-w-[720px] w-full block left-0 bottom-0 fixed rounded-0 rounded-t-cards sm:rounded-b-cards"
        disableCloseOutside={false}
        show={isOpen}
        onClose={closeHandler}
        hideClosebutton
      >
        <Modal.Content className="sm:px-80">
          <h1>Bekräfta kontaktuppgifter</h1>
          <p>
            Vi behöver dina kontaktuppgifter för att skicka viktig information, bekräftelser och påminnelser. Stämmer
            uppgifterna nedan?
          </p>

          <Divider className="pt-20" />

          <div className="flex items-center pt-24 pb-40">
            <div
              className={`bg-background-color-mixin-2 flex justify-center items-center lg:w-52 lg:h-52 md:h-48 md:w-48 h-32 w-32 md:p-0 p-4 rounded-button mr-16`}
            >
              <Icon icon={<Mail />} size={30} />
            </div>
            <div>
              <FormBox name="email" header={'E-postadress'} isEdit={isEdit}>
                {isEdit ? null : (getValues()?.email ?? 'Ingen e-postadress tillagd')}
              </FormBox>
            </div>
          </div>

          <div className="flex items-center pb-40">
            <div
              className={`bg-background-color-mixin-2 flex justify-center items-center lg:w-52 lg:h-52 md:h-48 md:w-48 h-32 w-32 md:p-0 p-4 rounded-button mr-16`}
            >
              <Icon icon={<Smartphone />} size={30} />
            </div>
            <div>
              <FormBox name="phone" header={'Mobilnummer'} isEdit={isEdit}>
                {isEdit ? null : (getValues()?.phone ?? 'Inget mobilnummer tillagt')}
              </FormBox>
            </div>
          </div>

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
          <Divider className="py-0 my-0" />

          <Modal.Footer className="pt-40">
            {isEdit ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEdit(false);
                    reset();
                  }}
                >
                  Avbryt
                </Button>
                <Button type="submit">Spara uppgifter</Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setIsEdit(true)}>
                  Nej, ändra
                </Button>
                <Button
                  type="submit"
                  onClick={() => {
                    closeHandler();
                  }}
                >
                  Ja, bekräfta
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </div>
  );
};
