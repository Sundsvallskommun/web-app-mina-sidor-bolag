'use client';

import { CustomerRelation } from '@data-contracts/customer/data-contracts';
import { Announcement, AnnouncementGroup } from '@interfaces/announcements';
import { RepresentingEntity, RepresentingMode } from '@interfaces/app';
import { useApi } from '@services/api-service';
import { Image, Link, Spinner } from '@sk-web-gui/react';
import { getCustomerGroups } from '@utils/app-organizations';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const announcementsSource: Announcement[] = [
  {
    id: 0,
    title: 'Välkommen till nya versionen av Mina sidor!',
    text: 'Mina sidor har fått ett nytt utseende och en tydligare struktur, och nu är det fritt fram för dig att testa den nya versionen. Det mesta är sig likt, men vi har putsat på designen och gjort det enklare att hitta rätt. Under en övergångsperiod kan du själv välja om du vill använda den gamla versionen eller prova den nya. Testa den gärna, klicka runt och lämna dina synpunkter. Din feedback är guld värd och hjälper oss att göra Mina Sidor ännu bättre i vårt fortsatta utvecklingsarbete.',
    urlTitle: 'Lämna din feedback',
    url: 'https://minasidor.stadsbacken.se/oversikt/flow/225',
    groups: [
      AnnouncementGroup.CUSTOMER_SV_EL,
      AnnouncementGroup.CUSTOMER_SV_ENERGI,
      AnnouncementGroup.BUSINESS,
      AnnouncementGroup.PRIVATE,
    ],
    image: '/valkommen-till-nya-mina-sidor.png',
    imageAlt: 'Välkommen till nya versionen av Mina sidor!',
  },
  {
    id: 1,
    title: 'Avbrottsersättning och skadestånd',
    text: 'När ett sammanhängande avbrott sker, och varar längre än 12 timmar, har du som kund rätt till ersättning.',
    urlTitle: 'Läs mer om avbrottsersättning',
    url: 'https://sundsvallelnat.se/stromavbrott/avbrottsersattning-och-skadestand/',
    groups: [AnnouncementGroup.CUSTOMER_SV_EL],
    image: '/avbrottsersattning.png',
    imageAlt: 'Avbrottsersättning och skadestånd',
  },
  {
    id: 2,
    title: 'Har du frågor om din elhandelsfaktura?',
    text: 'Med rådande läge på elmarknaden är det många som har frågor om sin faktura och elförbrukning. Vi finns här och hjälper dig att svara på dina frågor och funderingar, vår ambition är alltid att hjälpa till på de bästa sätt vi kan.',
    urlTitle: 'Läs mer',
    url: 'https://sundsvallenergi.se/kundservice/fakturor',
    groups: [AnnouncementGroup.CUSTOMER_SV_ENERGI],
    image: '/hardufragor.jpg',
    imageAlt: 'Har du frågor om din elhandelsfaktura?',
  },
  {
    id: 3,
    title: 'Kontakta oss',
    text: 'Behöver du komma i kontakt med oss? Fyll i formuläret och ange vad du önskar ha hjälp med, så återkommer vi till dig inom tre arbetsdagar. Är ditt ärende mer brådskande ber vi dig istället att ringa in till oss.',
    urlTitle: 'Skicka in ditt ärende här',
    url: 'https://minasidor.stadsbacken.se/oversikt/flow/225',
    groups: [
      AnnouncementGroup.CUSTOMER_SV_EL,
      AnnouncementGroup.CUSTOMER_SV_ENERGI,
      AnnouncementGroup.BUSINESS,
      AnnouncementGroup.PRIVATE,
    ],
    image: '/kontaktaoss.jpg',
    imageAlt: 'Kontakta oss',
  },
  {
    id: 4,
    title: 'Dags att flytta? Vi hjälper dig!',
    text: 'Du vet väl om att du smidigt kan ta med dina tjänster och avtal hos Sundsvall Energi och Sundsvall Elnät när flyttlasset går. Du anmäler din flytt här på Mina sidor. Hoppas du ska trivas med oss även på din nya adress!',
    urlTitle: '',
    url: '',
    groups: [AnnouncementGroup.CUSTOMER_SV_EL, AnnouncementGroup.CUSTOMER_SV_ENERGI, AnnouncementGroup.PRIVATE],
    image: '/dagsattflytta.jpg',
    imageAlt: 'Dags att flytta? Vi hjälper dig!',
  },
  {
    id: 5,
    title: 'Vill du registrera dig för driftavbrottsavisering?',
    text: 'Håll dig uppdaterad om eventuella driftstörningar genom att registrera dig för driftavbrottsavisering. Du kan enkelt hantera dina inställningar för aviseringar och välja hur du blir informerad på "Aviseringar',
    urlTitle: '',
    url: '',
    groups: [AnnouncementGroup.CUSTOMER_SV_EL],
    image: '/driftavbrottsavisering.jpg',
    imageAlt: 'Vill du registrera dig för driftavbrottsavisering?',
  },
  {
    id: 6,
    title: 'Fjärrkyla',
    text: 'Fjärrkyla från Sundsvall Energi innebär att du köper kyla som är klar för användning, direkt till din fastighet. Vi erbjuder fjärrkyla till exempelvis kontor, shoppingcenter, hotell, industrier och andra lokaler i Sundsvall och Timrå.',
    urlTitle: '',
    url: '',
    groups: [AnnouncementGroup.BUSINESS],
    image: '/fjarrkyla.jpg',
    imageAlt: 'Fjärrkyla',
  },
  {
    id: 7,
    title: 'Laddtjänster för företag och brf',
    text: 'Sundsvall Energi erbjuder tillsammans med Mer en helhetslösning för laddning som anpassas efter era behov. Ni erbjuder laddning, vi sköter resten.',
    urlTitle: '',
    url: '',
    groups: [AnnouncementGroup.BUSINESS],
    image: '/laddning.jpg',
    imageAlt: 'Laddtjänster för företag och brf',
  },
  {
    id: 8,
    title: 'Ladda din elbil snabbt och smidigt',
    text: 'En laddbox ger dig snabbare och säkrare laddning. I vårt sortiment av produkter för laddning i hemmet erbjuder vi laddboxar och installationstjänst i samarbete mellan Sundsvall Energi och Mer.',
    urlTitle: 'Läs mer',
    url: 'https://sundsvallenergi.se/laddboxar-for-hemmet/',
    groups: [AnnouncementGroup.CUSTOMER_SV_ENERGI],
    image: '/laddning.jpg',
    imageAlt: 'Ladda din elbil snabbt och smidigt',
  },
];

const getRepresentingGroup = (representingEntity?: RepresentingEntity): AnnouncementGroup => {
  switch (representingEntity?.mode) {
    case RepresentingMode.BUSINESS:
      return AnnouncementGroup.BUSINESS;

    default:
    case RepresentingMode.PRIVATE:
      return AnnouncementGroup.PRIVATE;
  }
};

export const Announcements = () => {
  const { data: representingEntity } = useApi<RepresentingEntity>({ url: '/representing', method: 'get' });
  const { data: relations } = useApi<CustomerRelation[]>({ url: '/myrelations', method: 'get' });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { t } = useTranslation('overview');

  useEffect(() => {
    const customerEngagements = relations?.map((r) => r.organizationNumber ?? '') ?? [];
    const groups = [getRepresentingGroup(representingEntity), ...getCustomerGroups(customerEngagements)];
    setAnnouncements(
      announcementsSource.filter((announcement) => groups.some((group) => announcement.groups.includes(group)))
    );
  }, [representingEntity, relations, setAnnouncements]);

  const doneFetching = representingEntity && relations;
  if (doneFetching && announcements.length === 0) {
    return <></>;
  }

  return (
    <section className="pt-80">
      <h3>{t('overview:announcements.title')}</h3>
      <div className="flex flex-col gap-24 my-24">
        {doneFetching ? (
          <>
            {announcements.map((announcement, index) => {
              return (
                <div
                  key={`anouncement-${index}`}
                  className="bg-background-content shadow-50 rounded-cards max-w-[106rem] min-h-[30rem] flex flex-col sm:flex-row sm:min-w-[36rem]"
                >
                  <Image
                    src={announcement.image}
                    alt={announcement.imageAlt}
                    className="rounded-t-cards sm:rounded-r-0 sm:rounded-l-cards object-cover grow w-full md:max-h-[60vw] sm:w-[32rem] sm:max-w-[35vw]"
                  />
                  <div className="p-24 flex flex-col gap-16">
                    <h2 className="text-h3-md">{announcement.title}</h2>
                    <p>{announcement.text}</p>
                    {announcement.url && (
                      <Link external className="font-bold text-dark underline" href={announcement.url}>
                        {announcement.urlTitle}
                      </Link>
                    )}
                    {index === 0 ? (
                      <Link external className="font-bold text-dark underline" href="https://minasidor.stadsbacken.se/">
                        Gå tillbaka till gamla versionen av Mina sidor
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <Spinner />
        )}
      </div>
    </section>
  );
};
