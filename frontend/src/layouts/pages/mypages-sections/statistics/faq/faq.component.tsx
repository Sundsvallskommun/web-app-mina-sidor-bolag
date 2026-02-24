'use client';

import { Accordion, Link } from '@sk-web-gui/react';

export const Faq = () => {
  return (
    <div className="mt-80" data-cy="statistics-faq">
      <h2 className="text-h2-lg">Vanliga frågor och svar om din förbrukning</h2>

      <Accordion className="mt-32">
        <Accordion.Item>
          <Accordion.Item.Header>
            <Accordion.Item.Title>
              <label>Varför saknas statistik för senaste dagarna/timmarna?</label>
            </Accordion.Item.Title>
            <Accordion.Item.Button />
          </Accordion.Item.Header>
          <Accordion.Item.Content>
            <p>
              Avläsningen genererar en fördröjning på ett par dagar/timme och någon dag ytterligare vid månadsskifte.
            </p>
          </Accordion.Item.Content>
        </Accordion.Item>

        <Accordion.Item>
          <Accordion.Item.Header>
            <Accordion.Item.Title>
              <label>Hur tolkar jag statistiken för solceller?</label>
            </Accordion.Item.Title>
            <Accordion.Item.Button />
          </Accordion.Item.Header>
          <Accordion.Item.Content>
            <p>
              Den statistik du ser här avser den el du sålt tillbaka till oss. Samma gäller för din faktura. Exempelvis:
              Vill du en överblick av din solcellsanläggning löpande och totala produktion, är det en teknisk utrustning
              kopplad till själva anläggningen som genererar dessa siffror. Det finns flertalet appar och alternativ på
              marknaden du kan aktivera för detta. Vänd dig till din solcellsleverantör för mer information och
              rådgivning.
            </p>
          </Accordion.Item.Content>
        </Accordion.Item>

        <Accordion.Item>
          <Accordion.Item.Header>
            <Accordion.Item.Title>
              <label>Min förbrukning ser inte ut att stämma?</label>
            </Accordion.Item.Title>
            <Accordion.Item.Button />
          </Accordion.Item.Header>
          <Accordion.Item.Content>
            <p>Kontakta oss så hjälper vi dig.</p>
          </Accordion.Item.Content>
        </Accordion.Item>

        <Accordion.Item>
          <Accordion.Item.Header>
            <Accordion.Item.Title>
              <label>Varför ser jag inte statistik över min förbrukning?</label>
            </Accordion.Item.Title>
            <Accordion.Item.Button />
          </Accordion.Item.Header>
          <Accordion.Item.Content>
            <p>
              Om du inte har samma leverantör av elnät och elavtal så kan du tyvärr inte se din förbrukning här (du
              hittar din förbrukningsstatistik hos ditt elnätsbolag). Gäller det fjärrvärme eller ovan inte stämmer in
              på din situation, kontakta oss för felanmälan på 060-19 22 00 eller{' '}
              <Link href="https://minasidor.stadsbacken.se/oversikt/flow/225" target="_blank">
                via detta formulär
              </Link>{' '}
              så ska vi se över din specifika situation.
            </p>
          </Accordion.Item.Content>
        </Accordion.Item>

        <Accordion.Item>
          <Accordion.Item.Header>
            <Accordion.Item.Title>
              <label>Varför ser jag mina gamla anläggningar?</label>
            </Accordion.Item.Title>
            <Accordion.Item.Button />
          </Accordion.Item.Header>
          <Accordion.Item.Content>
            <p>
              All historik visas 3 år tillbaka för dig som kund, för att du ska kunna jämföra exempelvis förbrukning,
              kostnad etc.
            </p>
          </Accordion.Item.Content>
        </Accordion.Item>

        <Accordion.Item>
          <Accordion.Item.Header>
            <Accordion.Item.Title>
              <label>Varför kan det skilja så mycket i förbrukning mellan månad till månad?</label>
            </Accordion.Item.Title>
            <Accordion.Item.Button />
          </Accordion.Item.Header>
          <Accordion.Item.Content>
            <p>
              Hur varmt eller kallt det är utomhus påverkar din energiförbrukning. Har du gjort andra installationer
              eller förändringar hemma som påverkar er bostad kan det givetvis också spela in på hur mycket värme och el
              som går åt.
            </p>
          </Accordion.Item.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};
