'use client';

import { RepresentingEntity } from '@data-contracts/backend/data-contracts';
import { Announcement, AnnouncementGroup } from '@interfaces/announcements';
import { RepresentingMode } from '@interfaces/app';
import { useApi } from '@services/api-service';
import { Image, Link, Spinner } from '@sk-web-gui/react';
import { getCustomerGroups } from '@utils/app-organizations';
import { useRelations } from '@utils/use-relations.hook';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const announcementsSource: Announcement[] = [
  {
    id: 0,
    title: 'Sundsvall Elnät byter faktureringssystem',
    text: 'I samband med byte av faktureringssystem tar Sundsvall Energi över faktureringen och kommer att fakturera på uppdrag av Sundsvall Elnät från och med november. Du som kund kommer därmed att få din elnätsfaktura från Sundsvall Energi framöver. Du får ett nytt kundnummer, fakturan får ett nytt utseende och kommande fakturabetalningar betalas in till Sundsvall Energi.',
    urlTitle: 'Mer information',
    url: 'https://sundsvallelnat.se/min-anslutning/priser-och-avtalsvillkor/sundsvall-elnat-byter-faktureringssystem',
    groups: [AnnouncementGroup.CUSTOMER_SV_EL],
    image: '/elnat-nytt-faktureringssystem.png',
    imageAlt: '',
  },
  {
    id: 1,
    title: 'Nytt utseende på våra fakturor',
    text: 'Vi byter faktureringssystem i november och det innebär att du kommer få ett nytt kundnummer samt att fakturan får ett nytt utseende. I samband med bytet kommer Sundsvall Energi även att hantera faktureringen för Sundsvall Elnät.',
    urlTitle: 'Mer information',
    url: 'https://sundsvallenergi.se/kundservice/nytt-utseende-for-vara-fakturor',
    groups: [AnnouncementGroup.CUSTOMER_SV_ENERGI],
    image: '/seab-nytt-utseende-fakturor.png',
    imageAlt: '',
  },
  {
    id: 2,
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
    imageAlt: '',
  },
  {
    id: 3,
    title: 'Avbrottsersättning och skadestånd',
    text: 'När ett sammanhängande avbrott sker, och varar längre än 12 timmar, har du som kund rätt till ersättning.',
    urlTitle: 'Läs mer om avbrottsersättning',
    url: 'https://sundsvallelnat.se/stromavbrott/avbrottsersattning-och-skadestand/',
    groups: [AnnouncementGroup.CUSTOMER_SV_EL],
    image: '/avbrottsersattning.png',
    imageAlt: '',
  },
  {
    id: 4,
    title: 'Har du frågor om din elhandelsfaktura?',
    text: 'Med rådande läge på elmarknaden är det många som har frågor om sin faktura och elförbrukning. Vi finns här och hjälper dig att svara på dina frågor och funderingar, vår ambition är alltid att hjälpa till på de bästa sätt vi kan.',
    urlTitle: 'Läs mer',
    url: 'https://sundsvallenergi.se/kundservice/fakturor',
    groups: [AnnouncementGroup.CUSTOMER_SV_ENERGI],
    image: '/hardufragor.jpg',
    imageAlt: '',
  },
  {
    id: 5,
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
    imageAlt: '',
  },
  {
    id: 6,
    title: 'Dags att flytta? Vi hjälper dig!',
    text: 'Du vet väl om att du smidigt kan ta med dina tjänster och avtal hos Sundsvall Energi och Sundsvall Elnät när flyttlasset går. Du anmäler din flytt här på Mina sidor. Hoppas du ska trivas med oss även på din nya adress!',
    urlTitle: '',
    url: '',
    groups: [AnnouncementGroup.CUSTOMER_SV_EL, AnnouncementGroup.CUSTOMER_SV_ENERGI, AnnouncementGroup.PRIVATE],
    image: '/dagsattflytta.jpg',
    imageAlt: '',
  },
  {
    id: 7,
    title: 'Vill du registrera dig för driftavbrottsavisering?',
    text: 'Håll dig uppdaterad om eventuella driftstörningar genom att registrera dig för driftavbrottsavisering. Du kan enkelt hantera dina inställningar för aviseringar och välja hur du blir informerad på "Aviseringar',
    urlTitle: '',
    url: '',
    groups: [AnnouncementGroup.CUSTOMER_SV_EL],
    image: '/driftavbrottsavisering.jpg',
    imageAlt: '',
  },
  {
    id: 8,
    title: 'Fjärrkyla',
    text: 'Fjärrkyla från Sundsvall Energi innebär att du köper kyla som är klar för användning, direkt till din fastighet. Vi erbjuder fjärrkyla till exempelvis kontor, shoppingcenter, hotell, industrier och andra lokaler i Sundsvall och Timrå.',
    urlTitle: '',
    url: '',
    groups: [AnnouncementGroup.BUSINESS],
    image: '/fjarrkyla.jpg',
    imageAlt: '',
  },
  {
    id: 9,
    title: 'Laddtjänster för företag och brf',
    text: 'Sundsvall Energi erbjuder tillsammans med Mer en helhetslösning för laddning som anpassas efter era behov. Ni erbjuder laddning, vi sköter resten.',
    urlTitle: '',
    url: '',
    groups: [AnnouncementGroup.BUSINESS],
    image: '/laddning.jpg',
    imageAlt: '',
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

const TemporaryDisturbanceArticle = () => {
  return (
    <div className="bg-background-content shadow-50 rounded-cards max-w-[106rem] min-h-[30rem] flex flex-col sm:flex-row sm:min-w-[36rem]">
      <Image
        src="/tillfalligt-uppehall-matvarden-fakturor.png"
        alt=""
        className="rounded-t-cards sm:rounded-r-0 sm:rounded-l-cards object-cover grow w-full md:max-h-[60vw] sm:w-[32rem] sm:max-w-[35vw]"
      />
      <div className="p-24 flex flex-col gap-16">
        <h2 className="text-h3-md">Tillfälligt uppehåll i visning av mätvärden och fakturor</h2>
        <p>
          I samband med att vi nu byter till ett nytt faktureringssystem är vissa funktioner på Mina sidor tillfälligt
          begränsade. Det innebär att du inte kommer att kunna se dina mätvärden och fakturor som vanligt under en
          period. Du går inte miste om någon mätdata, när systembytet är genomfört finns all data tillgänglig för dig på
          Mina sidor. Om du trots allt har behov av dina mätvärden eller din senaste faktura under denna tillfälliga
          period kan du be om ett{' '}
          <Link
            external
            className="font-bold text-dark underline"
            href="https://minasidor.stadsbacken.se/oversikt/flow/270"
          >
            utdrag via denna e-tjänst
          </Link>
          .
        </p>

        <p>
          Vi förstår att det kan kännas lite rörigt en stund, men snart blir allt både enklare och bättre. Tack för att
          du har tålamod medan vi gör förbättringarna!
        </p>

        <p>
          Har du frågor eller funderingar? Välkommen att höra av dig till oss via mejl{' '}
          <Link className="font-bold text-dark underline" href="mailto:info@sundsvallelnat.se">
            info@sundsvallelnat.se
          </Link>{' '}
          eller telefon{' '}
          <Link className="font-bold text-dark underline" href="tel:0606005020">
            060 - 600 50 20
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export const Announcements = () => {
  const { data: representingEntity } = useApi<RepresentingEntity>({ url: '/representing', method: 'get' });
  const { relations, activeCustomerEngagements } = useRelations();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { t } = useTranslation('overview');

  useEffect(() => {
    const groups = [getRepresentingGroup(representingEntity), ...getCustomerGroups(activeCustomerEngagements)];
    setAnnouncements(
      announcementsSource.filter((announcement) => groups.some((group) => announcement.groups.includes(group)))
    );
  }, [representingEntity, activeCustomerEngagements, setAnnouncements]);

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
            <TemporaryDisturbanceArticle />
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
                    {index === 2 ? (
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
