import { IInvoice, InvoicesData } from '@interfaces/invoice';
import React, { ReactNode, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useApi } from '@services/api-service';
import { InvoicesCardEntry } from './invoices-card-entry.component';
import { Button, Spinner } from '@sk-web-gui/react';
import { User } from '@interfaces/user';
import { RepresentingMode } from '@interfaces/app';
import { useTranslation } from 'react-i18next';

interface InvoiceTableContentProps {
  data: InvoicesData;
  isFetched: boolean;
  activePage: number;
  setActivePage: React.Dispatch<React.SetStateAction<number>>;
  previousActivePage: RefObject<number>;
  previousFacilityIds: RefObject<string[] | undefined>;
  representingModeChanged: boolean;
  facilityIds?: string[];
  emptyComponent?: ReactNode;
  representingMode: RepresentingMode;
  representingName: string | undefined;
}

export const InvoicesCardList = ({
  data,
  isFetched,
  activePage,
  setActivePage,
  previousActivePage,
  previousFacilityIds,
  representingMode,
  representingName,
  representingModeChanged,
  facilityIds,
  emptyComponent,
}: InvoiceTableContentProps) => {
  const [rows, setRows] = useState<IInvoice[]>([]);
  const previousRows = useRef<IInvoice[]>([]);
  const totalCount = useRef<number>(0);
  const { t } = useTranslation(['common', 'invoice']);

  const previousRepresentingMode = useRef<RepresentingMode | undefined>(undefined);

  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });

  useEffect(() => {
    previousActivePage.current = -1;
    previousRows.current = [];
    setActivePage(1);
    setRows([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActivePage, setRows, facilityIds, representingName]);

  useEffect(() => {
    if (!isFetched) return;

    previousActivePage.current = activePage;
    previousFacilityIds.current = facilityIds;
    previousRepresentingMode.current = representingMode;

    const totalRows = [...previousRows.current, ...data.invoices];
    totalCount.current = data.totalCount;
    previousRows.current = totalRows;
    setRows(totalRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRows, isFetched, data]);

  const getOrganizationName = useMemo(
    () =>
      (organizationNumber: string): string => {
        return (
          userData?.relations.customerRelations?.find((relation) => relation.organizationNumber === organizationNumber)
            ?.organizationName ?? t('common:unknown')
        );
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userData]
  );

  if ((!isFetched && !rows.length) || representingModeChanged)
    return (
      <div className="w-full flex justify-center p-md">
        <Spinner aria-label={t('invoice:fetching')} />
      </div>
    );

  if (isFetched && !rows.length) return emptyComponent ?? <p>{t('invoice:noData')}</p>;

  const canFetch = rows.length < totalCount.current;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-md">
        {rows.map((invoice, index) => {
          return (
            <InvoicesCardEntry
              key={index}
              organizationName={getOrganizationName(invoice.organizationNumber!)}
              item={invoice}
            />
          );
        })}
      </div>
      <span className="text-small text-center text-secondary mt-lg">
        {t('invoice:showing', { count: rows.length, total: totalCount.current })}
      </span>
      {canFetch ? (
        <Button
          className="m-auto mt-[1.2rem]"
          variant="secondary"
          size="lg"
          onClick={() => setActivePage(activePage + 1)}
          loading={!isFetched}
        >
          {t('invoice:showMore')}
        </Button>
      ) : undefined}
    </div>
  );
};
