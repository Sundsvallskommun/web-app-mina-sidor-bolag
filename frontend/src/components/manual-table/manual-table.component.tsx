import { Pagination, Table } from "@sk-web-gui/react";
import { ReactNode } from "react";

export interface ManualTableColumn {
  label: string;
  sticky?: boolean;
  property: string;
  screenReaderOnly?: boolean;
  className?: string;
  renderColumn?: (value: string | number, item) => ReactNode;
}

interface ManualTableProps {
    className: string;
    rows: [];
    columns: ManualTableColumn[];
    pageCount: number;
    activePage: number;
    onPageChange?: (page: number) => void;
}

export const ManualTable = ({ columns, rows, pageCount, activePage, onPageChange, ...rest }: ManualTableProps) => {

    const defaultColumnRender = (value) => <div className="text-left">{`${value}`}</div>;

    return (
        <Table {...rest} background wrappingBorder>
            <Table.Header>
                { columns.map(({label, sticky, className, screenReaderOnly}, headerIndex) => {
                    return (
                    <Table.HeaderColumn key={`header-${headerIndex}`} scope="row" sticky={sticky} className={className}>
                        <span className='sk-table-sortbutton' data-sronly={screenReaderOnly}>
                        { label }
                        </span>
                    </Table.HeaderColumn>
                    );
                })}
            </Table.Header>
            <Table.Body>
                { rows.map((invoice, rowIndex) => {
                    return (
                    <Table.Row key={`row${rowIndex}`}>
                        { columns.map(({sticky, property, className, renderColumn}, colIndex) => {
                            const propertyKeys = property.split('.');
                            let value = invoice;
                            for (const propertyKey of propertyKeys) {
                                value = value[propertyKey];
                            }
                            const render = renderColumn ?? defaultColumnRender;

                            return (
                            <Table.Column key={`col${colIndex}`} scope="row" sticky={sticky} className={className}>
                                { render(value, invoice) }
                            </Table.Column>
                            );
                        })}
                    </Table.Row>
                    );
                })}
            </Table.Body>
            <Table.Footer>
                <div className="sk-table-bottom-section-spacer"></div>
                <div className="sk-table-paginationwrapper">
                    { pageCount > 1 ? 
                    ( <Pagination className="sk-table-pagination" pagesBefore={2} pagesAfter={2} pages={pageCount} activePage={activePage} changePage={(page) => onPageChange?.(page)} fitContainer/>
                    ): undefined
                }
                </div>
                <div className="sk-table-bottom-section-spacer"></div>
            </Table.Footer>
        </Table>
    );
};