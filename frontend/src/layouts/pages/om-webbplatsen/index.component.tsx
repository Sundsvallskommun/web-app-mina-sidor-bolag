'use client';

import { PagesBreadcrumbsLayout } from '@layouts/pages-breadcrumbs-layout.component';
import { Icon } from '@sk-web-gui/react';
import { ExternalLink } from 'lucide-react';

export default function OmWebbplatsen() {
  const ContentCard = ({ title, text, href, external }) => {
    return (
      <a
        href={href}
        target={external ? '_blank' : '_self'}
        className="p-24 shadow-50 bg-background-content rounded-cards focus:ring"
      >
        <div className="flex items-center">
          <h2 className="sk-link-lg underline">{title}</h2>
          {external && <Icon size={24} className="!pl-0" icon={<ExternalLink />} />}
        </div>
        <p className="text-small">{text}</p>
      </a>
    );
  };

  return (
    <PagesBreadcrumbsLayout>
      <h1>Om webbplatsen</h1>

      <div className="mt-56 grid grid-cols-1 large-device:grid-cols-4 gap-24 justify-start">
        <ContentCard
          title="Kakor (cookies)"
          text="Information om spårningsteknik och om annan användning av personuppgifter på minasidor.stadsbacken.se."
          href="/om-webbplatsen/kakor"
          external={false}
        />

        <ContentCard
          title="Tillgänglighet"
          text="Information om hur webbplatsen uppfyller lagen om tillgänglighet till digital offentlig service."
          href="/om-webbplatsen/tillganglighet"
          external={false}
        />

        <ContentCard
          title="Personuppgifter Sundsvall Energi"
          text="Samlad information om hur vi behandlar dina personuppgifter när du använder Sundsvall Energis tjänster."
          href="https://sundsvallenergi.se/om-oss/detta-ar-vi/anvandarupplevelse/integritetspolicy"
          external={true}
        />

        <ContentCard
          title="Personuppgifter Sundsvall Elnät"
          text="Samlad information om hur vi behandlar dina personuppgifter när du använder Sundsvall Elnäts tjänster."
          href="https://sundsvallelnat.se/om-bolaget/lagar-och-krav/regler-for-hantering-av-personuppgifter"
          external={true}
        />
      </div>
    </PagesBreadcrumbsLayout>
  );
}
