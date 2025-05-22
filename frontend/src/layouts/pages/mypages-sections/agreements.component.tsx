'use client';

import { SearchField } from '@sk-web-gui/react';
import { AgreementListItem } from '@layouts/pages/mypages-sections/agreements/agreement-list-item/agreement-list-item.component';
import React, { useEffect, useState } from 'react';
import { useApi } from '@services/api-service';
import { getCategoryAsNumber, pagedAgreementsHandler } from '@services/agreement-service';
import { AgreementData, RefinedAgreement } from '@interfaces/agreement';

export default function PagedAgreements() {
  const { data: agreements, isLoading: agreementsIsLoading } = useApi({
    url: `/paged/agreements`,
    method: 'get',
    dataHandler: pagedAgreementsHandler,
  });

  const [data, setData] = useState(agreements);
  const [term, setTerm] = useState<string>('');

  useEffect(() => {
    setData(agreements);
  }, [agreements]);

  const onChangeHandler = (event: React.BaseSyntheticEvent) => {
    setTerm(event.target.value);

    if (agreements && term.length > 1) {
      const filteredData = Object.entries(agreements).filter(([key]) => key.toLowerCase().includes(term.toLowerCase()));
      setData(filteredData?.length > 0 ? (Object.fromEntries(filteredData) as AgreementData) : undefined);
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
        <h1>Dina avtal</h1>
        <p>Du har inga avtal än, men så fort det finns avtal kan du se dem här.</p>
      </div>
    );
  } else if (data) {
    return (
      <div>
        <h1>Dina avtal</h1>

        <SearchField
          className="my-40 max-w-[520px]"
          size="md"
          value={term}
          onChange={onChangeHandler}
          onReset={onResetHandler}
          showSearchButton={false}
          placeholder="Sök efter anläggning"
        />

        {Object.entries(data).map(([key, value]: [string, RefinedAgreement[]], index) => {
          return (
            <div className="pb-64" key={`site-${index}`}>
              <h3 className="text-h3-lg pb-24">{key ? key : 'Okänd adress'}</h3>
              {value.map((val, index) => {
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
          );
        })}
      </div>
    );
  }
}
