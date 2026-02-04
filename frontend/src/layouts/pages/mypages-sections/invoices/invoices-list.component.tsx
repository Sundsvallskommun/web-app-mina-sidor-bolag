import { TableWrapper } from '@components/table-wrapper/table-wrapper.component';
import { useThemeQueries } from '@sk-web-gui/react';
import React, { ReactNode, useRef, useState } from 'react';
import { InvoicesTable } from './invoices-table.component';
import { InvoicesCardList } from './invoices-card-list.component';
import { InvoicesData } from '@interfaces/invoice';
import { useApi } from '@services/api-service';
import { User } from '@interfaces/user';
import { isEqual } from 'lodash';
import { emptyInvoicesList, invoicesHandler } from '@services/invoice-service';
import { InvoicesResponse } from '@data-contracts/invoices/data-contracts';
import { RepresentingMode } from '@interfaces/app';
import { useAppContext } from '@contexts/app.context';

export const InvoicesList: React.FC<{
  heading: React.ReactNode;
  pageSize: number;
  facilityIds?: string[];
  emptyComponent?: ReactNode;
  onlyPending?: boolean;
}> = ({ heading, pageSize, facilityIds, emptyComponent, onlyPending }) => {
  const ref = useRef<null | HTMLDivElement>(null);
  const { isMinDesktop } = useThemeQueries();

  const { data: userData } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });

  const { representingMode, representingName } = useAppContext();
  const [activePage, setActivePage] = useState<number>(1);
  const previousActivePage = useRef<number>(-1);
  const previousFacilityIds = useRef<string[] | undefined>(undefined);
  const previousRepresentingMode = useRef<RepresentingMode | undefined>(representingMode);

  const paginationChanged = activePage !== previousActivePage.current;
  const facilityIdsChanged = !isEqual(facilityIds, previousFacilityIds.current);
  const representingModeChanged = representingMode !== previousRepresentingMode.current;

  const searchParams = new URLSearchParams({});
  searchParams.append('limit', pageSize.toString());
  searchParams.append('page', activePage.toString());
  if (facilityIds?.length) {
    searchParams.append('facilityIds', facilityIds.toString());
  } else if (userData?.facilities?.length) {
    searchParams.append('facilityIds', userData.facilities?.map((f) => f.facilityId).toString());
  }

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

  const baseProps = {
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
  };

  const tableProps = {
    ...baseProps,
    pageSize,
    previousRepresentingMode,
  };

  return (
    <div ref={ref}>
      <TableWrapper header={heading}>
        {isMinDesktop ? <InvoicesTable {...tableProps} /> : <InvoicesCardList {...baseProps} />}
      </TableWrapper>
    </div>
  );
};
