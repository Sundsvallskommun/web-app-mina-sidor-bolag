import { ManualTable, ManualTableColumn } from "@components/manual-table/manual-table.component";
import { IInvoice, InvoicesData } from "@interfaces/invoice";
import { Label } from "@sk-web-gui/react";
import { useEffect, useMemo, useState } from "react";
import { GetPdfButton } from "./get-pdf-button.component";
import { InvoicesResponse, InvoiceStatus } from "@data-contracts/invoices/data-contracts";
import { emptyInvoicesList, invoicesHandler } from "@services/invoice-service";
import { useApi } from "@services/api-service";
import { getOrganizationName } from "@utils/organizations";

interface InvoiceTableContentProps {
    pageSize: number;
    facilityIds?: string[],
    statusFilter?: InvoiceStatus,
}

export const InvoicesTable = ({pageSize, facilityIds, statusFilter}: InvoiceTableContentProps) => {
    const [pdfIsLoading, setPdfIsLoading] = useState<{ [key: string]: boolean }>();
    const [activePage, setActivePage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [rows, setRows] = useState<IInvoice[]>([]);

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
        refetch();
    }, [refetch, activePage, facilityIds, statusFilter]);

    useEffect(() => {
        if (data.invoices.length) {
            setTotalCount(data.totalCount);
            setRows(data.invoices);
        }
    }, [setRows, setTotalCount, data]);

    const columns: ManualTableColumn[] = useMemo(() => [
        {
            label: 'Leverantör',
            sticky: true,
            property: 'invoiceDescription',
            className: 'max-w-[160px]',
            renderColumn: (value, item) => (
                <div className="text-left text-small">
                    <span className="font-bold">{getOrganizationName(item.organizationNumber)}</span><br/>
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
    ], [pdfIsLoading, setPdfIsLoading]);

    if (isFetching && !rows.length)
        return <p>Laddar fakturor</p>;

    if (!isFetching && !rows.length)
        return <p>Inga fakturor</p>;

    const pageCount = Math.ceil(totalCount / pageSize);

    return (
        <ManualTable
            {...{columns, rows, pageCount, activePage}}
            onPageChange={(page) => setActivePage(page)}
        />
    );
};