import { TableWrapper } from '@components/table-wrapper/table-wrapper.component';
import { useThemeQueries } from '@sk-web-gui/react';
import { useRef } from 'react';
import { InvoiceStatus } from '@data-contracts/invoices/data-contracts';
import { InvoicesTable } from './invoices-table.component';
import { InvoicesCardList } from './invoices-card-list.component';

export const InvoicesList: React.FC<{
  heading: React.ReactNode;
  pageSize: number;
  facilityIds?: string[];
  statusFilter?: InvoiceStatus | InvoiceStatus[];
}> = ({heading, pageSize, facilityIds, statusFilter}) => {
  const ref = useRef<null | HTMLDivElement>(null);
  const { isMinDesktop } = useThemeQueries();

  return (
    <div ref={ref}>
      <TableWrapper header={heading}>
        { isMinDesktop ? (
          <InvoicesTable {...{pageSize, facilityIds, statusFilter}} />
        ) : (  
          <InvoicesCardList {...{pageSize, facilityIds, statusFilter}} />
        )}
      </TableWrapper>
    </div>
  );
};
