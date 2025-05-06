'use client';

import { SearchField } from '@sk-web-gui/react';
import { AgreementListItem } from '@layouts/pages/mypages-sections/agreements/agreement-list-item/agreement-list-item.component';
import React, { useState } from 'react';

export const mockData = [
  {
    id: 0,
    facility: 'Kummelgatan 16',
    agreements: [
      {
        id: 0,
        agreementType: 'Produktionsavtal',
        facilityId: '735999109515160509',
        area: 'SUV',
        type: 'Säkringsabonnemang',
      },
      {
        id: 1,
        agreementType: 'Elhandelsavtal',
        facilityId: '735999109515160509',
        area: 'SUV',
        type: 'Rörligt pris +2,40 öre/kWh',
      },
    ],
  },
  {
    id: 1,
    facility: 'Storgatan 1',
    agreements: [
      {
        id: 0,
        agreementType: 'Produktionsavtal',
        facilityId: '735999109515160502',
        area: 'SUV',
        type: 'Säkringsabonnemang',
      },
      {
        id: 1,
        agreementType: 'Elhandelsavtal',
        facilityId: '735999109515160502',
        area: 'SUV',
        type: 'Rörligt pris +2,40 öre/kWh',
      },
    ],
  },
];

export default function Agreements() {
  const [term, setTerm] = useState<string>('');
  const [data, setData] = useState(mockData);

  const handleSearch = (query: string) => {
    const newData = data.filter((facility) => facility.facility.toLowerCase() === query.toLowerCase());
    setData(newData);
  };

  const onChangeHandler = (event: React.BaseSyntheticEvent) => {
    setTerm(event.target.value);

    const newData = data.filter((facility) => facility.facility.toLowerCase().includes(term.toLowerCase()));
    setData(newData);

    if (!term.length || term === ' ' || term === '') {
      setData(mockData);
    }
  };

  const onResetHandler = () => {
    setData(mockData);
  };

  if (mockData.length < 1) {
    return (
      <div>
        <h1>Dina avtal</h1>
        <p>Du har inga avtal än, men så fort det finns avtal kan du se dem här.</p>
      </div>
    );
  } else {
    return (
      <div>
        <h1>Dina avtal</h1>

        <SearchField
          className="my-40 max-w-[520px]"
          size="md"
          value={term}
          onSearch={handleSearch}
          onChange={onChangeHandler}
          onReset={onResetHandler}
          showSearchButton={false}
          placeholder="Sök efter anläggning"
        />

        {data.map((facility, facilityIndex) => {
          return (
            <div key={`facility-${facilityIndex}`} className="pb-64">
              <h3 className="text-h3-lg pb-24">{facility.facility}</h3>

              {facility.agreements.map((agreement, index) => {
                return (
                  <AgreementListItem
                    key={`agreement-${index}`}
                    agreementSlug={`${agreement.facilityId}-${agreement.id}`}
                    agreementType={agreement.agreementType}
                    facilityId={agreement.facilityId}
                    area={agreement.area}
                    type={agreement.type}
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
