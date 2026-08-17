'use client';

import { cx, Icon, Link } from '@sk-web-gui/react';
import { ExternalLinkIcon } from 'lucide-react';
import { ReactElement } from 'react';

interface ExternalLinkCardProps {
  ID: number;
  Name: string;
  URL: string;
  suffix: string;
  Category: string;
  ShortDescription: string;
  Enabled: boolean;
  icon: ReactElement;
  bgColor: string;
}

export const ExternalLinkCard = (props: ExternalLinkCardProps) => {
  const { Name, ShortDescription, URL, suffix, bgColor, icon } = props;

  return (
    <Link
      className="text-dark-secondary no-underline hover:no-underline hover:text-dark-secondary"
      href={URL + suffix}
      target="_blank"
    >
      <div className="relative flex items-start justify-between gap-14 bg-background-color-mixin-1 rounded-cards shadow-50 p-14 lg:mb-0 mb-24 border-1 ">
        <div>
          <div className={cx(`${bgColor} flex justify-center items-center w-36 h-36 p-4 rounded-button`)}>
            <Icon icon={icon} size={20} />
          </div>
        </div>
        <div className="pt-6">
          <span className="text-large font-bold">{Name}</span>
          <p>{ShortDescription}</p>
        </div>
        <div className="p-6">
          <Icon icon={<ExternalLinkIcon />} size={20} />
        </div>
      </div>
    </Link>
  );
};
