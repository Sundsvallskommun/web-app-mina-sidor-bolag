import { IInvoice, InvoicesData } from "@interfaces/invoice";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { InvoicesResponse, InvoiceStatus } from "@data-contracts/invoices/data-contracts";
import { emptyInvoicesList, invoicesHandler } from "@services/invoice-service";
import { useApi } from "@services/api-service";
import { InvoicesCardEntry } from "./invoices-card-entry.component";
import { Button, Spinner } from "@sk-web-gui/react";
import { User } from "@interfaces/user";

interface InvoiceTableContentProps {
    pageSize: number;
    facilityIds?: string[];
    statusFilter?: InvoiceStatus | InvoiceStatus[];
    emptyComponent?: ReactNode;
    dueDays?: number;
}

export const InvoicesCardList = ({pageSize, facilityIds, statusFilter, emptyComponent, dueDays}: InvoiceTableContentProps) => {
    const [activePage, setActivePage] = useState<number>(1);
    const [rows, setRows] = useState<IInvoice[]>([]);
    const previousRows = useRef<IInvoice[]>([]);
    const totalCount = useRef<number>(0);

    const searchParams = new URLSearchParams({});
    searchParams.append('limit', pageSize.toString());
    searchParams.append('page', activePage.toString());
    if (facilityIds?.length)
        searchParams.append('facilityId', facilityIds.toString());
    if (statusFilter)
        searchParams.append('invoiceStatus', statusFilter.toString());
    if (dueDays) {
        searchParams.append('dueDateFrom', new Date().toLocaleDateString());
        const aDay = 60 * 60 * 24 * 1000;
        const newTime = new Date().getTime() + aDay * dueDays;
        searchParams.append('dueDateTo', new Date(newTime).toLocaleDateString());
    }

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
        refetch();
    }, [refetch, activePage]);

    useEffect(() => {
        previousRows.current = [];
        setActivePage(1);
        refetch();
    }, [refetch, setActivePage, facilityIds, statusFilter]);

    useEffect(() => {
        if (!isFetched)
            return;

        const totalRows = [...previousRows.current, ...data.invoices];
        previousRows.current = totalRows;
        totalCount.current = data.totalCount;
        setRows(totalRows);
    }, [setRows, isFetched, data]);

    const getOrganizationName = useMemo(() => (organizationNumber: string): string => {
        return userData?.relations.find(relation => relation.organizationNumber === organizationNumber)?.organizationName ?? 'Okänd';
    }, [userData]);

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

    const canFetch = rows.length < totalCount.current;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col gap-[1.6rem]">
                { rows.map((invoice, index) => {
                    return (
                        <InvoicesCardEntry key={index} organizationName={getOrganizationName(invoice.organizationNumber!)} item={invoice}/>
                    );
                })}
            </div>
            <span className="text-base text-center text-secondary mt-[2.4rem]">{`Visar ${rows.length} av ${totalCount.current}`}</span>
            { canFetch ? (
                <Button className="m-auto mt-[1.2rem]" variant="secondary" size="lg" onClick={() => setActivePage(activePage + 1)} loading={!isFetched}>
                    Visa fler
                </Button>
            ): undefined }
        </div>
    );
};