'use client';

import { Image, Link } from '@sk-web-gui/react';

export const puffs: {
  id: number;
  title: string;
  text: string;
  urlTitle: string;
  url: string;
  groups: string[];
  image?: string;
  imageAlt?: string;
}[] = [
  {
    id: 0,
    title: 'Vi skickar våra fakturor digitalt via Kivra',
    text: 'För att underlätta för våra kunder så skickar vi våra fakturor via Kivra, en tjänst där du både kan se och betala din faktura digitalt. Läs mer på https://kivra.se eller ladda ner Kivra som app i din telefon. Har du inte Kivra? I så fall kommer du få din faktura med brev, och om du valt e-faktura till din internetbank kommer du istället få din faktura dit. Om du har Kivra till andra tjänster, men önskar att dina fakturor från Sundsvall Energi inte ska skickas till hit, så ber vi dig vänligen att kontakta Kivra direkt.',
    urlTitle: 'Läs mer om Kivra',
    url: 'https://kivra.se/sv/privat',
    groups: ['CUSTOMER_SV_ENERGI'],
    image: '/viskickarvarafakturor.jpg',
    imageAlt: 'Vi skickar våra fakturor digitalt via Kivra',
  },
  {
    id: 1,
    title: 'Avbrottsersättning och skadestånd',
    text: 'När ett sammanhängande avbrott sker, och varar längre än 12 timmar, har du som kund rätt till ersättning.',
    urlTitle: 'Läs mer om avbrottsersättning',
    url: 'https://sundsvallelnat.se/stromavbrott/avbrottsersattning-och-skadestand/',
    groups: ['CUSTOMER_SV_EL'],
    image: '/avbrottsersattning.png',
    imageAlt: 'Avbrottsersättning och skadestånd',
  },
  {
    id: 2,
    title: 'Har du frågor om din elhandelsfaktura?',
    text: 'Med rådande läge på elmarknaden är det många som har frågor om sin faktura och elförbrukning. Vi finns här och hjälper dig att svara på dina frågor och funderingar, vår ambition är alltid att hjälpa till på de bästa sätt vi kan.',
    urlTitle: 'Läs mer',
    url: 'https://sundsvallenergi.se/kundservice/fakturor',
    groups: ['CUSTOMER_SV_ENERGI'],
    image: '/hardufragor.jpg',
    imageAlt: 'Har du frågor om din elhandelsfaktura?',
  },
  {
    id: 3,
    title: 'Kontakta oss',
    text: 'Behöver du komma i kontakt med oss? Fyll i formuläret och ange vad du önskar ha hjälp med, så återkommer vi till dig inom tre arbetsdagar. Är ditt ärende mer brådskande ber vi dig istället att ringa in till oss.',
    urlTitle: 'Skicka in ditt ärende här',
    url: 'https://minasidor.stadsbacken.se/oversikt/flow/225',
    groups: ['CUSTOMER_SV_EL', 'CUSTOMER_SV_ENERGI', 'COMPANY', 'PERSON'],
    image: '/kontaktaoss.jpg',
    imageAlt: 'Kontakta oss',
  },
  {
    id: 4,
    title: 'Dags att flytta? Vi hjälper dig!',
    text: 'Du vet väl om att du smidigt kan ta med dina tjänster och avtal hos Sundsvall Energi och Sundsvall Elnät när flyttlasset går. Du anmäler din flytt här på Mina sidor. Hoppas du ska trivas med oss även på din nya adress!',
    urlTitle: '',
    url: '',
    groups: ['CUSTOMER_SV_EL', 'CUSTOMER_SV_ENERGI', 'PERSON'],
    image: '/dagsattflytta.jpg',
    imageAlt: 'Dags att flytta? Vi hjälper dig!',
  },
  {
    id: 5,
    title: 'Vill du registrera dig för driftavbrottsavisering?',
    text: 'Håll dig uppdaterad om eventuella driftstörningar genom att registrera dig för driftavbrottsavisering. Du kan enkelt hantera dina inställningar för aviseringar och välja hur du blir informerad på "Aviseringar',
    urlTitle: '',
    url: '',
    groups: ['CUSTOMER_SV_EL'],
    image: '/driftavbrottsavisering.jpg',
    imageAlt: 'Vill du registrera dig för driftavbrottsavisering?',
  },
  {
    id: 6,
    title: 'Fjärrkyla',
    text: 'Fjärrkyla från Sundsvall Energi innebär att du köper kyla som är klar för användning, direkt till din fastighet. Vi erbjuder fjärrkyla till exempelvis kontor, shoppingcenter, hotell, industrier och andra lokaler i Sundsvall och Timrå.',
    urlTitle: '',
    url: '',
    groups: ['COMPANY'],
    image: '/fjarrkyla.jpg',
    imageAlt: 'Fjärrkyla',
  },
  {
    id: 7,
    title: 'Laddtjänster för företag och brf',
    text: 'Sundsvall Energi erbjuder tillsammans med Mer en helhetslösning för laddning som anpassas efter era behov. Ni erbjuder laddning, vi sköter resten.',
    urlTitle: '',
    url: '',
    groups: ['COMPANY'],
    image: '/laddning.jpg',
    imageAlt: 'Laddtjänster för företag och brf',
  },
  {
    id: 8,
    title: 'Ladda din elbil snabbt och smidigt',
    text: 'En laddbox ger dig snabbare och säkrare laddning. I vårt sortiment av produkter för laddning i hemmet erbjuder vi laddboxar och installationstjänst i samarbete mellan Sundsvall Energi och Mer.',
    urlTitle: 'Läs mer',
    url: 'https://sundsvallenergi.se/laddboxar-for-hemmet/',
    groups: ['CUSTOMER_SV_ENERGI'],
    image: '/laddning.jpg',
    imageAlt: 'Ladda din elbil snabbt och smidigt',
  },
];

export const Announcements = () => {
  return (
    <section className="pt-80">
      <h3>Nyheter</h3>
      <div className="flex flex-col gap-24 my-24">
        {puffs.map((announcement, index) => {
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
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
