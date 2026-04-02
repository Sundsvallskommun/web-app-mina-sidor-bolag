'use client';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormErrorMessage,
  FormLabel,
  RadioButton,
  SearchField,
  Select,
  Spinner,
  Table,
} from '@sk-web-gui/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { queryClient, useApi } from '@services/api-service';
import { UserEngagement } from '@interfaces/user';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';

const personNumberFormat = yup.string().required().matches(/^\d+$/).length(12);

export const formSchema = yup
  .object({
    searchPersonNumber: personNumberFormat,
    toImpersonatePersonNumber: personNumberFormat,
    toImpersonateRepresentingNumber: yup.string().required(),
    toImpersonatePartyId: yup.string().required(),
    accessReason: yup.string().min(1).required(),
  })
  .required();

export interface ImpersonateFormData {
  searchPersonNumber: string;
  toImpersonatePersonNumber: string;
  toImpersonateRepresentingNumber: string;
  toImpersonatePartyId: string;
  accessReason: string;
}

function BackButton({ fallbackHref = '/oversikt' }: Readonly<{ fallbackHref?: string }>) {
  const { t } = useTranslation('impersonation');
  const router = useRouter();

  const goBack = () => {
    if (globalThis.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <Button variant="secondary" leftIcon={<ArrowLeft />} onClick={goBack}>
      {t('impersonation:goBack')}
    </Button>
  );
}

export default function ImpersonateUser() {
  const { t } = useTranslation('impersonation');
  const accessReasons = ['I samtal med kunden', 'Inkommit ärende', 'Annan överenskommelse med kunden'];

  const {
    register,
    formState: { errors },
    setValue,
    trigger,
    reset,
    handleSubmit,
    control,
    watch,
  } = useForm<ImpersonateFormData>({
    mode: 'onChange',
    resolver: yupResolver(formSchema),
  });

  const {
    data: userEngagements,
    mutateAsync: fetchEngagements,
    isPending,
    isSuccess,
  } = useApi<UserEngagement>({
    url: '/user-engagements',
    method: 'post',
    queryKey: ['user-engagements'],
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['user-engagements'], exact: false });
    };
  }, []);

  const userEngagementsLoaded = Boolean(userEngagements?.canRepresent?.length && isSuccess);
  const noUserEngagements = userEngagements && !userEngagements.canRepresent?.length && isSuccess;

  const onResetHandler = () => {
    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['user-engagements'] })
      .forEach((query) => query.setData({}));
    reset();
  };

  const onSearchHandler = async () => {
    const valid = await trigger('searchPersonNumber');
    if (valid) await fetchEngagements({ personNumber: watch('searchPersonNumber') });
  };

  const handleSelectRepresenting = (representingNumber: string) => {
    if (!userEngagements) return;
    setValue('toImpersonateRepresentingNumber', representingNumber, { shouldValidate: true });
    setValue('toImpersonatePersonNumber', userEngagements.userPersonNumber);
    setValue('toImpersonatePartyId', userEngagements.userPartyId);
  };

  const _onSubmit = (data: ImpersonateFormData) => {
    console.log('submit', data);
  };

  return (
    <div>
      <h1>{t('impersonation:title')}</h1>
      <div className="bg-background-content rounded-cards shadow-50 mt-40 py-40 lg:px-32 px-20 flex flex-col gap-40">
        <p>{t('impersonation:description')}</p>

        <form onSubmit={handleSubmit(_onSubmit)} className="w-full">
          <FormLabel>{t('impersonation:searchFieldLabel')}</FormLabel>

          <Controller
            name="searchPersonNumber"
            control={control}
            render={({ field }) => (
              <SearchField
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onReset={onResetHandler}
                onSearch={onSearchHandler}
                placeholder={t('impersonation:search')}
              />
            )}
          />

          {(errors.searchPersonNumber || noUserEngagements) && (
            <FormErrorMessage className="text-error flex flex-row items-center justify-start">
              {t('impersonation:error.personNumber')}
            </FormErrorMessage>
          )}

          {isPending ? <Spinner className="mx-auto my-16" /> : null}

          {userEngagementsLoaded ? (
            <Table className="border-1 border-divider my-16" background>
              <Table.Header className="bg-background-content border-b-1 border-primary-darkest">
                <Table.HeaderColumn />
                <Table.HeaderColumn>{t('impersonation:tableHeader.name')}</Table.HeaderColumn>
                <Table.HeaderColumn>{t('impersonation:tableHeader.representingNumber')}</Table.HeaderColumn>
              </Table.Header>

              <Table.Body>
                {userEngagements?.canRepresent?.map((r) => (
                  <Table.Row key={r.representingNumber}>
                    <Table.Column>
                      <RadioButton
                        {...register('toImpersonateRepresentingNumber')}
                        onChange={() => handleSelectRepresenting(r.representingNumber)}
                        value={r.representingNumber}
                      />
                    </Table.Column>
                    <Table.Column className="font-bold">{r.name}</Table.Column>
                    <Table.Column>{r.representingNumber}</Table.Column>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : null}

          {errors.toImpersonateRepresentingNumber && (
            <FormErrorMessage className="text-error flex flex-row items-center justify-start">
              {t('impersonation:error.representingNumber')}
            </FormErrorMessage>
          )}

          <div className="my-32">
            <FormLabel>{t('impersonation:accessReason.title')}</FormLabel>
            <Select {...register('accessReason')} className="w-full">
              <Select.Option value="">{t('impersonation:accessReason.chooseAlternative')}</Select.Option>
              {accessReasons.map((reason) => (
                <Select.Option key={reason} value={reason}>
                  {reason}
                </Select.Option>
              ))}
            </Select>
            {errors.accessReason && (
              <FormErrorMessage className="text-error flex flex-row items-center justify-start mt-8">
                {t('impersonation:error.accessReason')}
              </FormErrorMessage>
            )}
          </div>

          <div className="flex gap-16">
            <BackButton />
            <Button type="submit" rightIcon={<ArrowRight />}>
              {t('impersonation:impersonate')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
