import React from 'react';
import { Link } from '@sk-web-gui/react';

const URL_OLD = 'https://minasidor.stadsbacken.se/';

export const ReferralBanner: React.FC = () => {
  return (
    <div className="w-full text-primary bg-background-200" role="region" aria-label="Informationsmeddelande">
      <div className="flex py-16 container w-full m-auto">
        <p>
          Du är nu inloggad i nya Mina sidor. Saknar du något kan du fortfarande använda den{' '}
          <Link href={URL_OLD} external variant="tertiary">
            äldre versionen av Mina sidor
          </Link>
        </p>
      </div>
    </div>
  );
};
