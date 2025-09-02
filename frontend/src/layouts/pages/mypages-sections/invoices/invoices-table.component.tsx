import { ManualTable, ManualTableColumn } from '@components/manual-table/manual-table.component';
import { IInvoice, InvoicesData } from '@interfaces/invoice';
import { Label, Spinner } from '@sk-web-gui/react';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { GetPdfButton } from './get-pdf-button.component';
import { InvoicesResponse } from '@data-contracts/invoices/data-contracts';
import { emptyInvoicesList, invoicesHandler } from '@services/invoice-service';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { useAppContext } from '@contexts/app.context';
import { isEqual } from 'lodash';
import { RepresentingMode } from '@interfaces/app';

interface InvoiceTableContentProps {
  pageSize: number;
  facilityIds?: string[];
  emptyComponent?: ReactNode;
  onlyPending?: boolean;
}

export const InvoicesTable = ({ pageSize, facilityIds, emptyComponent, onlyPending }: InvoiceTableContentProps) => {
  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const { representingMode, representingName } = useAppContext();
  const [pdfIsLoading, setPdfIsLoading] = useState<{ [key: string]: boolean }>();
  const [activePage, setActivePage] = useState(1);
  const [rows, setRows] = useState<IInvoice[]>([]);
  const totalCount = useRef<number>(0);

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
  }, [setActivePage, setRows, facilityIds, representingName]);

  useEffect(() => {
    if (!isFetched) return;

    previousActivePage.current = activePage;
    previousFacilityIds.current = facilityIds;
    previousRepresentingMode.current = representingMode;
    totalCount.current = data.totalCount;
    setRows(data.invoices);
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

  const columns: ManualTableColumn[] = useMemo(
    () => [
      {
        label: 'Leverantör',
        sticky: true,
        property: 'invoiceDescription',
        className: 'max-w-[160px]',
        renderColumn: (value, item) => (
          <div className="text-left text-small">
            <span className="font-bold">{getOrganizationName(item.organizationNumber)}</span>
            <br />
            <span>{value}</span>
          </div>
        ),
      },
      {
        label: 'Status',
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
        label: 'Fakturadatum',
        property: 'invoiceDate',
        className: 'max-w-[120px]',
      },
      {
        label: 'Förfallodatum',
        property: 'dueDate',
        className: 'max-w-[120px]',
      },
      {
        label: 'Belopp',
        sticky: false,
        property: 'totalAmount',
        className: 'max-w-[100px]',
        screenReaderOnly: false,
        renderColumn: (value) => <div className="text-left">{`${value} kr`}</div>,
      },
      {
        label: 'Fakturanummer',
        property: 'ocrNumber',
        className: 'max-w-[146px]',
      },
      {
        label: 'Adress',
        property: 'invoiceAddress.street',
        className: 'max-w-[146px]',
      },
      {
        label: 'Hämta faktura',
        property: 'dueDate',
        className: 'max-w-[146px]',
        screenReaderOnly: true,
        renderColumn: (value, item: IInvoice) => (
          <div className="text-left">
            <GetPdfButton isLoading={pdfIsLoading} setIsLoading={setPdfIsLoading} item={item} />
          </div>
        ),
      },
    ],
    [pdfIsLoading, setPdfIsLoading, getOrganizationName]
  );

  if ((!isFetched && !rows.length) || representingModeChanged)
    return (
      <div className="w-full flex justify-center p-md">
        <Spinner aria-label="Hämtar fakturor" />
      </div>
    );

  if (isFetched && !rows.length) return emptyComponent ? emptyComponent : <p>Inga fakturor</p>;

  const pageCount = Math.ceil(totalCount.current / pageSize);

  return <ManualTable {...{ columns, rows, pageCount, activePage }} onPageChange={(page) => setActivePage(page)} />;
};
