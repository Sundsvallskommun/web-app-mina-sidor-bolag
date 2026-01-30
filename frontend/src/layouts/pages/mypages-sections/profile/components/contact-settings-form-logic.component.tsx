import { yupResolver } from '@hookform/resolvers/yup';
import { useApi, useApiService } from '@services/api-service';
import { useSnackbar } from '@sk-web-gui/react';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FormProvider, SubmitHandler, UseFormReturn, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { formatPhoneNumber } from '@utils/format-phone-number';
import { ExtendedClientContactSetting } from '@interfaces/contactsettings';

const defaultContactSettingsForm: Partial<ExtendedClientContactSetting> = {
  name: undefined,
  email: undefined,
  alias: undefined,
  virtual: false,
  phone: undefined,
  notifications: {
    email_enabled: false,
    phone_enabled: false,
  },
  address: {
    street: '',
    postcode: '',
    city: '',
  },
  decicionsAndDocuments: {
    digitalInbox: true,
    myPages: true,
    snailmail: false,
  },
};

interface ContactSettingsFormLogicProps {
  children: React.ReactNode | React.ReactNode[];
  formData?: Partial<ExtendedClientContactSetting>;
  onSubmit?: (
    values: Partial<ExtendedClientContactSetting>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: UseFormReturn<Partial<ExtendedClientContactSetting>, any, Partial<ExtendedClientContactSetting>>
  ) => void;
  onSubmitSuccess?: () => void;
  onSubmitFailed?: () => void;
}

const phoneRegExp = /^$|^[0-9\s-]{6,19}$/;

const formSchema = yup
  .object<Partial<ExtendedClientContactSetting>>({
    name: yup.string().nullable().optional(),
    email: yup.string().email('E-postadress har fel format').nullable().optional(),
    alias: yup.string().nullable().optional(),
    virtual: yup.boolean().optional(),
    phoneCountryCode: yup.string().optional(),
    phoneNumber: yup.string().matches(phoneRegExp, 'Fyll i ett giltigt mobilnummer').optional(),
    phone: yup.string().nullable().optional(),
    notifications: yup
      .object({
        email_disabled: yup.boolean(),
        phone_disabled: yup.boolean(),
      })
      .nullable()
      .optional(),
    address: yup
      .object({
        street: yup.string(),
        postcode: yup.string(),
        city: yup.string(),
      })
      .nullable()
      .optional(),
    decicionsAndDocuments: yup
      .object({
        digitalInbox: yup.boolean(),
        myPages: yup.boolean(),
        snailmail: yup.boolean(),
      })
      .nullable()
      .optional(),
  })
  .required();

export default function ContactSettingsFormLogic({
  children,
  formData = defaultContactSettingsForm,
  onSubmit,
  onSubmitSuccess,
  onSubmitFailed,
}: ContactSettingsFormLogicProps) {
  const snackBar = useSnackbar();
  const postMutation = useApi<ExtendedClientContactSetting>({
    url: '/contactsettings',
    method: 'post',
  });
  const patchMutation = useApi<ExtendedClientContactSetting>({
    url: `/contactsettings`,
    method: 'patch',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = useForm<Partial<ExtendedClientContactSetting>, any, Partial<ExtendedClientContactSetting>>({
    resolver: yupResolver(formSchema),
    defaultValues: useMemo(() => formData, [formData]),
    mode: 'onChange',
  });
  const queryClient = useApiService((s) => s.queryClient);

  const isPatch = useCallback(() => {
    return typeof formData?.id === 'string';
  }, [formData]);

  const { handleSubmit, reset } = context;

  useEffect(() => {
    const newFormData = { ...formData };
    if (JSON.stringify(newFormData) !== JSON.stringify(context.formState.defaultValues)) {
      reset(newFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, reset]);

  const _onSubmit: SubmitHandler<Partial<ExtendedClientContactSetting>> = async (data) => {
    if (onSubmit && data) {
      onSubmit(data, context);
    } else {
      const apiCall = isPatch() ? await patchMutation.mutateAsync : await postMutation.mutateAsync;
      const _data: Partial<ExtendedClientContactSetting> = _.merge(formData, {
        id: formData?.id,
        alias: data.alias,
        email: data.email,
        phone: context.formState?.touchedFields?.phoneNumber
          ? formatPhoneNumber(data.phoneCountryCode ?? '', data.phoneNumber ?? '')
          : data.phone,
        notifications: {
          email_enabled: data.notifications?.email_enabled,
          phone_enabled: data.notifications?.phone_enabled,
        },
        decicionsAndDocuments: {
          digitalInbox: data.decicionsAndDocuments?.digitalInbox,
          myPages: data.decicionsAndDocuments?.myPages,
          snailmail: data.decicionsAndDocuments?.snailmail,
        },
      });

      const res = await apiCall(_data);
      if (!res.error) {
        reset(res);
        queryClient.invalidateQueries({
          queryKey: ['contactsettings'],
        });
        queryClient.invalidateQueries({
          queryKey: ['delegates'],
        });
        snackBar({
          message: 'Uppgifterna sparades.',
          status: 'success',
        });
        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        snackBar({
          message: 'Det gick inte att spara uppgifterna.',
          status: 'error',
        });
        if (onSubmitFailed) onSubmitFailed();
      }
    }
  };

  return (
    <FormProvider {...context}>
      <form onSubmit={handleSubmit(_onSubmit)}>{children}</form>
    </FormProvider>
  );
}
