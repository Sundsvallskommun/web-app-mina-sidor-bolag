'use client';

import { InvoicesResponse } from "@data-contracts/invoices/data-contracts";
import { useApi } from "@services/api-service";
import { Spinner } from "@sk-web-gui/react";
import { TodoListItem } from "./todo-list-item.component";

export const Todos = () => {
  const searchParams = new URLSearchParams({});
  searchParams.append('limit', `${1}`);
  searchParams.append('page', `${1}`);

  const {
    data: invoices,
    isFetching: invoicesIsFetching,
  } = useApi<InvoicesResponse>({
    queryKey: ['/invoices/pending', searchParams.toString()],
    url: `/invoices/pending?${searchParams.toString()}`,
    method: 'get'
  });

  return (
    <section>
      <h1>Att göra</h1>
      { invoicesIsFetching ? (
        <div className="w-full flex justify-center p-md">
          <Spinner aria-label="Hämtar ohanterade uppgifter" />
        </div>
      ): invoices?.invoices?.length ? (
        <div className="w-full flex flex-column justify-stretch gap-lg">
          <TodoListItem
            type="invoices"
            title="Aktuella fakturor att betala"
            subTitle={`Du har ${invoices._meta?.totalRecords} fakturor att betala.`}
            linkPath="fakturor"
            linkText="Visa fakturor"
          />
        </div>
      ): (
        <p>Du har inget du behöver ta hand om.</p>
      )}
    </section>
  );
};
