'use client';

import { ArrowRight, ChartNoAxesCombined, Leaf, Recycle, Waves, Wrench } from 'lucide-react';
import { Breadcrumb, Button, Divider, Icon, Label, Spinner } from '@sk-web-gui/react';
import NextLink from 'next/link';
import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { useApi } from '@services/api-service';
import { agreementHandler, getCategoryAsString } from '@services/agreement-service';
import { PaddedListIcon } from '@layouts/pages/mypages-sections/agreements/agreement-list-item/padded-list-icon/padded-list-icon.component';
import { useEffect, useState } from 'react';
import { User } from '@interfaces/user';
import { FacilityInformation } from '@layouts/pages/mypages-sections/agreements/agreement/facility-information/facility-information.component';
import { InstalledBaseItem } from '@data-contracts/installedbase/data-contracts';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash';

export const AgreementComponent = () => {
  const params = useParams<{ slug: [string, string] }>();
  const [category, facilityId] = params.slug;
  const { t } = useTranslation(['common', 'agreement']);
  const [facility, setFacility] = useState<InstalledBaseItem>();

  const { data: agreement } = useApi({
    url: `/agreement/${getCategoryAsString(category)}/${facilityId}`,
    method: 'get',
    dataHandler: agreementHandler,
  });

  const { data: user } = useApi<User>({
    method: 'get',
    url: '/me',
    queryKey: ['user'],
  });

  useEffect(() => {
    if (agreement && user?.facilities) {
      user.facilities?.map((facility) => {
        if (facility.facilityId === facilityId && facility.type === agreement[0].category.label) {
          setFacility(facility);
        } else if (
          facility.facilityId === facilityId &&
          (facility.type === 'El' || facility.type === 'Elproduktion') &&
          agreement[0].category.label === 'Elnät'
        ) {
          setFacility(facility);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, facilityId, agreement]);

  const getAdditionalAgreementIcon = (description: string) => {
    switch (description) {
      case t('agreement:additionalAgreement.environmentFriendly'):
        return <Icon.Padded icon={<Leaf />} size={30} inverted color="gronsta" />;
      case t('agreement:additionalAgreement.climateNeutralDistrictHeating'):
        return <Icon.Padded icon={<Waves />} className="rotate-90" size={30} inverted color="gronsta" />;
      case t('agreement:additionalAgreement.companyService'):
        return <Icon.Padded icon={<Wrench />} size={30} inverted />;
      case t('agreement:additionalAgreement.recycled'):
        return <Icon.Padded icon={<Recycle />} size={30} inverted color="gronsta" />;
      case t('agreement:additionalAgreement.measurement'):
        return <Icon.Padded icon={<ChartNoAxesCombined />} size={30} inverted />;
      case t('agreement:additionalAgreement.service'):
        return <Icon.Padded icon={<Wrench />} size={30} inverted />;
      default:
        return <Icon.Padded icon={<Wrench />} size={30} inverted />;
    }
  };

  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        agreement ? (
          <Breadcrumb>
            <Breadcrumb.Item>
              <NextLink href="../">
                <Breadcrumb.Link variant="body" as="span" href={t('agreement:breadcrumbUrl')}>
                  {agreement && capitalize(t('common:agreement'))}
                </Breadcrumb.Link>
              </NextLink>
            </Breadcrumb.Item>
            <Breadcrumb.Item currentPage>
              <Breadcrumb.Link href="./">
                {agreement[0].category.label} {t('common:agreement')}
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        ) : null
      }
    >
      {agreement && facility ? (
        <section className="bg-background-content md:px-32 px-20 md:pb-32 pb-20 rounded-cards shadow-50 pt-24 md:pt-28">
          <div className="pt-0 mb-64">
            {agreement?.map((a, index) => {
              if (a.mainAgreement) {
                return (
                  <div key={`main-agreement`}>
                    <div className="md:flex items-center justify-between mb-36 md:mb-30">
                      <div className="flex md:items-center items-start">
                        <PaddedListIcon color={a.category.color} iconName={a.category.icon} />

                        <div>
                          <h3 className="md:text-h3-lg text-h3-sm" data-cy="agreement-label">
                            {t('agreement:item.title', {
                              label: a.category.label,
                              production: a.production ? t('agreement:item.production') : null,
                            })}
                          </h3>
                          <p>{a.siteAddress}</p>
                        </div>
                      </div>
                      {a.production ? null : (
                        <Button
                          className="md:w-1/4 md:p-0 mt-40 md:mt-0 w-full"
                          rightIcon={<ArrowRight />}
                          variant="secondary"
                          data-cy="agreement-to-statistics-button"
                        >
                          <Link href={t('agreement:item.statisticsUrl', { facilityId: a.facilityId })}>
                            {t('agreement:item.showStatistics')}
                          </Link>
                        </Button>
                      )}
                    </div>

                    {!a.active && (
                      <div className="rounded-cards border-1 border-error-surface-primary p-16 mt-16 mb-56">
                        <Label color="error" inverted rounded>
                          {t('agreement:item.inactive')}
                        </Label>
                        <p className="pt-16 m-0">
                          {t('agreement:item.inactiveDescription', { contractor: a.category.contractor })}
                        </p>
                      </div>
                    )}

                    <div>
                      <Divider.Section>{t('agreement:item.mainAgreement')}</Divider.Section>
                      <div className="md:flex justify-between pt-24">
                        <div className="md:pb-0 pb-32">
                          <strong>{t('agreement:item.contractor')}</strong>
                          <p className="capitalize">{a.category.contractor}</p>
                        </div>
                        <div className="md:pb-0 pb-32">
                          <strong>{t('agreement:item.facilityId')}</strong>
                          <p>{a.facilityId}</p>
                        </div>
                        <div className="md:pb-0 pb-32">
                          <strong>{t('agreement:item.type')}</strong>
                          <p>{a.description}</p>
                        </div>
                        <div className="md:pb-0 pb-32">
                          <strong>{t('agreement:item.priceModel')}</strong>
                          <p>{a.binding ? t('agreement:item.fixedPrice') : t('agreement:item.floatingPrice')}</p>
                        </div>
                        <div className="md:pb-0">
                          <strong>{t('agreement:item.period')}</strong>
                          <p>
                            {a.fromDate} – {a.toDate ? a.toDate : t('agreement:item.ongoing')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {agreement.length > 1 ? (
                      <h4 className="text-h4-sm mb-12 mt-64">{t('agreement:additionalAgreement.title')}</h4>
                    ) : null}
                  </div>
                );
              } else {
                return (
                  <div
                    key={`additional-agreement-${index}`}
                    data-cy={`additional-agreement-${a.facilityId}-${a.description}`}
                  >
                    <div
                      className="md:flex items-center bg-background-color-mixin-1 rounded-cards p-20 mb-12"
                      key={`additional-agreement}`}
                    >
                      <div className="flex items-center w-[250px] md:pb-0 pb-16">
                        {getAdditionalAgreementIcon(a.description)}
                        <div className="text-large font-bold pl-8 pr-28">{a.description}</div>
                      </div>

                      <div className="md:pl-16 md:flex block">
                        <strong className="pr-8">{t('agreement:item.period')}</strong>
                        {a.fromDate} – {a.toDate ? a.toDate : t('agreement:item.ongoing')}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>

          <FacilityInformation facility={facility} />
        </section>
      ) : (
        <Spinner className="mx-auto" />
      )}
    </PagesBreadcrumbsLayout>
  );
};
