'use client';

import ContentCard, {
  ContactDetailsGrid,
  ContentCardBody,
  ContentCardHeader,
} from '@components/content-card/content-card';
import { FormBox } from '@components/form/form-box.component';
import { ClientContactSetting, DelegatedContactSetting } from '@interfaces/contactsettings';
import { useApi } from '@services/api-service';
import { Button, Icon } from '@sk-web-gui/react';
import { Pen, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DelegateFilter } from './components/delegate-filter.component';
import DelegatedContactSettingsFormLogic from './components/delegated-contact-settings-form-logic.component';

const EmptyField = (text: string) => {
  return <span className="italic">{text}</span>;
};

export const DelegatedContactDetails = () => {
  const { data: mainContactsetting } = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'get',
    queryKey: ['mainContactsetting'],
  });
  const { data: delegatedContactSetting } = useApi<DelegatedContactSetting>({
    url: `/delegates/${mainContactsetting?.id}`,
    method: 'get',
    queryKey: ['delegates', mainContactsetting?.id ?? ''],
    queryOptions: { enabled: !!mainContactsetting?.id },
  });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    console.log('Main contact setting:', mainContactsetting);
    console.log('Delegate:', delegatedContactSetting?.delegate);
    console.log('Delegated contact settings:', delegatedContactSetting?.contactSetting);
  }, [mainContactsetting, delegatedContactSetting]);

  return (
    <ContentCard>
      <ContentCardHeader>
        <h2 className="text-h4-sm medium-device:text-h4-lg mb-0">
          <div className="flex items-center gap-md">
            <span>Anpassade aviseringar</span>
          </div>
        </h2>
        <Button
          size="md"
          variant="tertiary"
          showBackground={false}
          leftIcon={<Icon icon={isEdit ? <X /> : <Pen />} />}
          onClick={() => setIsEdit((isEdit) => !isEdit)}
        >
          {isEdit ? 'Avbryt' : 'Redigera'}
        </Button>
      </ContentCardHeader>

      <ContentCardBody>
        <DelegatedContactSettingsFormLogic onSubmitSuccess={() => setIsEdit(false)} formData={delegatedContactSetting}>
          <ContactDetailsGrid>
            <FormBox name="contactSetting.alias" header="Namn på kontaktväg" isEdit={isEdit}>
              <div>{delegatedContactSetting?.contactSetting?.alias ?? EmptyField('Inget alias tillagt')}</div>{' '}
            </FormBox>
            {/* <FormBox header="Namn">
              <div>{delegatedContactSetting?.contactSetting?.name ?? EmptyField('Inget namn tillagt')}</div>{' '}
            </FormBox>
            <FormBox header="Adress">
              <div>
                {getAddress(delegatedContactSetting?.contactSetting?.address) ?? EmptyField('Ingen address tillagd')}
              </div>
            </FormBox>
            <FormBox name="email" header="E-post" isEdit={isEdit}>
              <div>{delegatedContactSetting?.contactSetting?.email ?? EmptyField('Ingen epost-address tillagd')}</div>
            </FormBox> */}
            <FormBox name="contactSetting.phone" header="Telefonnummer" isEdit={isEdit}>
              <div>{delegatedContactSetting?.contactSetting?.phone ?? EmptyField('Inget telefonnummer tillagt')}</div>
            </FormBox>
          </ContactDetailsGrid>
          {[
            { label: 'Strömavbrott', category: 'ELECTRICITY' as const },
            { label: 'Avbrott fjärrvärme', category: 'DISTRICT_HEATING' as const },
          ].map(({ label, category }) => (
            <div key={`delegate-${category}`} className="my-24 bg-background-color-mixin-1 p-24 rounded-20">
              <h3 className="text-large">{label}</h3>
              <small>{category}</small>
              {delegatedContactSetting ? (
                <DelegateFilter delegatedContactSetting={delegatedContactSetting} category={category} isEdit={isEdit} />
              ) : null}
            </div>
          ))}
          {isEdit && (
            <div className="mt-40">
              <Button type="submit" color="vattjom">
                Spara
              </Button>
            </div>
          )}
        </DelegatedContactSettingsFormLogic>
      </ContentCardBody>
    </ContentCard>
  );
};
