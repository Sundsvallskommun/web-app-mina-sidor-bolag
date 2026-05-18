'use client';

import { Pagination, SearchField, Select, Spinner } from '@sk-web-gui/react';
import { AgreementListItem } from '@layouts/pages/mypages-sections/agreements/agreement-list-item/agreement-list-item.component';
import React, { useEffect, useMemo, useState } from 'react';
import { useApi } from '@services/api-service';
import { getCategoryAsNumber, pagedAgreementsWithMetaHandler } from '@services/agreement-service';
import { AgreementData, RefinedAgreement } from '@interfaces/agreement';
import { useTranslation } from 'react-i18next';

export default function PagedAgreements() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  const {
    data: response,
    isLoading: agreementsIsLoading,
    isFetching,
  } = useApi({
    url: `/paged/agreements`,
    method: 'get',
    dataHandler: pagedAgreementsWithMetaHandler,
    queryKey: [currentPage, limit],
    axiosParameters: { params: { page: currentPage, limit } },
  });

  const agreements = response?.agreements;
  const meta = response?._meta;

  const [term, setTerm] = useState<string>('');
  const { t } = useTranslation(['common', 'agreement']);

  useEffect(() => {
    setPages(meta?.totalPages ?? 1);
  }, [meta]);

  const data = useMemo<AgreementData | undefined>(() => {
    if (!agreements) return undefined;
    if (term.length <= 1) return agreements;
    const normalized = term.toLocaleLowerCase();
    const filtered: AgreementData = {};
    for (const address in agreements) {
      filtered[address] = agreements[address].filter((agreement) =>
        JSON.stringify(agreement).toLocaleLowerCase().includes(normalized)
      );
    }
    return filtered;
  }, [agreements, term]);

  const onChangeHandler = (event: React.BaseSyntheticEvent) => {
    setTerm(event.target.value);
  };

  const onResetHandler = () => {
    setTerm('');
  };

  const handleChangeLimit = (option: string) => {
    setLimit(Number(option));
    setCurrentPage(1);
  };

  const agreementsList =
    data && agreements && !isFetching ? (
      <div>
        {Object.keys(agreements).length > 1 && (
          <SearchField
            className="mb-40 max-w-[520px]"
            size="md"
            value={term}
            onChange={onChangeHandler}
            onReset={onResetHandler}
            showSearchButton={false}
            placeholder={t('agreement:searchFacility')}
            data-cy="agreement-search-field"
          />
        )}

        {Object.entries(data).map(([address, agreements]: [string, RefinedAgreement[]], index) => {
          return (
            agreements?.length !== 0 && (
              <div className="pb-64" key={`site-${index}`}>
                <h3 className="text-h3-lg pb-24">{address ?? t('common:unknownAddress')}</h3>
                {agreements?.map((val, index) => {
                  return (
                    <AgreementListItem
                      key={`agreement-${index}`}
                      agreementSlug={`${getCategoryAsNumber(val.category.code)}/${val.facilityId}`}
                      category={val.category}
                      facilityId={val.facilityId}
                      area={val.netAreaId}
                      description={val.description}
                      production={val.production}
                      active={val.active}
                    />
                  );
                })}
              </div>
            )
          );
        })}

        {Object.values(data).flat().length === 0 && <p>{t('agreement:noMatch')}</p>}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-24 w-full">
          <div className="flex items-center gap-8">
            <p>{t('agreement:pagination.rowsPerPage')}:</p>
            <Select size="sm" variant="tertiary" onChange={(e) => handleChangeLimit(e.target.value)} value={limit}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </div>
          <Pagination pages={pages} activePage={currentPage} changePage={(page) => setCurrentPage(page)} />
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center w-full">
        <Spinner />
      </div>
    );

  return (
    <div>
      <h1 className="mb-40">{t('agreement:title')}</h1>
      {!agreementsIsLoading && agreements && Object.keys(agreements).length < 1 ? (
        <p>{t('agreement:noAgreements')}</p>
      ) : (
        agreementsList
      )}
    </div>
  );
}
