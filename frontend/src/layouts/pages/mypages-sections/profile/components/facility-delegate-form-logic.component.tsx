import { yupResolver } from '@hookform/resolvers/yup';
import React, { useCallback, useMemo } from 'react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import * as yup from 'yup';
import {
  FacilityCreateDelegation,
  FacilityDelegation,
  FacilityUpdateDelegation,
  ResolvedFacilityDelegation,
} from '@interfaces/facility-delegation';
import { useSnackbar } from '@sk-web-gui/react';
import { queryClient, useApi } from '@services/api-service';
import { AxiosError } from 'axios';

const defaultFacilityDelegateForm = {
  facilities: [],
  delegatedTo: '',
  owner: '',
};

interface FacilityDelegationFormLogicProps {
  children: React.ReactNode | React.ReactNode[];
  formData?: FacilityDelegation;
  onSubmit?: (
    values: FacilityDelegation,
    context: UseFormReturn<Partial<FacilityDelegation>, unknown, Partial<FacilityDelegation>>
  ) => void;
  onSubmitSuccess?: () => void;
  onSubmitFailed?: () => void;
}

const formSchema = yup
  .object<ResolvedFacilityDelegation>({
    id: yup.string(),
    facilities: yup.array().min(1),
    delegatedToBirthDate: yup.string().required('Personnummer är obligatoriskt'),
    delegatedTo: yup.string(),
    owner: yup.string(),
  })
  .required();

export default function FacilityDelegateFormLogic({
  children,
  formData = defaultFacilityDelegateForm,
  onSubmit,
  onSubmitSuccess,
  onSubmitFailed,
}: Readonly<FacilityDelegationFormLogicProps>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = useForm<Partial<ResolvedFacilityDelegation>, any, Partial<FacilityDelegation>>({
    resolver: yupResolver(formSchema),
    defaultValues: useMemo(() => formData, [formData]),
    mode: 'onChange',
  });

  const { handleSubmit, getValues } = context;
  const snackBar = useSnackbar();

  const postMutation = useApi<FacilityCreateDelegation>({
    url: '/delegations',
    method: 'post',
  });
  const patchMutation = useApi<FacilityUpdateDelegation>({
    url: `/delegations/${getValues().id}`,
    method: 'patch',
  });

  const isPatch = useCallback(() => {
    return typeof formData?.id === 'string';
  }, [formData]);

  const _onSubmit = async (values: Partial<ResolvedFacilityDelegation>) => {
    if (onSubmit) {
      onSubmit(values, context);
    } else {
      const data = isPatch()
        ? {
            facilities: values.facilities,
            delegatedTo: values.delegatedTo,
          }
        : { facilities: values.facilities, delegatedTo: values.delegatedToBirthDate };

      const apiCall = isPatch() ? await patchMutation.mutateAsync : await postMutation.mutateAsync;
      await apiCall(data)
        .then(async () => {
          await queryClient.invalidateQueries({
            queryKey: ['facilityDelegation'],
          });
          snackBar({
            message: 'Uppgifterna sparades.',
            status: 'success',
          });
          if (onSubmitSuccess) onSubmitSuccess();
        })
        .catch((e: AxiosError) => {
          if (e.status === 409) {
            snackBar({
              message: 'Du kan inte delegera dig själv.',
              status: 'error',
            });
          } else {
            snackBar({
              message: 'Det gick inte att spara uppgifterna.',
              status: 'error',
            });
          }
          if (onSubmitFailed) onSubmitFailed();
        });
    }
  };

  return (
    <FormProvider {...context}>
      <form onSubmit={handleSubmit(_onSubmit)}>{children}</form>
    </FormProvider>
  );
}
