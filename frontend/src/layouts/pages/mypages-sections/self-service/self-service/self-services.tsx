import { RepresentingMode } from '@interfaces/app';
import { LightbulbIcon, TextIcon, WavesIcon } from 'lucide-react';
import { ReactElement } from 'react';

type SelfServices = Array<{
  id: number;
  name: string;
  category: string | undefined;
  services: {
    id: number;
    title: string;
    description: string;
    url: string;
    icon: ReactElement;
    bgColor: string;
  }[];
}>;

export const selfServices: (representingMode: RepresentingMode) => SelfServices = (representingMode) => {
  const suffix = representingMode === RepresentingMode.PRIVATE ? '?privat' : '';
  return [
    {
      id: 0,
      name: 'Allmänt',
      category: undefined,
      services: [
        {
          id: 0,
          title: 'Hantera dina avtal när du ska flytta',
          description: 'Digitalt formulär som hjälper dig med dina avtal när du ska flytta. ',
          url: 'https://e-tjanster.stadsbacken.se/flytta' + suffix,
          icon: <TextIcon />,
          bgColor: 'bg-background-color-mixin-2',
        },
      ],
    },
    {
      id: 1,
      name: 'Elhandel',
      category: 'Elhandel',
      services: [
        {
          id: 0,
          title: 'Förnyelse av elavtal',
          description: 'Här kan du enkelt förnya elavtal om det löper ut inom 90 dagar.',
          url: 'https://e-tjanster.stadsbacken.se/fornyaelavtal' + suffix,
          icon: <TextIcon />,
          bgColor: 'bg-brand-secondary',
        },
        {
          id: 1,
          title: 'Teckna elavtal – för dig som är ny elkund',
          description: 'Här kan du teckna elavtal med Sundsvall Energi som din elleverantör.',
          url: 'https://e-tjanster.stadsbacken.se/teckna-elavtal' + suffix,
          icon: <TextIcon />,
          bgColor: 'bg-brand-secondary',
        },
        {
          id: 2,
          title: 'Teckna elavtal för dig som idag har anvisat eller rörligt pris',
          description: '',
          url: 'https://e-tjanster.stadsbacken.se/teckna-elavtal' + suffix,
          icon: <TextIcon />,
          bgColor: 'bg-brand-secondary',
        },
      ],
    },
    {
      id: 2,
      name: 'Elnät',
      category: 'El',
      services: [
        {
          id: 1,
          title: 'Aktivera HAN-porten på din smarta elmätare',
          description:
            'Du som privatkund beställer kostnadsfri aktivering av HAN-porten i detta formulär. Är du företagskund behöver du kontakta Kundservice, du kan inte göra aktiveringen via detta formulär.',
          url: 'https://e-tjanster.stadsbacken.se/hanporten' + suffix,
          icon: <LightbulbIcon />,
          bgColor: 'bg-vattjom-surface-accent',
        },
        {
          id: 2,
          title: 'Tillgång till dina kvartsvärden',
          description: 'Via denna e-tjänst kan du beställa ett utdrag av dina insamlade kvartsvärden.',
          url: 'https://e-tjanster.stadsbacken.se/kvartsvarden' + suffix,
          icon: <LightbulbIcon />,
          bgColor: 'bg-vattjom-surface-accent',
        },
        {
          id: 0,
          title: 'Säg upp ditt elnätsavtal med Sundsvall elnät',
          description: '',
          url: 'https://e-tjanster.stadsbacken.se/elnat_uppsagning' + suffix,
          icon: <LightbulbIcon />,
          bgColor: 'bg-vattjom-surface-accent',
        },
      ],
    },
    {
      id: 3,
      name: 'Energitjänster',
      category: 'Fjärrvärme',
      services: [
        {
          id: 0,
          title: 'Serviceavtal – Privat',
          description:
            'Här kan du enkelt signera serviceavtal för ökad trygghet med din fjärrvärmeanläggning.\n' +
            'Serviceavtal privat kostar 100 kronor inklusive moms per månad och fjärrvärmecentral.',
          url: 'https://e-tjanster.stadsbacken.se/serviceavtal-privat' + suffix,
          icon: <TextIcon />,
          bgColor: 'bg-vattjom-surface-accent',
        },
      ],
    },
    {
      id: 4,
      name: 'Fjärrvärme',
      category: 'Fjärrvärme',
      services: [
        {
          id: 0,
          title: 'Flyttanmälan',
          description: 'Här kan du som har fjärrvärme anmäla ägarbyte vid försäljning.',
          url: 'https://e-tjanster.stadsbacken.se/flytta' + suffix,
          icon: <WavesIcon />,
          bgColor: 'bg-brand-secondary',
        },
      ],
    },
  ];
};
