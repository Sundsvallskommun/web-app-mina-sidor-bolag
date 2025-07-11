import { FormBox } from '@components/form/form-box.component';
import { DelegatedContactSetting } from '@interfaces/contactsettings';
import { Button, Icon, Modal, useConfirm, useSnackbar } from '@sk-web-gui/react';
import { Pen, Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { DelegateFilter } from './delegate-filter.component';
import DelegatedContactSettingsFormLogic from './delegate-form-logic.component';
import { queryClient, useApi } from '@services/api-service';
import { useFormContext } from 'react-hook-form';
import { User } from '@interfaces/user';

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
  close: () => void;
}) => {
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
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

  const { showConfirmation } = useConfirm();
  const message = useSnackbar();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openHandler = () => {
    setIsOpen(true);
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  const categoryExists = (service: { label: string; category: 'ELECTRICITY' | 'DISTRICT_HEATING' }) => {
    return userData?.facilities?.some((f) =>
      service.category === 'ELECTRICITY'
        ? f.type === 'El'
        : service.category === 'DISTRICT_HEATING'
          ? f.type === 'Fjärrvärme'
          : false
    );
  };

  const FormComponent = () => {
    const { formState } = useFormContext();

    return (
      <div data-cy="form-component">
        <FormBox name="contactSetting.alias" header="Namn på kontakt" isEdit>
          <div className="mb-40">
            {formState.errors?.contactSetting?.['alias'] && (
              <p className="text-small text-error">{formState.errors?.contactSetting?.['alias']?.message}</p>
            )}
          </div>
        </FormBox>
        <FormBox name="contactSetting.phone" header="Mobilnummer" isEdit>
          <div className="mb-40">
            {formState.errors?.contactSetting?.['phone'] && (
              <p className="text-small text-error">{formState.errors?.contactSetting?.['phone']?.message}</p>
            )}
          </div>
        </FormBox>

        <p className="text-label-medium mb-0">Välj när sms ska skickas</p>

        {[
          { label: 'Strömavbrott', category: 'ELECTRICITY' as const },
          { label: 'Avbrott fjärrvärme', category: 'DISTRICT_HEATING' as const },
        ]
          .filter(categoryExists)
          .map(({ label, category }) => (
            <div key={`delegate-${category}`} className="my-24 bg-background-color-mixin-1 p-24 rounded-20">
              <h3 className="text-large">{label}</h3>
              {delegatedContactSetting ? (
                <DelegateFilter delegatedContactSetting={delegatedContactSetting} category={category} isEdit />
              ) : null}
            </div>
          ))}

        {!newItem && (
          <Button
            size="sm"
            variant="primary"
            color="error"
            type="button"
            leftIcon={<Icon icon={<Trash />} />}
            onClick={() => {
              showConfirmation(
                'Ta bort kontaktperson',
                'Vill du ta bort denna kontaktperson?',
                'Ta bort',
                'Avbryt',
                'error'
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
                  message({
                    message: 'Kontakten togs bort.',
                    status: 'success',
                  });
                }
              });
            }}
            className="my-16"
            data-cy="remove-contact-person-button"
            inverted
          >
            Ta bort kontaktperson
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
      {newItem ? (
        <Button
          size="md"
          variant="secondary"
          showBackground={true}
          leftIcon={<Icon icon={<Plus />} />}
          onClick={() => {
            openHandler();
          }}
          className="mt-8 sm:w-auto w-full"
          data-cy="add-delegate-button"
        >
          Lägg till kontaktperson
        </Button>
      ) : (
        <div className="my-16 p-16 bg-background-color-mixin-1 rounded-cards sm:flex sm:items-center sm:justify-between">
          <div className="sm:pb-0 pb-16" data-cy="delegate-alias">
            {delegatedContactSetting?.contactSetting?.alias ?? EmptyField('Inget alias tillagt')}
          </div>
          <Button
            size="md"
            variant="tertiary"
            showBackground={true}
            leftIcon={<Icon icon={<Pen />} />}
            onClick={() => {
              openHandler();
            }}
            className="sm:w-auto w-full"
            data-cy="edit-delegate"
          >
            Redigera
          </Button>
        </div>
      )}

      <Modal
        className="sm:w-[52rem] w-auto sm:bottom-auto sm:left-auto sm:rounded-cards sm:relative bottom-0 fixed left-0 rounded-b-0"
        label={newItem ? 'Lägg till kontaktperson' : 'Redigera kontaktperson'}
        show={isOpen}
        onClose={closeHandler}
      >
        <DelegatedContactSettingsFormLogic
          onSubmitSuccess={() => {
            if (close) {
              close();
              closeHandler();
            }
          }}
          formData={delegatedContactSetting}
        >
          <Modal.Content>
            <FormComponent />
          </Modal.Content>

          <Modal.Footer>
            <div className="flex flex-row gap-16 justify-start">
              <Button
                color="primary"
                type="button"
                onClick={() => {
                  close();
                  closeHandler();
                }}
                variant="secondary"
                data-cy="cancel-delegate-form-button"
              >
                Avbryt
              </Button>

              <Button type="submit" data-cy="save-delegate-button">
                {newItem ? 'Lägg till' : 'Spara'}
              </Button>
            </div>
          </Modal.Footer>
        </DelegatedContactSettingsFormLogic>
      </Modal>
    </div>
  );
};
