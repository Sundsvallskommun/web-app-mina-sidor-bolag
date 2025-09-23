import { IInvoice, InvoicesData } from '@interfaces/invoice';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { InvoicesResponse } from '@data-contracts/invoices/data-contracts';
import { emptyInvoicesList, invoicesHandler } from '@services/invoice-service';
import { useApi } from '@services/api-service';
import { InvoicesCardEntry } from './invoices-card-entry.component';
import { Button, Spinner } from '@sk-web-gui/react';
import { User } from '@interfaces/user';
import { useAppContext } from '@contexts/app.context';
import { RepresentingMode } from '@interfaces/app';
import { isEqual } from 'lodash';

interface InvoiceTableContentProps {
  pageSize: number;
  facilityIds?: string[];
  emptyComponent?: ReactNode;
  onlyPending?: boolean;
}

export const InvoicesCardList = ({ pageSize, facilityIds, emptyComponent, onlyPending }: InvoiceTableContentProps) => {
  const { representingMode, representingName } = useAppContext();
  const [activePage, setActivePage] = useState<number>(1);
  const [rows, setRows] = useState<IInvoice[]>([]);
  const previousRows = useRef<IInvoice[]>([]);
  const totalCount = useRef<number>(0);

  const previousActivePage = useRef<number>(-1);
  const previousFacilityIds = useRef<string[] | undefined>(undefined);
  const previousRepresentingMode = useRef<RepresentingMode | undefined>(undefined);

  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });

  const searchParams = new URLSearchParams({});
  searchParams.append('limit', pageSize.toString());
  searchParams.append('page', activePage.toString());
  if (facilityIds?.length) searchParams.append('facilityId', facilityIds.toString());

  if (userData?.facilities?.length) {
    searchParams.append('facilityId', userData.facilities?.map((f) => f.facilityId).toString());
  }

  const paginationChanged = activePage !== previousActivePage.current;
  const facilityIdsChanged = !isEqual(facilityIds, previousFacilityIds.current);
  const representingModeChanged = representingMode !== previousRepresentingMode.current;

  const base = onlyPending ? '/invoices/pending' : '/invoices';
  const { data = emptyInvoicesList, isFetched } = useApi<InvoicesResponse, Error, InvoicesData>({
    queryKey: [base, searchParams.toString()],
    url: `${base}?${searchParams.toString()}`,
    method: 'get',
    queryOptions: {
      enabled: paginationChanged || facilityIdsChanged,
    },
    dataHandler: invoicesHandler,
  });

  useEffect(() => {
    previousActivePage.current = -1;
    previousRows.current = [];
    setActivePage(1);
    setRows([]);
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
          userData?.relations.find((relation) => relation.organizationNumber === organizationNumber)
            ?.organizationName ?? 'Okänd'
        );
      },
    [userData]
  );

  if ((!isFetched && !rows.length) || representingModeChanged)
    return (
      <div className="w-full flex justify-center p-md">
        <Spinner aria-label="Hämtar fakturor" />
      </div>
    );

  if (isFetched && !rows.length) return emptyComponent ? emptyComponent : <p>Inga fakturor</p>;

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
      <span className="text-small text-center text-secondary mt-lg">{`Visar ${rows.length} av ${totalCount.current}`}</span>
      {canFetch ? (
        <Button
          className="m-auto mt-[1.2rem]"
          variant="secondary"
          size="lg"
          onClick={() => setActivePage(activePage + 1)}
          loading={!isFetched}
        >
          Visa fler
        </Button>
      ) : undefined}
    </div>
  );
};
