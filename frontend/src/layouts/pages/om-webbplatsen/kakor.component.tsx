'use client';

import { Breadcrumb, Button, CookieConsentUtils } from '@sk-web-gui/react';
import { PagesBreadcrumbsLayout } from '../../../layouts/pages-breadcrumbs-layout.component';
import NextLink from 'next/link';
const pageName = 'Kakor (cookies)';

export default function Kakor() {
  const handleCookies = () => {
    CookieConsentUtils.resetConsent();
    location.reload();
  };

  return (
    <PagesBreadcrumbsLayout
      breadcrumbs={
        <Breadcrumb className="">
          <Breadcrumb.Item>
            <NextLink href="/om-webbplatsen">
              <Breadcrumb.Link variant="body" as="span" href="/om-webbplatsen">
                Om webbplatsen
              </Breadcrumb.Link>
            </NextLink>
          </Breadcrumb.Item>

          <Breadcrumb.Item currentPage>
            <Breadcrumb.Link href="/om-webbplatsen/kakor">{pageName}</Breadcrumb.Link>
          </Breadcrumb.Item>
        </Breadcrumb>
      }
    >
      <div className="text-content">
        <h1>{pageName}</h1>
        <div className="flex flex-col gap-y-40">
          <div className="text-lead">När du besöker minasidor.stadsbacken.se lagras kakor på din dator.</div>
          <div>
            <p>
              En kaka är en textfil som används för att förenkla ditt besök på vår webbplats och göra det möjligt att
              använda vissa funktioner. minasidor.stadsbacken.se använder inga kakor som sparar personlig information om
              dig.
            </p>
            <p>
              När du besöker minasidor.stadsbacken.se lagras kakor på din dator. Sundsvalls kommun använder två olika
              typer av kakor: Nödvändiga och analytiska kakor.
            </p>
            <p>
              Nödvändiga kakor lagras tillfälligt i din dator och förbättrar din användarupplevelse. Dessa kakor kallas
              för sessionskakor och försvinner när du stänger webbläsaren.
            </p>
            <p>
              Analytiska kakor används för att analysera och förstå hur du använder webbplatsen. Dessa kakor sparar vi
              bara om vi får ditt samtycke. Dessa kakor kan lagras under en längre tid på din dator, en så kallad
              permanent kaka.
            </p>
            <p>
              minasidor.stadsbacken.se använder funktionalitet från externa webbplatser som i sin tur lagrar kakor när
              du besöker dessa sidor. Dessa sidor och dess funktionalitet är följande;
            </p>
          </div>
          <div>
            <h2 className="text-h4-md">Våra nödvändiga kakor</h2>
            <p>
              Namn: SKCookieConsent.
              <br />
              Används av: minasidor.stadsbacken.se.
              <br />
              Typ av kaka: Ett års kaka.
              <br />
              Den här kakan sätts när du accepterar kakor på minasidor.stadsbacken.se och används för att hålla reda på
              att du godkänt kakor.
            </p>
            <p>
              Namn: connect.sid.
              <br />
              Används av: minasidor.stadsbacken.se.
              <br />
              Typ av kaka: Sessionskaka.
              <br />
              Används för att hålla reda på användarbehörigheter.
            </p>
          </div>
          <div>
            <h2 className="text-h4-md">Hantera kakor</h2>
            <p className="my-16">
              Du kan ta bort kakor i din webbläsare eller via nedan länk &quot;Hantera kakor (cookies)&quot;
            </p>
            <Button className="mt-16" color="vattjom" onClick={handleCookies}>
              Hantera kakor (cookies)
            </Button>
          </div>
        </div>
      </div>
    </PagesBreadcrumbsLayout>
  );
}
