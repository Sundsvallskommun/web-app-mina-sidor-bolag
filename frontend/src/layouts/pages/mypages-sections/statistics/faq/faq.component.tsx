'use client';

import { Accordion, Link } from '@sk-web-gui/react';

export const Faq = () => {
  return (
    <div className="mt-80" data-cy="statistics-faq">
      <h2 className="text-h2-lg">Vanliga frågor och svar om din förbrukning</h2>

      <Accordion className="mt-32">
        <Accordion.Item header="Varför saknas statistik för senaste dagarna/timmarna?">
          <p>Avläsningen genererar en fördröjning på ett par dagar/timme och någon dag ytterligare vid månadsskifte.</p>
        </Accordion.Item>

        <Accordion.Item header="Hur tolkar jag statistiken för solceller?">
          <p>
            Den statistik du ser här avser den el du sålt tillbaka till oss. Samma gäller för din faktura. Exempelvis:
            Vill du en överblick av din solcellsanläggning löpande och totala produktion, är det en teknisk utrustning
            kopplad till själva anläggningen som genererar dessa siffror. Det finns flertalet appar och alternativ på
            marknaden du kan aktivera för detta. Vänd dig till din solcellsleverantör för mer information och
            rådgivning.
          </p>
        </Accordion.Item>

        <Accordion.Item header="Min förbrukning ser inte ut att stämma?">
          <p>Kontakta oss så hjälper vi dig.</p>
        </Accordion.Item>

        <Accordion.Item header="Varför ser jag inte statistik över min förbrukning?">
          <p>
            Om du inte har samma leverantör av elnät och elavtal så kan du tyvärr inte se din förbrukning här (du hittar
            din förbrukningsstatistik hos ditt elnätsbolag). Gäller det fjärrvärme eller ovan inte stämmer in på din
            situation, kontakta oss för felanmälan på 060-19 22 00 eller{' '}
            <Link href="https://minasidor.stadsbacken.se/oversikt/flow/225" target="_blank">
              via detta formulär
            </Link>{' '}
            så ska vi se över din specifika situation.
          </p>
        </Accordion.Item>

        <Accordion.Item header="Varför ser jag mina gamla anläggningar?">
          <p>
            All historik visas 3 år tillbaka för dig som kund, för att du ska kunna jämföra exempelvis förbrukning,
            kostnad etc.
          </p>
        </Accordion.Item>

        <Accordion.Item header="Varför kan det skilja så mycket i förbrukning mellan månad till månad?">
          <p>
            Hur varmt eller kallt det är utomhus påverkar din energiförbrukning. Har du gjort andra installationer eller
            förändringar hemma som påverkar er bostad kan det givetvis också spela in på hur mycket värme och el som går
            åt.
          </p>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};
