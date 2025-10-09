'use client';

import { InvoicesResponse } from '@data-contracts/invoices/data-contracts';
import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import { Spinner } from '@sk-web-gui/react';
import { TodoListItem } from './todo-list-item.component';
import { useTranslation } from 'react-i18next';

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

  const { data: invoices, isFetching: invoicesIsFetching } = useApi<InvoicesResponse>({
    queryKey: ['/invoices/pending', searchParams.toString()],
    url: `/invoices/pending?${searchParams.toString()}`,
    method: 'get',
  });

  return (
    <section data-cy="todo-invoices-item">
      <h1>{t('overview:todo.title')}</h1>
      {userDataIsFetching || invoicesIsFetching ? (
        <div className="w-full flex justify-center p-md">
          <Spinner aria-label={t('overview:todo.fetching')} />
        </div>
      ) : invoices?.invoices?.length ? (
        <div className="w-full flex flex-column justify-stretch gap-lg">
          <TodoListItem
            type="invoices"
            title={t('overview:todo.description')}
            subTitle={t('overview:todo.currentInvoices', { count: invoices._meta?.totalRecords })}
            linkPath="fakturor"
            linkText={t('overview:todo.showInvoices')}
          />
        </div>
      ) : (
        <p>{t('overview:todo.noTodos')}</p>
      )}
    </section>
  );
};
