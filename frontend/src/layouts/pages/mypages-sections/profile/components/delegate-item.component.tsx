import { FormBox } from '@components/form/form-box.component';
import { DelegatedContactSetting } from '@interfaces/contactsettings';
import { Button, Icon, Modal, useConfirm, useSnackbar } from '@sk-web-gui/react';
import { Pen, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
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
  close: () => void;
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

  const { showConfirmation } = useConfirm();
  const message = useSnackbar();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openHandler = () => {
    setIsOpen(true);
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  const FormComponent = () => {
    return (
      <div>
        <FormBox name="contactSetting.alias" header="Namn på kontakt" isEdit>
          <div className="mb-40"></div>
        </FormBox>
        <FormBox name="contactSetting.phone" header="Mobilnummer" isEdit>
          <div className="mb-40"></div>
        </FormBox>

        <p className="text-label-medium mb-0">Välj när sms ska skickas</p>
        <>
          {[
            { label: 'Strömavbrott', category: 'ELECTRICITY' as const },
            { label: 'Avbrott fjärrvärme', category: 'DISTRICT_HEATING' as const },
          ].map(({ label, category }) => (
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
            >
              Ta bort kontaktperson
            </Button>
          )}
        </>
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
          className="mt-8"
        >
          Lägg till kontaktperson
        </Button>
      ) : (
        <div className="my-16 p-16 bg-background-color-mixin-1 rounded-cards flex items-center justify-between">
          <div>{delegatedContactSetting?.contactSetting?.alias ?? EmptyField('Inget alias tillagt')}</div>
          <Button
            size="md"
            variant="tertiary"
            showBackground={true}
            leftIcon={<Icon icon={<Pen />} />}
            onClick={() => {
              openHandler();
            }}
          >
            Redigera
          </Button>
        </div>
      )}

      <Modal
        className="w-[52rem]"
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
              >
                Avbryt
              </Button>

              {newItem ? <Button type="submit">Lägg till</Button> : <Button type="submit">Spara</Button>}
            </div>
          </Modal.Footer>
        </DelegatedContactSettingsFormLogic>
      </Modal>
    </div>
  );
};
