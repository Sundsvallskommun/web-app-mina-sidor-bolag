import { ManualTable, ManualTableColumn } from '@components/manual-table/manual-table.component';
import { IInvoice, InvoiceTableProps } from '@interfaces/invoice';
import { Label, Spinner } from '@sk-web-gui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GetPdfButton } from './get-pdf-button.component';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useAppContext } from '@contexts/app.context';
import { isEqual } from 'lodash';
import { RepresentingMode } from '@interfaces/app';
import { useTranslation } from 'react-i18next';

export const InvoicesTable = ({
  data,
  isFetched,
  activePage,
  pageSize,
  setActivePage,
  previousActivePage,
  representingName,
  representingModeChanged,
  facilityIds,
  emptyComponent,
}: InvoiceTableProps) => {
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const [pdfIsLoading, setPdfIsLoading] = useState<{ [key: string]: boolean }>({});
  const [rows, setRows] = useState<IInvoice[]>([]);
  const totalCount = useRef<number>(0);
  const { t } = useTranslation(['common', 'invoice', 'organization']);

  const previousActivePage = useRef<number>(-1);
  const previousRepresentingMode = useRef<RepresentingMode | undefined>(undefined);
  const previousFacilityIds = useRef<string[] | undefined>(undefined);

  const searchParams = new URLSearchParams({});
  searchParams.append('limit', pageSize.toString());
  searchParams.append('page', activePage.toString());
  if (facilityIds?.length) {
    searchParams.append('facilityId', facilityIds.toString());
  }
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
    setActivePage(1);
    setRows([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActivePage, setRows, facilityIds, representingName]);

  useEffect(() => {
    if (!isFetched) return;

    setRows(data.invoices);
    totalCount.current = data.totalCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRows, isFetched, data]);

  const getOrganizationName = useMemo(
    () =>
      (organizationNumber: string): string => {
        return (
          userData?.relations.find((relation) => relation.organizationNumber === organizationNumber)
            ?.organizationName ?? t(`organization:${organizationNumber}.name`, { defaultValue: t('common:unknown') })
        );
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userData]
  );

  const columns: ManualTableColumn<IInvoice>[] = useMemo(
    () => [
      {
        label: t('invoice:contractor'),
        sticky: true,
        property: 'invoiceDescription',
        className: 'max-w-[160px]',
        renderColumn: (value, item) => (
          <div className="text-left text-small">
            <span className="font-bold">
              {!!item.organizationNumber && getOrganizationName(item.organizationNumber)}
            </span>
            <br />
            <span>{value}</span>
          </div>
        ),
      },
      {
        label: t('invoice:status'),
        property: 'invoiceStatus.label',
        className: 'max-w-[140px]',
        renderColumn: (value, item) => (
          <div className="text-left">
            <Label rounded inverted={item.invoiceStatus?.color !== 'neutral'} color={item.invoiceStatus?.color}>
              {value}
            </Label>
          </div>
        ),
      },
      {
        label: t('invoice:date'),
        property: 'invoiceDate',
        className: 'max-w-[120px]',
      },
      {
        label: t('invoice:dueDate'),
        property: 'dueDate',
        className: 'max-w-[120px]',
      },
      {
        label: t('invoice:amount'),
        sticky: false,
        property: 'totalAmount',
        className: 'max-w-[100px]',
        screenReaderOnly: false,
        renderColumn: (value) => <div className="text-left">{`${value} kr`}</div>,
      },
      {
        label: t('invoice:number'),
        property: 'ocrNumber',
        className: 'max-w-[146px]',
      },
      {
        label: t('common:address'),
        property: 'invoiceAddress.street',
        className: 'max-w-[146px]',
        renderColumn: (_value, item) => (
          <div className="text-left text-small">
            <span>{!!item.facilityId && getInvoiceAddress(item.facilityId)}</span>
          </div>
        ),
      },
      {
        label: t('invoice:fetch'),
        property: 'dueDate',
        className: 'max-w-[146px]',
        screenReaderOnly: true,
        renderColumn: (_value, item: IInvoice) => (
          <div className="text-left">
            <GetPdfButton isLoading={pdfIsLoading} setIsLoading={setPdfIsLoading} item={item} />
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pdfIsLoading, setPdfIsLoading, getOrganizationName]
  );

  if ((!isFetched && !rows.length) || representingModeChanged)
    return (
      <div className="w-full flex justify-center p-md">
        <Spinner aria-label={t('invoice:fetching')} />
      </div>
    );

  if (isFetched && !rows.length) return emptyComponent ?? <p>{t('invoice:noData')}</p>;

  const pageCount = Math.ceil(totalCount.current / pageSize);

  return <ManualTable {...{ columns, rows, pageCount, activePage }} onPageChange={(page) => setActivePage(page)} />;
};
