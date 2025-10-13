import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import { apiService } from '@services/api-service';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const OnlyTrade: React.FC<{ facility?: InstalledBaseItem }> = ({ facility }) => {
  const [netOwner, setNetOwner] = useState<string | undefined>(undefined);
  const { t } = useTranslation('statistics');

  useEffect(() => {
    if (facility?.address?.street && facility?.address?.city) {
      apiService
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .post<any>('netowner', facility)
        .then((response) => {
          setNetOwner(response.data || t('statistics:onlyTrade.unknownNetOwner'));
        })
        .catch((error) => {
          console.error('Error fetching net owner:', error);
          setNetOwner(t('statistics:onlyTrade.unknownNetOwner'));
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facility]);

  return (
    <article className="grow md:min-w-[338px] max-w-[520px] min-h-[165px] bg-background-content p-16 lg:my-0 mb-24">
      <div>
        <p className="text-small whitespace-normal">
          {t('statistics:onlyTrade.text', {
            consumption: facility?.address?.street?.includes('Solcellsanläggning') ? 'produktion' : 'förbrukning',
            netOwner: netOwner,
          })}
        </p>
      </div>
    </article>
  );
};
