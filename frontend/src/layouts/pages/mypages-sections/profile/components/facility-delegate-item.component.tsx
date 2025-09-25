import { Button, FormLabel, Icon, Input, Modal, useConfirm, useSnackbar } from '@sk-web-gui/react';
import { Pen, Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { queryClient, useApi } from '@services/api-service';
import { useFormContext } from 'react-hook-form';
import { User } from '@interfaces/user';
import { FacilityDelegation, ResolvedFacilityDelegation } from '@interfaces/facility-delegation';
import FacilityDelegateFormLogic from '@layouts/pages/mypages-sections/profile/components/facility-delegate-form-logic.component';
import { FacilityDelegateFilter } from '@layouts/pages/mypages-sections/profile/components/facility-delegate-filter.component';

const EmptyField = (text: string) => {
  return <span className="italic">{text}</span>;
};

export const FacilityDelegateItem = ({
  facilityDelegate,
  newItem,
  close,
}: {
  facilityDelegate: ResolvedFacilityDelegation;
  newItem?: boolean;
  close?: () => void;
}) => {
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });

  const deleteFacilityDelegation = useApi<FacilityDelegation>({
    url: `/delegations/${facilityDelegate.id}`,
    queryKey: ['delegation', facilityDelegate.id ?? ''],
    method: 'delete',
  });

  const { showConfirmation } = useConfirm();
  const toastMessage = useSnackbar();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openHandler = () => {
    setIsOpen(true);
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  const filteredDelegationFacilities = () => {
    const f = facilityDelegate.facilities?.flatMap(
      (facility) => userData?.facilities?.filter((uf) => uf.facilityId === facility.id && uf.type !== 'Elhandel') ?? []
    );

    return f?.map((uf) => `${uf.address?.street} (${uf.type})`).join(', ') ?? '';
  };

  const FormComponent = () => {
    const { register, formState } = useFormContext();

    return (
      <div data-cy="form-component">
        <FormLabel>Personnummer</FormLabel>
        <Input className="block w-2/3" {...register('delegatedToBirthDate')} readOnly={!newItem} />
        {formState.errors['delegatedToBirthDate'] ? (
          <p className="text-small text-error">Ogiltigt personnummer</p>
        ) : (
          <p className="text-small w-2/3">Ange personnummer på den person du vill ge behörighet (ååååmmddxxxx).</p>
        )}

        <FacilityDelegateFilter />

        {!newItem && (
          <Button
            size="sm"
            variant="primary"
            color="error"
            type="button"
            leftIcon={<Icon icon={<Trash />} />}
            onClick={() => {
              showConfirmation(
                'Ta bort behörighet',
                'Vill du ta bort denna behörighet?',
                'Ta bort',
                'Avbryt',
                'error'
              ).then(async (confirm: boolean) => {
                if (confirm) {
                  await deleteFacilityDelegation.mutateAsync(facilityDelegate);
                  await queryClient.invalidateQueries({
                    queryKey: ['facilityDelegation'],
                  });
                  toastMessage({
                    message: 'Behörigheten togs bort.',
                    status: 'success',
                  });
                }
              });
            }}
            className="my-16"
            data-cy="remove-contact-person-button"
            inverted
          >
            Ta bort behörighet
          </Button>
        )}

        <Modal.Footer>
          <div className="flex flex-row gap-16 justify-start mt-40">
            <Button
              color="primary"
              type="button"
              onClick={() => {
                close?.();
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
          onClick={() => openHandler()}
          className="mt-8 sm:w-auto w-full"
          data-cy="add-delegate-button"
        >
          Lägg till behörighet
        </Button>
      ) : (
        <div className="my-16 p-16 bg-background-color-mixin-1 rounded-cards sm:flex sm:items-center sm:justify-between">
          <div className="sm:pb-0 pb-16" data-cy="delegate-alias">
            <p>
              {facilityDelegate?.delegatedToName ?? EmptyField('Inget alias tillagt')},
              {facilityDelegate.delegatedToBirthDate}
            </p>
            <p className="text-secondary">Behörig för anläggning: {filteredDelegationFacilities()}</p>
          </div>
          <Button
            size="md"
            variant="tertiary"
            showBackground={true}
            leftIcon={<Icon icon={<Pen />} />}
            onClick={() => openHandler()}
            className="sm:w-auto w-full"
            data-cy="edit-delegate"
          >
            Redigera
          </Button>
        </div>
      )}

      <Modal
        className="sm:w-[52rem] w-auto sm:bottom-auto sm:left-auto sm:rounded-cards sm:relative bottom-0 fixed left-0 rounded-b-0"
        label={newItem ? 'Lägg till behörighet' : 'Redigera behörighet'}
        show={isOpen}
        onClose={closeHandler}
      >
        <FacilityDelegateFormLogic
          onSubmitSuccess={() => {
            if (close) {
              close();
              closeHandler();
            }
          }}
          formData={facilityDelegate}
        >
          <Modal.Content>
            <FormComponent />
          </Modal.Content>
        </FacilityDelegateFormLogic>
      </Modal>
    </div>
  );
};
