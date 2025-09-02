import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import { apiService } from '@services/api-service';
import { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';

export const OnlyTrade: React.FC<{ facility?: InstalledBaseItem }> = ({ facility }) => {
  const [netOwner, setNetOwner] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (facility?.address?.street && facility?.address?.city) {
      apiService
        .post('netowner', facility)
        .then((response: AxiosResponse<string, unknown>) => {
          setNetOwner(response.data || 'Okänd elnätsägare');
        })
        .catch((error) => {
          console.error('Error fetching net owner:', error);
          setNetOwner('Okänd elnätsägare');
        });
    }
  }, [facility]);

  return (
    <article className="grow md:min-w-[338px] max-w-[520px] min-h-[165px] bg-background-content p-16 lg:my-0 mb-24">
      <div>
        <p className="text-small whitespace-normal">
          Din {facility?.address?.street?.includes('Solcellsanläggning') ? 'produktion' : 'förbrukning'} ser du hos ditt
          elnätsbolag. För denna anläggning ser vi att du har {netOwner}.
        </p>
      </div>
    </article>
  );
};
