'use client';

import { ExternalLinkCard } from '@layouts/pages/mypages-sections/self-service/external-link-card/external-link-card.component';
import {
  categorySortIndex,
  selfServiceCategories,
} from '@layouts/pages/mypages-sections/self-service/self-service/self-service-categories';
import { RepresentingMode } from '@interfaces/app';
import { SelfService as SelfServiceFlow } from '@interfaces/self-service';
import { User } from '@interfaces/user';
import { useApi } from '@services/api-service';
import { useMemo } from 'react';
import { useAppContext } from '@contexts/app.context';
import { useTranslation } from 'react-i18next';

export default function SelfService() {
  const { representingMode } = useAppContext();
  const { data } = useApi<User>({ url: '/me', method: 'get', queryKey: ['user'] });
  const { data: serviceData } = useApi<SelfServiceFlow[]>({ url: '/selfservices', method: 'get' });
  const { t } = useTranslation('common');

  const suffix = representingMode === RepresentingMode.PRIVATE ? '?privat' : '';

  const facilityTypes = useMemo(() => {
    if (!data?.facilities) return new Set();
    return new Set(data.facilities?.map((f) => f.type ?? ''));
  }, [data]);

  const groupedServices = useMemo(() => {
    const isVisible = (category: string) => {
      if (category === 'Allmänt') return true;
      const categoryConfig = selfServiceCategories[category];
      return categoryConfig ? categoryConfig.facilityTypes.some((type) => facilityTypes.has(type)) : false;
    };

    const groups = new Map<string, SelfServiceFlow[]>();
    (serviceData ?? [])
      .filter((service) => isVisible(service.Category))
      .forEach((service) => {
        groups.set(service.Category, [...(groups.get(service.Category) ?? []), service]);
      });

    return [...groups.entries()]
      .sort(([a], [b]) => categorySortIndex(a) - categorySortIndex(b))
      .map(([category, services]) => ({
        category,
        services: services.toSorted((a, b) => a.Name.localeCompare(b.Name, 'sv')),
      }));
  }, [serviceData, facilityTypes]);

  return (
    <div>
      <h1 className="pb-40">{t('common:selfService')}</h1>

      {groupedServices.map(({ category, services }) => (
        <div key={category} className="lg:pb-64 pb-24">
          <h3 className="pb-24">
            {category} ({services.length})
          </h3>

          <div className="lg:grid lg:grid-cols-2 lg:gap-24">
            {services.map((service) => (
              <ExternalLinkCard
                key={service.ID}
                {...service}
                suffix={suffix}
                icon={selfServiceCategories[category].icon}
                bgColor={selfServiceCategories[category].bgColor}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
