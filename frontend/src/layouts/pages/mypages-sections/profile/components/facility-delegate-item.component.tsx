import { Button, FormLabel, Icon, Input, Modal, useConfirm, useSnackbar } from '@sk-web-gui/react';
import { Pen, Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { queryClient, useApi } from '@services/api-service';
import { useFormContext } from 'react-hook-form';
import { User } from '@interfaces/user';
import { FacilityDelegation, ResolvedFacilityDelegation } from '@interfaces/facility-delegation';
import FacilityDelegateFormLogic from '@layouts/pages/mypages-sections/profile/components/facility-delegate-form-logic.component';
import { FacilityDelegateFilter } from '@layouts/pages/mypages-sections/profile/components/facility-delegate-filter.component';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('profile');

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
        <FormLabel>{t('profile:personNumber')}</FormLabel>
        <Input className="block w-2/3" {...register('delegatedToBirthDate')} readOnly={!newItem} />
        {formState.errors['delegatedToBirthDate'] ? (
          <p className="text-small text-error">{t('profile:invalidPersonNumber')}</p>
        ) : (
          <p className="text-small w-2/3">{t('profile:addPersonNumber')}</p>
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
                t('profile:delegates.remove.title'),
                t('profile:delegates.remove.message'),
                t('profile:remove'),
                t('profile:cancel'),
                'error'
              ).then(async (confirm: boolean) => {
                if (confirm) {
                  await deleteFacilityDelegation.mutateAsync(facilityDelegate);
                  await queryClient.invalidateQueries({
                    queryKey: ['facilityDelegation'],
                  });
                  toastMessage({
                    message: t('profile:delegates.remove.success'),
                    status: 'success',
                  });
                }
              });
            }}
            className="my-16"
            data-cy="remove-facility-delegate-button"
            inverted
          >
            {t('profile:delegates.remove.title')}
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
              {t('profile:cancel')}
            </Button>

            <Button type="submit" data-cy="save-delegate-button">
              {newItem ? t('profile:add') : t('profile:save')}
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
          {t('profile:delegates.add')}
        </Button>
      ) : (
        <div className="my-16 p-16 bg-background-color-mixin-1 rounded-cards sm:flex sm:items-center sm:justify-between">
          <div className="sm:pb-0 pb-16" data-cy="delegatedToName">
            <p>
              {facilityDelegate?.delegatedToName ?? EmptyField(t('profile:noAlias'))},
              {facilityDelegate.delegatedToBirthDate}
            </p>
            <p className="text-secondary">
              {t('profile:delegates.eligibleForFacility')} {filteredDelegationFacilities()}
            </p>
          </div>
          <Button
            size="md"
            variant="tertiary"
            showBackground={true}
            leftIcon={<Icon icon={<Pen />} />}
            onClick={() => openHandler()}
            className="sm:w-auto w-full"
            data-cy="edit-facility-delegate"
          >
            {t('profile:edit')}
          </Button>
        </div>
      )}

      <Modal
        className="sm:w-[52rem] w-auto sm:bottom-auto sm:left-auto sm:rounded-cards sm:relative bottom-0 fixed left-0 rounded-b-0"
        label={newItem ? t('profile:delegates.add') : t('profile:delegates.edit')}
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
