import { yupResolver } from '@hookform/resolvers/yup';
import { useApi, useApiService } from '@services/api-service';
import { useSnackbar } from '@sk-web-gui/react';
import { DefaultError } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { DEFAULT_PHONE_COUNTRY_CODE, formatPhoneNumber, isValidMobileNumber } from '@utils/format-phone-number';
import { useTranslation } from 'react-i18next';
import { DelegatedContactSetting, ExtendedClientContactSetting } from '@interfaces/contactsettings';
import { ClientDelegate, Filter, Rule } from '@data-contracts/backend/data-contracts';

const defaultDelegatedContactSettingsForm: Partial<DelegatedContactSetting> = {
  contactSetting: {
    name: '',
    email: '',
    alias: undefined,
    virtual: false,
    phone: '',
    phoneCountryCode: '+46',
    phoneNumber: '',
    notifications: {
      email_enabled: true,
      phone_enabled: false,
    },
  },
  delegate: {
    id: undefined,
    principalId: undefined,
    agentId: undefined,
    filters: [],
  },
};

interface DelegatedContactSettingsFormLogicProps {
  children: React.ReactNode | React.ReactNode[];
  formData?: Partial<DelegatedContactSetting>;
  onSubmit?: (
    values: Partial<DelegatedContactSetting>,
    context: UseFormReturn<Partial<DelegatedContactSetting>, unknown, Partial<DelegatedContactSetting>>
  ) => void;
  onSubmitSuccess?: () => void;
  onSubmitFailed?: () => void;
}

const formSchema = yup
  .object<DelegatedContactSetting>({
    contactSetting: yup.object<ExtendedClientContactSetting>({
      name: yup.string().nullable().optional(),
      email: yup.string().email('profile:error.invalidEmail').nullable().optional(),
      alias: yup.string().nullable().required('Namn på kontakt är obligatoriskt'),
      virtual: yup.boolean(),
      phoneCountryCode: yup.string().optional(),
      phoneNumber: yup
        .string()
        .test('mobileNumber', 'profile:error.invalidPhone', (value) => isValidMobileNumber(value))
        .optional(),
      phone: yup.string().nullable().optional(),
    }),
    delegate: yup
      .object<ClientDelegate>({
        id: yup.string().nullable().optional(),
        principalId: yup.string().nullable().optional(),
        agentId: yup.string().nullable().optional(),
        filters: yup
          .array()
          .of(
            yup
              .object<Filter>({
                id: yup.string().nullable().optional(),
                alias: yup.string().nullable().required(),
                channel: yup.string().nullable().optional(),
                rules: yup
                  .array()
                  .of(
                    yup.object<Rule>({
                      attributeName: yup.string().required(),
                      operator: yup.string().oneOf(['EQUALS', 'NOT_EQUALS']).required(),
                      attributeValue: yup.string().required(),
                    })
                  )
                  .required(),
              })
              .required()
          )
          .optional(),
      })
      .optional(),
  })
  .required();

export default function DelegatedContactSettingsFormLogic({
  children,
  formData = defaultDelegatedContactSettingsForm,
  onSubmit,
  onSubmitSuccess = () => {},
  onSubmitFailed = () => {},
}: Readonly<DelegatedContactSettingsFormLogicProps>) {
  const snackBar = useSnackbar();
  const { t } = useTranslation('common');

  const postContactSettingMutation = useApi<ExtendedClientContactSetting>({
    url: '/contactsettings',
    method: 'post',
  });
  const patchContactSettingMutation = useApi<ExtendedClientContactSetting>({
    url: `/contactsettings`,
    method: 'patch',
  });

  const postDelegateMutation = useApi<ClientDelegate>({
    url: '/delegates',
    method: 'post',
  });

  const patchDelegateMutation = useApi<ClientDelegate>({
    url: '/delegates',
    method: 'patch',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = useForm<Partial<DelegatedContactSetting>, any, Partial<DelegatedContactSetting>>({
    resolver: yupResolver(formSchema),
    defaultValues: useMemo(() => formData, [formData]),
    mode: 'onChange',
  });
  const queryClient = useApiService((s) => s.queryClient);

  const isContactSettingPatch = useCallback(() => {
    return typeof formData?.contactSetting?.id === 'string';
  }, [formData]);

  const isDelegatePatch = useCallback(() => {
    return typeof formData?.delegate?.id === 'string';
  }, [formData]);

  const { handleSubmit, reset } = context;

  useEffect(() => {
    const newFormData = { ...formData };
    if (JSON.stringify(newFormData) !== JSON.stringify(context.formState.defaultValues)) {
      reset(newFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, reset]);

  const saveContactSetting: (
    values: Partial<DelegatedContactSetting>
  ) => Promise<Partial<ExtendedClientContactSetting> & { error?: DefaultError }> = async (values) => {
    let contactSettingResult: Partial<ExtendedClientContactSetting> & { error?: DefaultError } = { error: undefined };
    const contactSettingApiCall = isContactSettingPatch()
      ? patchContactSettingMutation.mutateAsync
      : postContactSettingMutation.mutateAsync;
    const contactSettingData: Partial<ExtendedClientContactSetting> = _.merge(formData.contactSetting, {
      id: formData?.contactSetting?.id,
      createdById: isContactSettingPatch() ? undefined : values?.contactSetting?.createdById,
      alias: values.contactSetting?.alias,
      phone: formatPhoneNumber(
        values.contactSetting?.phoneCountryCode || DEFAULT_PHONE_COUNTRY_CODE,
        values.contactSetting?.phoneNumber ?? ''
      ),
      virtual: values.contactSetting?.virtual,
    });
    contactSettingResult = await contactSettingApiCall(contactSettingData).catch((error) => {
      return { error: error as DefaultError };
    });
    return contactSettingResult;
  };

  const saveDelegate: (
    contactSettingResult: Partial<ExtendedClientContactSetting> & { error?: DefaultError },
    values: Partial<DelegatedContactSetting>
  ) => Promise<Partial<ExtendedClientContactSetting> & { error?: DefaultError }> = async (
    contactSettingResult,
    values
  ) => {
    let delegateResult: ClientDelegate & { error?: DefaultError } = { error: undefined };
    const delegateApiCall = isDelegatePatch() ? patchDelegateMutation.mutateAsync : postDelegateMutation.mutateAsync;
    const delegateData: Partial<ClientDelegate> = {
      agentId: isContactSettingPatch() ? values.delegate?.agentId : (contactSettingResult.id ?? undefined),
      principalId: isContactSettingPatch()
        ? values.delegate?.principalId
        : (values?.contactSetting?.createdById ?? undefined),
      id: values?.delegate?.id,
      filters: values.delegate?.filters,
    };
    delegateResult = await delegateApiCall(delegateData).catch((error) => {
      return { error: error as DefaultError };
    });
    return delegateResult;
  };

  const _onSubmit = async (values: Partial<DelegatedContactSetting>) => {
    if (onSubmit) {
      onSubmit(values, context);
    } else {
      const contactSettingResult = await saveContactSetting(values);

      let delegateResult: ClientDelegate & { error?: DefaultError } = { error: undefined };
      if (!contactSettingResult.error) {
        delegateResult = await saveDelegate(contactSettingResult, values);
      }

      if (!contactSettingResult.error && !delegateResult.error) {
        reset({
          contactSetting: contactSettingResult,
          delegate: delegateResult,
        });
        queryClient.invalidateQueries({
          queryKey: ['contactsettings'],
        });
        queryClient.invalidateQueries({
          queryKey: ['delegates'],
        });
        snackBar({
          message: t('profile:success.save'),
          status: 'success',
        });
        onSubmitSuccess();
      } else {
        snackBar(
          (delegateResult.error as AxiosError).status === 471
            ? {
                message: t('profile:error.requiredOption'),
                status: 'warning',
              }
            : {
                message: t('profile:error.save'),
                status: 'error',
              }
        );
        onSubmitFailed();
      }
    }
  };

  return (
    <FormProvider {...context}>
      <form onSubmit={handleSubmit(_onSubmit)}>{children}</form>
    </FormProvider>
  );
}
