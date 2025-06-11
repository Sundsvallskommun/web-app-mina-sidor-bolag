import { yupResolver } from '@hookform/resolvers/yup';
import { ClientContactSetting, Delegate, DelegatedContactSetting, Filter, Rule } from '@interfaces/contactsettings';
import { useApi, useApiService } from '@services/api-service';
import { useSnackbar } from '@sk-web-gui/react';
import { DefaultError } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import _ from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { FormProvider, UseFormReturn, useForm } from 'react-hook-form';
import * as yup from 'yup';

const defaultDelegatedContactSettingsForm: Partial<DelegatedContactSetting> = {
  contactSetting: {
    name: '', //undefined,
    email: '', //undefined,
    alias: undefined,
    virtual: false,
    phone: '', //undefined,
    notifications: {
      email_disabled: true,
      phone_disabled: false,
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
    context: UseFormReturn<Partial<DelegatedContactSetting>, unknown, undefined>
  ) => void;
  onSubmitSuccess?: () => void;
  onSubmitFailed?: () => void;
}

const phoneRegExp = /^(?:\+46\d{9})?$/;

const formSchema = yup
  .object<DelegatedContactSetting>({
    contactSetting: yup.object<ClientContactSetting>({
      name: yup.string().nullable().optional(),
      email: yup.string().email('E-postadress har fel format').nullable().optional(),
      alias: yup.string().nullable().optional(),
      virtual: yup.boolean(),
      phone: yup.string().matches(phoneRegExp, 'Telefonnummer har fel format').nullable().optional(),
    }),
    delegate: yup
      .object<Delegate>({
        id: yup.string().nullable().optional(),
        principalId: yup.string().nullable().optional(),
        agentId: yup.string().nullable().optional(),
        filters: yup
          .array()
          .of(
            yup
              .object<Filter>({
                id: yup.string().nullable().optional(),
                alias: yup.string().nullable().optional(),
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
  onSubmitSuccess,
  onSubmitFailed,
}: DelegatedContactSettingsFormLogicProps) {
  const snackBar = useSnackbar();
  const postContactSettingMutation = useApi<ClientContactSetting>({
    url: '/contactsettings',
    method: 'post',
  });
  const patchContactSettingMutation = useApi<ClientContactSetting>({
    url: `/contactsettings`,
    method: 'patch',
  });

  const postDelegateMutation = useApi<Delegate>({
    url: '/delegates',
    method: 'post',
  });

  const patchDelegateMutation = useApi<Delegate>({
    url: '/delegates',
    method: 'patch',
  });

  const context = useForm<Partial<DelegatedContactSetting>>({
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

  const delegate = context.watch('delegate');

  useEffect(() => {
    // console.log('update:', delegate);
    // reset({ ...context.getValues(), delegate }); // Ensure the form is updated with the latest delegate values
  }, [delegate]);

  const _onSubmit = async (values: Partial<DelegatedContactSetting>) => {
    console.log('Submitting values:', values);
    if (onSubmit) {
      onSubmit(values, context);
    } else {
      let contactSettingResult: Partial<ClientContactSetting> & { error?: DefaultError } = { error: undefined };
      const contactSettingApiCall = isContactSettingPatch()
        ? patchContactSettingMutation.mutateAsync
        : postContactSettingMutation.mutateAsync;
      const contactSettingData: Partial<ClientContactSetting> = _.merge(formData.contactSetting, {
        id: formData?.contactSetting?.id,
        createdById: isContactSettingPatch() ? undefined : values?.contactSetting?.createdById,
        alias: values.contactSetting?.alias,
        phone: values.contactSetting?.phone,
        virtual: values.contactSetting?.virtual,
      });
      contactSettingResult = await contactSettingApiCall(contactSettingData).catch((error) => {
        return { error: error as DefaultError };
      });

      let delegateResult: Delegate & { error?: DefaultError } = { error: undefined };
      if (!contactSettingResult.error) {
        const delegateApiCall = isDelegatePatch()
          ? patchDelegateMutation.mutateAsync
          : postDelegateMutation.mutateAsync;
        const delegateData: Partial<Delegate> = {
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
          message: 'Uppgifterna sparades.',
          status: 'success',
        });
        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        if ((delegateResult.error as AxiosError).status === 471) {
          snackBar({
            message: 'Minst ett alternativ måste väljas.',
            status: 'warning',
          });
        } else {
          snackBar({
            message: 'Det gick inte att spara uppgifterna.',
            status: 'error',
          });
        }
        if (onSubmitFailed) onSubmitFailed();
      }
    }
  };

  return (
    <FormProvider {...context}>
      {/* <div>DelegatedContactSettingsFormLogic Delegate ID: {context?.getValues()?.delegate?.id}</div>
      {context?.getValues()?.delegate?.filters?.map((filter, index) => (
        <div key={filter.id + '-' + filter.alias + '-' + index}>
          <p>
            <strong>{filter.alias}</strong>
          </p>
          <ul>
            {filter.rules.map((rule, ruleIndex) => (
              <li key={`${rule.attributeName}-${ruleIndex}`}>
                {rule.attributeName} {rule.operator} {rule.attributeValue}
              </li>
            ))}
          </ul>
        </div>
      ))} */}
      {/* <div>{JSON.stringify(context.getValues().delegate)}</div> */}
      <form onSubmit={handleSubmit(_onSubmit)}>{children}</form>
    </FormProvider>
  );
}
