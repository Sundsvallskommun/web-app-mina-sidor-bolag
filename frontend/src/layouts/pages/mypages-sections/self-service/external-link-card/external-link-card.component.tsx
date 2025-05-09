'use client';

import { Icon, Link } from '@sk-web-gui/react';
import { ExternalLinkIcon } from 'lucide-react';

interface ExternalLinkCardProps {
  title: string;
  description: string;
  url: string;
}

export const ExternalLinkCard = (props: ExternalLinkCardProps) => {
  const { title, description, url } = props;

  return (
    <div className="bg-background-color-mixin-1 rounded-cards shadow-50 p-14 lg:mb-0 mb-24 border-1 border-divider">
      <Link className="font-bold text-dark-secondary" href={url} target="_blank">
        {title}
      </Link>
      <Icon icon={<ExternalLinkIcon />} size={14} />
      <p className="text-small">{description}</p>
    </div>
  );
};
