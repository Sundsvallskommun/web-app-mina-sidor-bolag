'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormErrorMessage,
  FormLabel,
  List,
  RadioButton,
  SearchField,
  Select,
  Spinner,
  Table,
  useSnackbar,
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
    toImpersonateName: yup.string().required(),
    toImpersonatePartyId: yup.string().required(),
    accessReason: yup.string().min(1).required(),
  })
  .required();

export interface ImpersonateFormData {
  searchPersonNumber: string;
  toImpersonatePersonNumber: string;
  toImpersonateName: string;
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
  const toastMessage = useSnackbar();

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

  const { mutateAsync: impersonateUser, isPending: impersonationPending } = useApi({
    url: '/impersonate-user',
    method: 'post',
    queryKey: ['impersonate-user'],
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['user-engagements'], exact: false });
    };
  }, []);

  const userEngagementsLoaded = Boolean(userEngagements?.userPersonNumber && isSuccess);
  const noUserEngagements = !userEngagements?.userPartyId && isSuccess;

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

  const lastSearchedRef = useRef<string>('');

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name !== 'searchPersonNumber') return;
      const pn = value.searchPersonNumber ?? '';
      if (pn.length >= 12 && pn !== lastSearchedRef.current) {
        lastSearchedRef.current = pn;
        onSearchHandler();
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const handleSelectRepresenting = () => {
    if (!userEngagements) return;
    setValue('toImpersonateName', userEngagements.userName);
    setValue('toImpersonatePersonNumber', userEngagements.userPersonNumber);
    setValue('toImpersonatePartyId', userEngagements.userPartyId);
  };

  const _onSubmit = async (data: ImpersonateFormData) => {
    await impersonateUser(data)
      .then(() => {
        globalThis.location.assign('/privat/oversikt');
      })
      .catch(() => {
        toastMessage({
          message: t('impersonation:error.impersonation'),
          status: 'error',
        });
      });
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
                showSearchButton={false}
                placeholder={t('impersonation:search')}
                data-cy="search-user-to-impersonate"
              />
            )}
          />

          {(errors.searchPersonNumber || noUserEngagements) && (
            <FormErrorMessage className="mt-8">{t('impersonation:error.personNumber')}</FormErrorMessage>
          )}

          {isPending ? <Spinner className="mx-auto my-16" /> : null}

          {userEngagementsLoaded && userEngagements ? (
            <>
              <Table className="border-1 border-divider my-16" background>
                <Table.Header className="bg-background-content border-b-1 border-primary-darkest">
                  <Table.HeaderColumn />
                  <Table.HeaderColumn>{t('impersonation:tableHeader.name')}</Table.HeaderColumn>
                  <Table.HeaderColumn>{t('impersonation:tableHeader.representingNumber')}</Table.HeaderColumn>
                </Table.Header>

                <Table.Body>
                  <Table.Row key={userEngagements.userPartyId}>
                    <Table.Column>
                      <RadioButton
                        {...register('toImpersonatePersonNumber')}
                        onClick={() => handleSelectRepresenting()}
                        value={userEngagements.userPersonNumber}
                        data-cy="user-to-impersonate-radio-button"
                      />
                    </Table.Column>
                    <Table.Column className="font-bold">{userEngagements.userName}</Table.Column>
                    <Table.Column>{userEngagements.userPersonNumber}</Table.Column>
                  </Table.Row>
                </Table.Body>
              </Table>

              {userEngagements.canRepresent.length ? (
                <div className="mt-16">
                  <p className="font-bold">
                    {t('impersonation:canRepresent', {
                      name: userEngagements.userName,
                      personNumber: userEngagements.userPersonNumber,
                    })}
                  </p>

                  <List listStyle="bullet">
                    {userEngagements.canRepresent.map((representing) => (
                      <List.Item className="p-0 before:!m-0" key={representing.representingNumber}>
                        <List.Text>
                          {representing.name}, {representing.representingNumber}
                        </List.Text>
                      </List.Item>
                    ))}
                  </List>
                </div>
              ) : null}
            </>
          ) : null}

          <div className="my-32">
            <FormLabel>{t('impersonation:accessReason.title')}</FormLabel>
            <Select {...register('accessReason')} className="w-full" data-cy="access-reason">
              <Select.Option value="">{t('impersonation:accessReason.chooseAlternative')}</Select.Option>
              {accessReasons.map((reason) => (
                <Select.Option key={reason} value={reason}>
                  {reason}
                </Select.Option>
              ))}
            </Select>
            {errors.accessReason && (
              <FormErrorMessage className="mt-8" data-cy="access-reason-error">
                {t('impersonation:error.accessReason')}
              </FormErrorMessage>
            )}
          </div>

          <div className="flex gap-16">
            <BackButton />
            <Button
              type="submit"
              loading={impersonationPending}
              loadingText={t('impersonation:loading')}
              rightIcon={<ArrowRight />}
              data-cy="submit-button"
            >
              {t('impersonation:impersonate')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
