'use client';

import { ArrowRight, Leaf, UtilityPole } from 'lucide-react';
import { Breadcrumb, Button, Divider, Icon } from '@sk-web-gui/react';
import NextLink from 'next/link';
import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';

export const mockData = {
  id: 0,
  contractor: 'Sundsvall Elnät',
  agreementType: 'Produktionsavtal',
  facilityId: '735999109515160509',
  facility: 'Kummelgatan 16',
  area: 'SUV',
  type: 'Säkringsabonnemang',
  priceModel: 'Rörligt pris',
  startDate: '2028-04-18',
  endDate: '',
  additionalAgreements: [
    {
      id: 0,
      type: 'Bra miljöval',
      startDate: '2018-04-18',
      endDate: undefined,
    },
    {
      id: 1,
      type: 'Serviceavtal Privat',
      startDate: '2018-04-18',
      endDate: undefined,
    },
  ],
  facilityInformation: {
    yearlyConsumption: 11745,
    meterNumber: '2770279',
    area: 'SUV',
    fuseSize: '20 A',
    propertyDesignation: 'KUMLET 14',
  },
};

export const AgreementComponent = () => {
  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb>
          <Breadcrumb.Item>
            <NextLink href="../avtal">
              <Breadcrumb.Link variant="body" as="span" href="../avtal">
                Avtal
              </Breadcrumb.Link>
            </NextLink>
          </Breadcrumb.Item>
          <Breadcrumb.Item currentPage>
            <Breadcrumb.Link href="./">{mockData.agreementType}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <section className="bg-background-content px-32 pb-32 rounded-cards shadow-50">
        <div className="md:flex items-center justify-between pb-32">
          <div className="flex items-center">
            <div className="bg-warning-background-200 flex justify-center items-center w-52 h-52 rounded-button mr-16">
              <Icon icon={<UtilityPole />} size={30} />
            </div>

            <div>
              <h3 className="text-h3-lg">{mockData.agreementType}</h3>
              <p>{mockData.facility}</p>
            </div>
          </div>
          <Button className="md:w-1/4 md:p-0 w-full my-40" rightIcon={<ArrowRight />} variant="secondary">
            Visa statistik
          </Button>
        </div>

        <div className="pb-56">
          <Divider.Section>Huvudavtal</Divider.Section>
          <div className="md:flex justify-between pt-24">
            <div className="md:pb-0 pb-32">
              <strong>Avtalsgivare</strong>
              <p>{mockData.contractor}</p>
            </div>
            <div className="md:pb-0 pb-32">
              <strong>Anläggnings-ID</strong>
              <p>{mockData.facilityId}</p>
            </div>
            <div className="md:pb-0 pb-32">
              <strong>Typ</strong>
              <p>{mockData.type}</p>
            </div>
            <div className="md:pb-0 pb-32">
              <strong>Prismodell</strong>
              <p>{mockData.priceModel}</p>
            </div>
            <div className="md:pb-0 pb-32">
              <strong>Avtalsperiod</strong>
              <p>{mockData.startDate} - Löpande</p>
            </div>
          </div>

          <div className="pt-56">
            <h4 className="text-h4-sm mb-12">Tilläggsavtal</h4>
            {mockData.additionalAgreements.map((agreement, index) => {
              return (
                <div
                  className="md:flex items-center bg-background-color-mixin-1 rounded-cards p-20 mb-12"
                  key={`additional-agreement-${index}`}
                >
                  <div className="flex items-center w-[250px] md:pb-0 pb-16">
                    <Icon.Padded icon={<Leaf />} size={30} inverted color="gronsta" />
                    <div className="text-large font-bold pl-8 pr-28">{agreement.type}</div>
                  </div>

                  <div className="md:pl-16 md:flex block">
                    <strong className="pr-8">Avtalsperiod</strong>
                    {agreement.startDate} - Löpande
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Divider.Section>Anläggningsinformation</Divider.Section>
          <div className="md:flex justify-between pt-24">
            <div className="md:pb-0 pb-32">
              <strong>Årlig förbrukning</strong>
              <p>{mockData.facilityInformation.yearlyConsumption} kWh</p>
            </div>
            <div className="md:pb-0 pb-32">
              <strong>Mätarnummer</strong>
              <p>{mockData.facilityInformation.meterNumber}</p>
            </div>
            <div className="md:pb-0 pb-32">
              <strong>Säkringsstorlek</strong>
              <p>{mockData.facilityInformation.fuseSize}</p>
            </div>
            <div className="md:pb-0 pb-32">
              <strong>Nätområde</strong>
              <p>{mockData.facilityInformation.area}</p>
            </div>
            <div>
              <strong>Fastighetsbeteckning</strong>
              <p>{mockData.facilityInformation.propertyDesignation}</p>
            </div>
          </div>
        </div>
      </section>
    </PagesBreadcrumbsLayout>
  );
};
