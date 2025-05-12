import { ManualTable, ManualTableColumn } from "@components/manual-table/manual-table.component";
import { IInvoice, InvoicesData } from "@interfaces/invoice";
import { Label, Spinner } from "@sk-web-gui/react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { GetPdfButton } from "./get-pdf-button.component";
import { InvoicesResponse, InvoiceStatus } from "@data-contracts/invoices/data-contracts";
import { emptyInvoicesList, invoicesHandler } from "@services/invoice-service";
import { useApi } from "@services/api-service";
import { User } from "@interfaces/user";

interface InvoiceTableContentProps {
    pageSize: number;
    facilityIds?: string[];
    statusFilter?: InvoiceStatus | InvoiceStatus[];
    emptyComponent?: ReactNode;
}

export const InvoicesTable = ({pageSize, facilityIds, statusFilter, emptyComponent}: InvoiceTableContentProps) => {
    const [pdfIsLoading, setPdfIsLoading] = useState<{ [key: string]: boolean }>();
    const [activePage, setActivePage] = useState(1);
    const [rows, setRows] = useState<IInvoice[]>([]);
    const totalCount = useRef<number>(0);

    const searchParams = new URLSearchParams({});
    searchParams.append('limit', pageSize.toString());
    searchParams.append('page', activePage.toString());
    if (facilityIds?.length)
        searchParams.append('facilityId', facilityIds.toString());
    if (statusFilter)
        searchParams.append('invoiceStatus', statusFilter.toString());

    const {
        data= emptyInvoicesList,
        isFetched,
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

    const {
        data: userData,
    } = useApi<User>({ url: '/me', method: 'get' });

    useEffect(() => {
        setActivePage(1);
        refetch();
    }, [refetch, setActivePage, facilityIds, statusFilter]);

    useEffect(() => {
        refetch();
    }, [refetch, activePage]);

    useEffect(() => {
        if (!isFetched)
            return;

        totalCount.current = data.totalCount;
        setRows(data.invoices);
    }, [setRows, isFetched, data]);

    const getOrganizationName = useMemo(() => (organizationNumber: string): string => {
        return userData?.relations.find(relation => relation.organizationNumber === organizationNumber)?.organizationName ?? 'Okänd';
    }, [userData]);

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
    ], [pdfIsLoading, setPdfIsLoading, getOrganizationName]);

    if (isFetched && !rows.length)
        return emptyComponent
            ? emptyComponent
            : (
                <p className="w-full p-[1.6rem]">
                    Inga fakturor
                </p>    
            );

    if (!isFetched && !rows.length)
        return (
            <div className="w-full flex justify-center p-[1.6rem]">
                <Spinner aria-label="Hämtar fakturor" />
            </div>
        );

    const pageCount = Math.ceil(totalCount.current / pageSize);

    return (
        <ManualTable
            {...{columns, rows, pageCount, activePage}}
            onPageChange={(page) => setActivePage(page)}
        />
    );
};