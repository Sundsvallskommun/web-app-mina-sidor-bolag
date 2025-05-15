import { TableWrapper } from '@components/table-wrapper/table-wrapper.component';
import { useThemeQueries } from '@sk-web-gui/react';
import { ReactNode, useRef } from 'react';
import { InvoicesTable } from './invoices-table.component';
import { InvoicesCardList } from './invoices-card-list.component';

export const InvoicesList: React.FC<{
  heading: React.ReactNode;
  pageSize: number;
  facilityIds?: string[];
  emptyComponent?: ReactNode;
  onlyPending?: boolean;
}> = ({heading, pageSize, facilityIds, emptyComponent, onlyPending}) => {
  const ref = useRef<null | HTMLDivElement>(null);
  const { isMinDesktop } = useThemeQueries();

  return (
    <div ref={ref}>
      <TableWrapper header={heading}>
        { isMinDesktop ? (
          <InvoicesTable {...{pageSize, facilityIds, emptyComponent, onlyPending}} />
        ) : (  
          <InvoicesCardList {...{pageSize, facilityIds, emptyComponent, onlyPending}} />
        )}
      </TableWrapper>
    </div>
  );
};
