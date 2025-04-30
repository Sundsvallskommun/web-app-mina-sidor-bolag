import { CardList } from '@components/cards/cards.component';
import { TableWrapper } from '@components/table-wrapper/table-wrapper.component';
import { IInvoice, InvoicesData } from '@interfaces/invoice';
import { Label, useThemeQueries } from '@sk-web-gui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GetPdfButton } from './get-pdf-button.component';
import { InvoiceTableCard } from './invoices-table-card.component';
import { ManualTable, ManualTableColumn } from '@components/manual-table/manual-table.component';
import { InvoicesResponse, InvoiceStatus } from '@data-contracts/invoices/data-contracts';
import { useApi } from '@services/api-service';
import { emptyInvoicesList, invoicesHandler } from '@services/invoice-service';

interface InvoiceTableContentProps {
  columns: ManualTableColumn[],
  rows: IInvoice[],
  isFetching: boolean;
  totalCount: number;
  pageSize: number;
  activePage: number;
  onPageChange: (page: number) => void;
}

const InvoiceTableContent = ({columns, rows, isFetching, totalCount, pageSize, activePage, onPageChange}: InvoiceTableContentProps) => {
  const { isMinDesktop } = useThemeQueries();

  if (isFetching && !rows.length)
    return <p>Laddar fakturor</p>;

  if (!isFetching && !rows.length)
    return <p>Inga fakturor</p>;

  const pageCount = Math.ceil(totalCount / pageSize);

  return (
    <div>
      {isMinDesktop ? (
        <ManualTable
          pageCount={pageCount}
          activePage={activePage}            
          columns={columns}
          rows={rows}
          onPageChange={onPageChange}
        />
      ) : (
        <CardList
          data={rows}
          Card={InvoiceTableCard}
          amountDisplayed={9999}
          showAmountString={false}
        />
      )}
    </div>
  );
};

const getOrgName = (orgNumber: string) => {
  switch (orgNumber) {
    case '5564786647':
      return 'Sundsvall Energi';
    case '5565027223':
      return 'Sundsvall Elnät';
    default: 
      return 'Okänt';
  }
};

export const InvoicesTable: React.FC<{
  heading: React.ReactNode;
  pageSize: number;
  facilityIds?: string[];
  statusFilter?: InvoiceStatus;
}> = ({heading, pageSize, facilityIds, statusFilter}) => {
  const [pendingDocuments, setPendingDocuments] = useState<{ [key: string]: boolean }>();
  const [activePage, setActivePage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState<IInvoice[]>([]);
  const ref = useRef<null | HTMLDivElement>(null);

  const searchParams = new URLSearchParams({});
  searchParams.append('limit', pageSize.toString());
  searchParams.append('page', activePage.toString());
  if (facilityIds?.length)
    searchParams.append('facilityId', facilityIds.toString());
  if (statusFilter)
    searchParams.append('invoiceStatus', statusFilter.toString());

  const {
    data= emptyInvoicesList,
    isFetching,
    refetch,
  } = useApi<InvoicesResponse, Error, InvoicesData>({
    queryKey: ['/invoices', searchParams.toString()],
    url: `/invoices?${searchParams.toString()}`,
    method: 'get',
    queryOptions: {
      enabled: false,
    },
    dataHandler: invoicesHandler,
  });

  useEffect(() => {
    if (data.invoices.length) {
      setTotalCount(data.totalCount);
      setRows(data.invoices);
    }
  }, [setRows, setTotalCount, data]);

  useEffect(() => {
    refetch();
  }, [refetch, activePage, facilityIds, statusFilter]);

  const columns: ManualTableColumn[] = useMemo(() => [
    {
      label: 'Leverantör',
      sticky: true,
      property: 'invoiceDescription',
      className: 'max-w-[160px]',
      renderColumn: (value, item) => (
        <div className="text-left text-small">
          <span className="font-bold">{getOrgName(item.organizationNumber)}</span><br/>
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
          <GetPdfButton isLoading={pendingDocuments} setIsLoading={setPendingDocuments} item={item} />
        </div>
      ),
    },
  ], [getOrgName, pendingDocuments, setPendingDocuments]);

  return (
    <div ref={ref}>
      <TableWrapper header={heading}>
        <InvoiceTableContent
          {...{columns, rows, isFetching, totalCount, pageSize, activePage}}
          onPageChange={(page) => setActivePage(page)}
        />
      </TableWrapper>
    </div>
  );
};
