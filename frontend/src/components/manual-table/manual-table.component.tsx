import { IInvoice } from '@interfaces/invoice';
import { cx, Pagination, Table } from '@sk-web-gui/react';
import { ReactNode } from 'react';

export interface ManualTableColumn<T = unknown> {
  label: string;
  sticky?: boolean;
  property: string;
  screenReaderOnly?: boolean;
  className?: string;
  renderColumn?: (value: string | number, item: T) => ReactNode;
}

type RowTypeUnion = IInvoice;

interface ManualTableProps {
  className?: string;
  rows: RowTypeUnion[];
  columns: ManualTableColumn<IInvoice>[];
  pageCount: number;
  activePage: number;
  onPageChange?: (page: number) => void;
}

export const ManualTable = ({ columns, rows, pageCount, activePage, onPageChange, ...rest }: ManualTableProps) => {
  const defaultColumnRender = (value: string | number) => <div className="text-left">{`${value}`}</div>;

  return (
    <Table {...rest} background wrappingBorder>
      <Table.Header className="bg-background-content border-divider border-b-1">
        {columns.map(({ label, sticky, className, screenReaderOnly }, headerIndex) => {
          return (
            <Table.HeaderColumn
              key={`header-${headerIndex}`}
              scope="row"
              sticky={sticky}
              className={cx('bg-background-content', className)}
            >
              <span className="sk-table-sortbutton" data-sronly={screenReaderOnly}>
                {label}
              </span>
            </Table.HeaderColumn>
          );
        })}
      </Table.Header>
      <Table.Body>
        {rows.map((invoice, rowIndex) => {
          return (
            <Table.Row key={`row${rowIndex}`}>
              {columns.map(({ sticky, property, className, renderColumn }, colIndex) => {
                const propertyKeys = property.split('.');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let value: any = invoice;
                for (const propertyKey of propertyKeys) {
                  value = value[propertyKey];
                }
                const render = renderColumn ?? defaultColumnRender;

                return (
                  <Table.Column key={`col${colIndex}`} scope="row" sticky={sticky} className={className}>
                    {render(value as unknown as string | number, invoice)}
                  </Table.Column>
                );
              })}
            </Table.Row>
          );
        })}
      </Table.Body>
      {pageCount > 1 ? (
        <Table.Footer>
          <div className="sk-table-bottom-section-spacer"></div>
          <div className="sk-table-paginationwrapper">
            <Pagination
              className="sk-table-pagination"
              pagesBefore={1}
              pagesAfter={1}
              pages={pageCount}
              activePage={activePage}
              changePage={(page) => onPageChange?.(page)}
              showConstantPages
              fitContainer
            />
          </div>
          <div className="sk-table-bottom-section-spacer"></div>
        </Table.Footer>
      ) : undefined}
    </Table>
  );
};
