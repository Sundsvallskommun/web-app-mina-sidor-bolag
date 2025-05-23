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

export const selfServices: SelfServices = [
  {
    id: 0,
    name: 'Allmänt',
    category: undefined,
    services: [
      {
        id: 0,
        title: 'Hantera dina avtal när du ska flytta',
        description: 'Digitalt formulär som hjälper dig med dina avtal när du ska flytta. ',
        url: 'https://e-tjanster.stadsbacken.se/flytta',
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
        url: 'https://e-tjanster.stadsbacken.se/fornyaelavtal',
        icon: <TextIcon />,
        bgColor: 'bg-warning-background-200',
      },
      {
        id: 1,
        title: 'Teckna elavtal – för dig som är ny elkund',
        description: 'Här kan du teckna elavtal med Sundsvall Energi som din elleverantör.',
        url: 'https://e-tjanster.stadsbacken.se/teckna-elavtal',
        icon: <TextIcon />,
        bgColor: 'bg-warning-background-200',
      },
      {
        id: 2,
        title: 'Teckna elavtal för dig som idag har anvisat eller rörligt pris',
        description: '',
        url: 'https://e-tjanster.stadsbacken.se/teckna-elavtal',
        icon: <TextIcon />,
        bgColor: 'bg-warning-background-200',
      },
    ],
  },
  {
    id: 2,
    name: 'Elnät',
    category: 'El',
    services: [
      {
        id: 0,
        title: 'Säg upp ditt elnätsavtal med Sundsvall elnät',
        description: '',
        url: 'https://e-tjanster.stadsbacken.se/elnat_uppsagning',
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
        url: 'https://e-tjanster.stadsbacken.se/serviceavtal-privat',
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
        url: 'https://e-tjanster.stadsbacken.se/flytta',
        icon: <WavesIcon />,
        bgColor: 'bg-warning-background-200',
      },
    ],
  },
];
