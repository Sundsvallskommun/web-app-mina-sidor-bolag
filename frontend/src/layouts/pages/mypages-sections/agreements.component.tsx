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
        <h1>Dina avtal</h1>
        <p>Du har inga avtal än, men så fort det finns avtal kan du se dem här.</p>
      </div>
    );
  } else if (data && agreements) {
    return (
      <div>
        <h1 className="mb-40">Dina avtal</h1>

        {Object.keys(agreements).length > 1 && (
          <SearchField
            className="mb-40 max-w-[520px]"
            size="md"
            value={term}
            onChange={onChangeHandler}
            onReset={onResetHandler}
            showSearchButton={false}
            placeholder="Sök efter anläggning"
          />
        )}

        {Object.entries(data).map(([address, agreements]: [string, RefinedAgreement[]], index) => {
          return (
            agreements.length !== 0 && (
              <div className="pb-64" key={`site-${index}`}>
                <h3 className="text-h3-lg pb-24">{address ? address : 'Okänd adress'}</h3>
                {agreements.map((val, index) => {
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

        {Object.values(data).flat().length === 0 && <p>Inga avtal matchar din sökning</p>}
      </div>
    );
  }
}
