'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@sk-web-gui/react';
import CurrentAndClosedConsents from './current-and-closed-consents/current-and-closed-consents';
import { consentQueryKeys, consentHandler, useGetCustomerId } from '@services/consent-service';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { NewConsents } from '@layouts/pages/mypages-sections/consent/new-consents/new-consent.component';

export default function Consent() {
  const { t } = useTranslation('consent');

  const { data: userData, isLoading: userLoading } = useApi<User>({
    url: '/me',
    method: 'get',
    queryKey: ['user'],
  });

  const {
    data: customerIds,
    isLoading: customerLoading,
    isError: noCustomerIds,
    isRefetching,
  } = useGetCustomerId(userData);

  const { data: consents, isLoading: consentsLoading } = useApi({
    url: '/bfus/consents',
    queryKey: [consentQueryKeys.consents, customerIds],
    method: 'get',
    axiosParameters: {
      params: {
        customerIds: customerIds?.toString(),
      },
    },
    queryOptions: {
      enabled: !!customerIds?.length,
    },
    dataHandler: consentHandler,
  });

  const isLoading = userLoading || customerLoading || consentsLoading || isRefetching;
  const hasCustomerIds = !!customerIds?.length;
  const hasConsents =
    !!consents && Boolean(Object.keys(consents.new).length || consents.current.length || consents.closed.length);

  return (
    <div>
      <h1>{t('consent:title')}</h1>
      <p>{t('consent:description')}</p>
      <div className="pt-40">
        {isLoading && (
          <div className="w-full flex justify-center">
            <Spinner />
          </div>
        )}
        {((!isLoading && !hasCustomerIds) || noCustomerIds) && (
          <p data-cy="no-customer-id">{t('consent:noCustomerId')}</p>
        )}
        {!isLoading && hasCustomerIds && !hasConsents && <p data-cy="no-data">{t('consent:noData')}</p>}
        {!isLoading && hasCustomerIds && hasConsents && !noCustomerIds && (
          <>
            <NewConsents customerIds={customerIds} consents={consents.new} />
            <CurrentAndClosedConsents customerIds={customerIds} current={consents.current} closed={consents.closed} />
          </>
        )}
      </div>
    </div>
  );
}
