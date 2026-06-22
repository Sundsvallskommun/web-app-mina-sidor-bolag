'use client';

import { Accordion, Icon } from '@sk-web-gui/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode } from 'react';

export interface StatisticsFilterAccordionItemProps {
  label: string;
  subtitle: string;
  children: ReactNode;
}

export const StatisticsFilterAccordionItem = ({
  label,
  subtitle,
  children,
}: StatisticsFilterAccordionItemProps) => (
  <Accordion.Item>
    <Accordion.Item.Header>
      <Accordion.Item.Title>
        <div className="flex flex-col gap-6 text-left">
          <label className="text-h4-sm">{label}</label>
          {subtitle && <span className="text-small text-dark-secondary font-normal">{subtitle}</span>}
        </div>
      </Accordion.Item.Title>
      <Accordion.Item.Button>
        {(open: boolean) => <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />}
      </Accordion.Item.Button>
    </Accordion.Item.Header>
    <Accordion.Item.Content>{children}</Accordion.Item.Content>
  </Accordion.Item>
);
