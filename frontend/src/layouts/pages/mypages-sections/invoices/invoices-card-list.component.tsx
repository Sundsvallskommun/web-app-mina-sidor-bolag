import { IInvoice, InvoicesData } from "@interfaces/invoice";
import { useEffect, useRef, useState } from "react";
import { InvoicesResponse, InvoiceStatus } from "@data-contracts/invoices/data-contracts";
import { emptyInvoicesList, invoicesHandler } from "@services/invoice-service";
import { useApi } from "@services/api-service";
import { InvoicesCardEntry } from "./invoices-card-entry.component";
import { Button } from "@sk-web-gui/react";

interface InvoiceTableContentProps {
    pageSize: number;
    facilityIds?: string[],
    statusFilter?: InvoiceStatus,
}

export const InvoicesCardList = ({pageSize, facilityIds, statusFilter}: InvoiceTableContentProps) => {
    const [rows, setRows] = useState<IInvoice[]>([]);
    const [activePage, setActivePage] = useState<number>(1);
    const previousRows = useRef<IInvoice[]>([]);
    const previousFacilityIds = useRef<string[] | undefined>(undefined);
    const previousStatusFilter = useRef<string | undefined>(undefined);
    const fetchedOnce = useRef<boolean>(false);
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

    const loadAppend = () => {
        setActivePage(activePage + 1);
        setTimeout(() => {
            refetch();
        }, 50);
    };

    useEffect(() => {
        if (isFetching)
            return;

        if (data.invoices.length > 0) {
            const ocrNumbers = previousRows.current.map(row => row.ocrNumber);
            const nonDupes = data.invoices.filter(invoice => !ocrNumbers.includes(invoice.ocrNumber));
            const newRows = [...previousRows.current, ...nonDupes];
            previousRows.current = newRows;
            setRows(newRows);
        }
        totalCount.current = data.totalCount;
    }, [setRows, isFetching]);

    useEffect(() => {
        const facilitiesChanged = facilityIds !== previousFacilityIds.current;
        previousFacilityIds.current = facilityIds ? [...facilityIds] : undefined;
        const statusFilterChanged = statusFilter !== previousStatusFilter.current;
        previousStatusFilter.current = statusFilter;

        if (!facilitiesChanged && !statusFilterChanged && fetchedOnce.current)
            return;
        
        if (!fetchedOnce.current)
            fetchedOnce.current = true;

        previousRows.current = [];
        setActivePage(1);
        setTimeout(() => {
            refetch();
        }, 50);
    }, [refetch, setActivePage, facilityIds, statusFilter]);

    const canFetch = rows.length < totalCount.current;

    if (isFetching && !rows.length)
        return <p>Laddar fakturor</p>;

    if (!isFetching && !rows.length)
        return <p>Inga fakturor</p>;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col gap-[1.6rem]">
                { rows.map((invoice, index) => {
                    return (
                        <InvoicesCardEntry key={index} item={invoice}/>
                    );
                })}
            </div>
            <span className="text-base text-center text-secondary mt-[2.4rem]">{`Visar ${rows.length} av ${totalCount.current}`}</span>
            { canFetch ? (
                <Button className="m-auto mt-[1.2rem]" variant="secondary" size="lg" onClick={loadAppend} loading={isFetching}>
                    Ladda mer
                </Button>
            ): undefined }
        </div>
    );
};