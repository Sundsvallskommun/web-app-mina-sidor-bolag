'use client';

import { Card } from '@sk-web-gui/react';

export const mockData = [
  {
    id: 0,
    title: 'Vi skickar våra fakturor digitalt via Kivra',
    text: 'För att underlätta för våra kunder så skickar vi våra fakturor via Kivra, en tjänst där du både kan se och betala din faktura digitalt. Läs mer på https://kivra.se eller ladda ner Kivra som app i din telefon. Har du inte Kivra? I så fall kommer du få din faktura med brev, och om du valt e-faktura till din internetbank kommer du istället få din faktura dit. Om du har Kivra till andra tjänster, men önskar att dina fakturor från Sundsvall Energi inte ska skickas till hit, så ber vi dig vänligen att kontakta Kivra direkt.',
    urlTitle: 'Läs mer om Kivra',
    url: 'https://kivra.se/sv/privat',
    groups: ['CUSTOMER_SV_ENERGI'],
  },
  {
    id: 1,
    title: 'Avbrottsersättning och skadestånd',
    text: 'När ett sammanhängande avbrott sker, och varar längre än 12 timmar, har du som kund rätt till ersättning.',
    urlTitle: 'Läs mer om avbrottsersättning',
    url: 'https://sundsvallelnat.se',
    groups: ['CUSTOMER_SV_EL'],
  },
  {
    id: 2,
    title: 'Har du frågor om din elhandelsfaktura?',
    text: 'Med rådande läge på elmarknaden är det många som har frågor om sin faktura och elförbrukning. Vi finns här och hjälper dig att svara på dina frågor och funderingar, vår ambition är alltid att hjälpa till på de bästa sätt vi kan.',
    urlTitle: 'Läs mer',
    url: 'https://sundsvallenergi.se/kundservice/fakturor',
    groups: ['CUSTOMER_SV_ENERGI'],
  },
  {
    id: 3,
    title: 'Kontakta oss',
    text: 'Behöver du komma i kontakt med oss? Fyll i formuläret och ange vad du önskar ha hjälp med, så återkommer vi till dig inom tre arbetsdagar. Är ditt ärende mer brådskande ber vi dig istället att ringa in till oss.',
    urlTitle: '',
    url: '',
    groups: ['CUSTOMER_SV_EL', 'CUSTOMER_SV_ENERGI', 'COMPANY', 'PERSON'],
  },
  {
    id: 4,
    title: 'Dags att flytta? Vi hjälper dig!',
    text: 'Du vet väl om att du smidigt kan ta med dina tjänster och avtal hos Sundsvall Energi och Sundsvall Elnät när flyttlasset går. Du anmäler din flytt här på Mina sidor. Hoppas du ska trivas med oss även på din nya adress!',
    urlTitle: '',
    url: '',
    groups: ['CUSTOMER_SV_EL', 'CUSTOMER_SV_ENERGI', 'PERSON'],
  },
  {
    id: 5,
    title: 'Vill du registrera dig för driftavbrottsavisering?',
    text: 'Håll dig uppdaterad om eventuella driftstörningar genom att registrera dig för driftavbrottsavisering. Du kan enkelt hantera dina inställningar för aviseringar och välja hur du blir informerad på "Aviseringar',
    urlTitle: '',
    url: '',
    groups: ['CUSTOMER_SV_EL'],
  },
  {
    id: 6,
    title: 'Fjärrkyla',
    text: 'Fjärrkyla från Sundsvall Energi innebär att du köper kyla som är klar för användning, direkt till din fastighet. Vi erbjuder fjärrkyla till exempelvis kontor, shoppingcenter, hotell, industrier och andra lokaler i Sundsvall och Timrå.',
    urlTitle: '',
    url: '',
    groups: ['COMPANY'],
  },
  {
    id: 7,
    title: 'Laddtjänster för företag och brf',
    text: 'Sundsvall Energi erbjuder tillsammans med Mer en helhetslösning för laddning som anpassas efter era behov. Ni erbjuder laddning, vi sköter resten.',
    urlTitle: '',
    url: '',
    groups: ['COMPANY'],
  },
  {
    id: 8,
    title: 'Ladda din elbil snabbt och smidigt',
    text: 'En laddbox ger dig snabbare och säkrare laddning. I vårt sortiment av produkter för laddning i hemmet erbjuder vi laddboxar och installationstjänst i samarbete mellan Sundsvall Energi och Mer.',
    urlTitle: '',
    url: '',
    groups: ['CUSTOMER_SV_ENERGI'],
  },
];

export const Announcements = () => {
  return (
    <section className="pt-80">
      <h3>Aktuellt</h3>

      <div className="grid lg:grid-cols-3 md:gap-24 md:grid-cols-2 pt-32 grid-cols-1">
        {mockData.map((announcement, index) => {
          return (
            <Card key={index} href={announcement.url} target="_blank" className="md:mb-0 mb-24" useHoverEffect>
              <Card.Image src="/placeholder_1.png" />

              <Card.Body>
                <Card.Header>
                  <h2>{announcement.title}</h2>
                </Card.Header>
                <Card.Text>
                  <p>{announcement.text}</p>
                </Card.Text>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
