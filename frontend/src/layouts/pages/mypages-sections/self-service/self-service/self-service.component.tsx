'use client';

import { selfServices } from '@layouts/pages/mypages-sections/self-service/self-service/self-services';
import { ExternalLinkCard } from '@layouts/pages/mypages-sections/self-service/external-link-card/external-link-card.component';
import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import { useMemo } from 'react';
import { useAppContext } from '@contexts/app.context';
import { useTranslation } from 'react-i18next';

export default function SelfService() {
  const { representingMode } = useAppContext();
  const { data } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const { t } = useTranslation('common');

  const facilityTypes = useMemo(() => {
    if (!data?.facilities) return new Set();
    return new Set(data.facilities?.map((f) => f.type ?? ''));
  }, [data]);
  return (
    <div>
      <h1 className="pb-40">{t('common:selfService')}</h1>

      {selfServices(representingMode).map((service, index) => {
        return typeof service.category === 'undefined' || facilityTypes.has(service.category) ? (
          <div key={`service-category-${index}`} className="lg:pb-64 pb-24">
            <h3 className="pb-24">
              {service.name} ({service.services.length})
            </h3>

            <div className="lg:grid lg:grid-cols-2 lg:gap-24">
              {service.services.map((service, index) => {
                return <ExternalLinkCard key={`external-link-card-${index}`} {...service} />;
              })}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
}
