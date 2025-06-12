import { ContactDetailsGrid } from '@components/content-card/content-card';
import { FormBox } from '@components/form/form-box.component';
import { DelegatedContactSetting } from '@interfaces/contactsettings';
import { Button, Icon, useConfirm, useSnackbar } from '@sk-web-gui/react';
import { Pen, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DelegateFilter } from './delegate-filter.component';
import DelegatedContactSettingsFormLogic from './delegate-form-logic.component';
import { queryClient, useApi } from '@services/api-service';

const EmptyField = (text: string) => {
  return <span className="italic">{text}</span>;
};

export const DelegateItem = ({
  delegatedContactSetting,
  newItem,
  close,
}: {
  delegatedContactSetting: DelegatedContactSetting;
  newItem?: boolean;
  close?: () => void;
}) => {
  const deleteDelegate = useApi<DelegatedContactSetting>({
    url: `/delegates/${delegatedContactSetting?.delegate?.id ?? ''}`,
    queryKey: ['delegates', delegatedContactSetting?.delegate?.id ?? ''],
    method: 'delete',
  });
  const deleteContactSetting = useApi<DelegatedContactSetting>({
    url: `/contactsettings/${delegatedContactSetting?.contactSetting?.id ?? ''}`,
    queryKey: ['contactsettings', delegatedContactSetting?.contactSetting?.id ?? ''],
    method: 'delete',
  });

  const [isEdit, setIsEdit] = useState(newItem);
  const { showConfirmation } = useConfirm();
  const message = useSnackbar();

  useEffect(() => {
    if (newItem) {
      setIsEdit(true);
    }
  }, [newItem]);

  return (
    <div className="my-lg p-20 border rounded-20">
      <DelegatedContactSettingsFormLogic
        onSubmitSuccess={() => {
          setIsEdit(false);
          if (close) {
            close();
          }
        }}
        formData={delegatedContactSetting}
      >
        <ContactDetailsGrid>
          <FormBox name="contactSetting.alias" header="Namn på kontaktväg" isEdit={isEdit}>
            <div>{delegatedContactSetting?.contactSetting?.alias ?? EmptyField('Inget alias tillagt')}</div>{' '}
          </FormBox>
          <FormBox name="contactSetting.phone" header="Telefonnummer" isEdit={isEdit}>
            <div>{delegatedContactSetting?.contactSetting?.phone ?? EmptyField('Inget telefonnummer tillagt')}</div>
          </FormBox>
          {!newItem ? (
            <Button
              size="md"
              variant="tertiary"
              showBackground={true}
              leftIcon={<Icon icon={isEdit ? <X /> : <Pen />} />}
              onClick={() => setIsEdit((isEdit) => !isEdit)}
            >
              {isEdit ? 'Avbryt' : 'Redigera'}
            </Button>
          ) : null}
        </ContactDetailsGrid>
        {isEdit ? (
          <>
            {[
              { label: 'Strömavbrott', category: 'ELECTRICITY' as const },
              { label: 'Avbrott fjärrvärme', category: 'DISTRICT_HEATING' as const },
            ].map(({ label, category }) => (
              <div key={`delegate-${category}`} className="my-24 bg-background-color-mixin-1 p-24 rounded-20">
                <h3 className="text-large">{label}</h3>
                {delegatedContactSetting ? (
                  <DelegateFilter
                    delegatedContactSetting={delegatedContactSetting}
                    category={category}
                    isEdit={isEdit}
                  />
                ) : null}
              </div>
            ))}
            {isEdit && (
              <div className="mt-40 flex flex-row gap-16 justify-start">
                <Button type="submit" color="vattjom">
                  Spara
                </Button>
                {newItem ? (
                  <Button color="primary" type="button" onClick={close} variant="secondary">
                    Stäng
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    type="button"
                    onClick={() => {
                      showConfirmation(
                        'Ta bort kontakt',
                        'Vill du ta bort denna kontakt',
                        'Ta bort',
                        'Avbryt',
                        'warning'
                      ).then(async (confirm: boolean) => {
                        if (confirm) {
                          await deleteDelegate.mutateAsync(delegatedContactSetting);
                          await deleteContactSetting.mutateAsync(delegatedContactSetting);
                          queryClient.invalidateQueries({
                            queryKey: ['delegates'],
                          });
                          queryClient.invalidateQueries({
                            queryKey: ['contactsettings'],
                          });
                          setIsEdit(false);
                          message({
                            message: 'Kontakten togs bort.',
                            status: 'success',
                          });
                        }
                      });
                    }}
                    variant="secondary"
                  >
                    Ta bort
                  </Button>
                )}
              </div>
            )}
          </>
        ) : null}
      </DelegatedContactSettingsFormLogic>
    </div>
  );
};
