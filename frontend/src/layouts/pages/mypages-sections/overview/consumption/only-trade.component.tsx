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
          console.log('Net owner response:', response.data);
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
      {/* <div className="flex gap-12 pb-16">
        <div className="flex items-center">
          <div className={`bg-vattjom-background-200 flex justify-center items-center h-32 w-32 p-4 rounded-button`}>
            <Icon icon={<Lightbulb />} size={20} />
          </div>
        </div>
        <p className="text-large">
          {facility?.address?.street?.includes('Solcellsanläggning') ? 'Elproduktion' : 'Elförbrukning'}
        </p>
      </div> */}

      <div>
        <p className="text-small whitespace-normal">
          Din {facility?.address?.street?.includes('Solcellsanläggning') ? 'produktion' : 'förbrukning'} ser du hos ditt
          elnätsbolag. För denna anläggning ser vi att du har {netOwner}.
        </p>
        <p className="text-small"></p>
      </div>
    </article>
  );
};
