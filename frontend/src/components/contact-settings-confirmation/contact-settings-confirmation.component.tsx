'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Accordion, Button, Divider, Icon, Link, Modal } from '@sk-web-gui/react';
import { Mail, Smartphone } from 'lucide-react';
import { FormBox } from '@components/form/form-box.component';
import { useFormContext } from 'react-hook-form';
import { useApi } from '@services/api-service';
import ContactSettingsFormLogic from '@layouts/pages/mypages-sections/profile/components/contact-settings-form-logic.component';
import { useLocalStorageValue } from '@react-hookz/web';

interface ContactSettingsConfirmationContentProps {
  isInitial: boolean;
  onClose: () => void;
}

const RENEWAL_INTERVAL = 1000 * 60 * 60 * 24 * 365;

const ContactSettingsConfirmationContent: React.FC<ContactSettingsConfirmationContentProps> = ({
  isInitial,
  onClose,
}) => {
  const methods = useFormContext();
  const { getValues, reset } = methods;
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const { t } = useTranslation(['confirmation', 'profile']);

  const handleToggleEdit = useCallback(() => {
    if (isEdit) {
      reset();
    }
    setIsEdit(!isEdit);
  }, [isEdit, setIsEdit, reset]);

  const title = isInitial ? t('confirmation:initialTitle') : t('confirmation:title');

  const description = isInitial ? t('confirmation:initialDescription') : t('confirmation:description');

  return (
    <Modal.Content className="px-0 lg:px-56 gap-32 md:gap-40">
      <div>
        <h1 className="pb-8">{title}</h1>
        <p className="text-[18px]">{description}</p>
      </div>

      <Divider />

      {isInitial ? (
        <div>
          <h2 className="!text-[18px]">{t('confirmation:addInformation')}</h2>
          <p>{t('confirmation:addInformationDescription')}</p>
        </div>
      ) : null}

      <div className="flex items-center">
        <div
          className={`bg-background-color-mixin-2 flex justify-center items-center w-46 h-46 md:h-56 md:w-56 p-10 lg:p-12 rounded-button mr-16`}
        >
          <Icon icon={<Mail />} size={56} />
        </div>
        <div className="w-full">
          <FormBox name="email" header={t('profile:email')} isEdit={isInitial || isEdit}>
            {isInitial || isEdit ? null : (getValues()?.email ?? t('profile:noEmail'))}
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
          <FormBox name="phone" header={t('profile:phone')} isEdit={isInitial || isEdit}>
            {isInitial || isEdit ? null : (getValues()?.phone ?? t('profile:noPhone'))}
          </FormBox>
        </div>
      </div>

      <div>
        <Divider className="py-0 my-0" />
        <Accordion>
          <Accordion.Item header={t('confirmation:personalData.title')}>
            <p className="pb-16">{t('confirmation:personalData.description')}</p>
            <p>
              <Link
                href="https://sundsvallelnat.se/om-bolaget/lagar-och-krav/regler-for-hantering-av-personuppgifter"
                target="_blank"
                variant="tertiary"
                external
              >
                {t('confirmation:personalData.sundsvallElnatLinkText')}
              </Link>
            </p>
            <p>
              <Link
                href="https://sundsvallenergi.se/om-oss/detta-ar-vi/anvandarupplevelse/integritetspolicy"
                target="_blank"
                variant="tertiary"
                external
              >
                {t('confirmation:personalData.sundsvallEnergiLinkText')}
              </Link>
            </p>
          </Accordion.Item>
        </Accordion>
        <Divider className="py-0 my-0" />
      </div>

      <Modal.Footer className="gap-16 flex-col-reverse md:flex-row">
        {isInitial ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              {t('confirmation:addLater')}
            </Button>
            <Button type="submit" onClick={onClose}>
              {t('confirmation:save')}
            </Button>
          </>
        ) : isEdit ? (
          <>
            <Button variant="secondary" onClick={handleToggleEdit}>
              {t('profile:cancel')}
            </Button>
            <Button type="submit" onClick={onClose}>
              {t('confirmation:save')}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={handleToggleEdit}>
              {t('confirmation:edit')}
            </Button>
            <Button type="submit" onClick={onClose}>
              {t('confirmation:confirm')}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal.Content>
  );
};

export const ContactSettingsConfirmation: React.FC = () => {
  const { value: showedInitial, set: setShowedInitial } = useLocalStorageValue('showedInitialContactSettings');
  const [cookieExists, setCookieExists] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data: contactSettings, isFetching } = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'get',
    queryKey: ['contactsetting'],
  });

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = '; ' + document.cookie;
      const parts = value.split('; ' + name + '=');
      if (parts.length === 2) {
        const part = parts.pop();
        return part ? part.split(';').shift() : null;
      }
      return null;
    };

    const checkCookie = () => {
      const cookieValue = getCookie('SKCookieConsent');
      if (cookieValue) {
        setCookieExists(true);
      }
    };
    checkCookie();
    const interval = setInterval(() => {
      const cookieValue = getCookie('SKCookieConsent');
      if (cookieValue) {
        setCookieExists(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const closeHandler = () => {
    if (!showedInitial) {
      setShowedInitial(true);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (isFetching) {
      return;
    }

    if ((!showedInitial && !contactSettings?.email && !contactSettings?.phone) || !contactSettings) {
      setIsOpen(true);
      return;
    }

    const modifiedTime = new Date(contactSettings.modified!).getTime();
    const currentTime = new Date().getTime();

    if (currentTime - modifiedTime > RENEWAL_INTERVAL) {
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, contactSettings]);

  return (
    <div>
      <Modal className="w-full max-w-[720px]" disableCloseOutside={false} show={isOpen && cookieExists} hideClosebutton>
        <ContactSettingsFormLogic formData={contactSettings}>
          <ContactSettingsConfirmationContent onClose={closeHandler} isInitial={!showedInitial} />
        </ContactSettingsFormLogic>
      </Modal>
    </div>
  );
};
