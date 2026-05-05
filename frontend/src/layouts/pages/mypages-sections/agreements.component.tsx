'use client';

import { Pagination, SearchField } from '@sk-web-gui/react';
import { AgreementListItem } from '@layouts/pages/mypages-sections/agreements/agreement-list-item/agreement-list-item.component';
import React, { useEffect, useState } from 'react';
import { useApi } from '@services/api-service';
import { getCategoryAsNumber, pagedAgreementsWithMetaHandler } from '@services/agreement-service';
import { AgreementData, RefinedAgreement } from '@interfaces/agreement';
import { useTranslation } from 'react-i18next';

const PAGE_LIMIT = 20;

export default function PagedAgreements() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);

  const { data: response, isLoading: agreementsIsLoading } = useApi({
    url: `/paged/agreements`,
    method: 'get',
    dataHandler: pagedAgreementsWithMetaHandler,
    queryKey: [currentPage],
    axiosParameters: { params: { page: currentPage, limit: PAGE_LIMIT } },
  });

  const agreements = response?.agreements;
  const meta = response?._meta;

  const [data, setData] = useState<AgreementData | undefined>(agreements);
  const [term, setTerm] = useState<string>('');
  const { t } = useTranslation(['common', 'agreement']);

  useEffect(() => {
    setData(agreements);
    setPages(meta?.totalPages ?? 1);
  }, [agreements, meta]);

  const onChangeHandler = (event: React.BaseSyntheticEvent) => {
    setTerm(event.target.value);

    if (agreements && event.target.value.length > 1) {
      const filteredData: AgreementData = {};
      for (const address in agreements) {
        filteredData[address] = agreements[address].filter((agreement) => {
          return JSON.stringify(agreement).toLocaleLowerCase().includes(event.target.value.toLocaleLowerCase());
        });
      }
      setData(filteredData);
    } else {
      setData(agreements);
    }
  };

  const onResetHandler = () => {
    setData(agreements);
  };

  if (!agreementsIsLoading && agreements && Object.keys(agreements).length < 1) {
    return (
      <div>
        <h1>{t('agreement:title')}</h1>
        <p>{t('agreement:noAgreements')}</p>
      </div>
    );
  } else if (data && agreements) {
    return (
      <div>
        <h1 className="mb-40">{t('agreement:title')}</h1>

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
        <div className="flex flex-col items-center gap-8 w-full">
          <Pagination pages={pages} activePage={currentPage} changePage={(page) => setCurrentPage(page)} />
        </div>
      </div>
    );
  }
}
