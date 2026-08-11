'use client';

import { CustomerInvoicesResponse } from '@data-contracts/backend/data-contracts';
import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import { Spinner } from '@sk-web-gui/react';
import { TodoListItem } from './todo-list-item.component';
import { useTranslation } from 'react-i18next';
import { useGetCustomerId } from '@services/consent-service';

export const Todos = () => {
  const { t } = useTranslation('overview');
  const { data: userData, isFetching: userDataIsFetching } = useApi<User>({
    url: '/me',
    method: 'get',
    queryKey: ['user'],
  });
  const facilityIds = userData?.facilities?.map((f) => f.facilityId ?? '') ?? [];
  const searchParams = new URLSearchParams({});
  searchParams.append('limit', `${1}`);
  searchParams.append('page', `${1}`);
  if (facilityIds?.length) {
    searchParams.append('facilityId', facilityIds.toString());
  }

  const { data: invoices, isFetching: invoicesIsFetching } = useApi<CustomerInvoicesResponse>({
    queryKey: ['/invoices/pending', searchParams.toString()],
    url: `/invoices/pending?${searchParams.toString()}`,
    method: 'get',
  });

  const { data: customerIds, isFetched: customerIdsFetched } = useGetCustomerId(userData);

  const { data: hasNewConsents } = useApi({
    url: '/bfus/consents/new',
    queryKey: ['new-consents'],
    method: 'get',
    axiosParameters: {
      params: {
        customerIds: customerIds?.toString(),
      },
    },
    queryOptions: {
      enabled: customerIdsFetched && customerIds && customerIds?.length > 0,
    },
  });

  return (
    <section data-cy="todo-invoices-item">
      <h1>{t('overview:todo.title')}</h1>

      {userDataIsFetching || invoicesIsFetching ? (
        <div className="w-full flex justify-center p-md">
          <Spinner aria-label={t('overview:todo.fetching')} />
        </div>
      ) : invoices?.invoices?.length || hasNewConsents ? (
        <div className="w-full justify-stretch gap-24">
          {invoices?.invoices?.length ? (
            <TodoListItem
              type="invoices"
              title={t('overview:todo.invoice.description')}
              subTitle={t('overview:todo.invoice.currentInvoices', { count: invoices._meta?.totalRecords })}
              linkPath="fakturor"
              linkText={t('overview:todo.invoice.showInvoices')}
            />
          ) : null}

          {hasNewConsents ? (
            <TodoListItem
              type="consent"
              title={t('overview:todo.consent.description')}
              subTitle={t('overview:todo.consent.current')}
              linkPath="medgivanden"
              linkText={t('overview:todo.consent.show')}
            />
          ) : null}
        </div>
      ) : (
        <p>{t('overview:todo.noTodos')}</p>
      )}
    </section>
  );
};
