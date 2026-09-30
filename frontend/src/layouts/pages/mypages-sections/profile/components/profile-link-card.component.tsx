import { Icon } from '@sk-web-gui/react';
import { ChevronRight } from 'lucide-react';
import NextLink from 'next/link';

interface ProfileLinkCardProps {
  title: string;
  subTitle: string;
  href: string;
  'data-cy'?: string;
}

export const ProfileLinkCard: React.FC<ProfileLinkCardProps> = ({ title, subTitle, href, ...rest }) => {
  return (
    <NextLink
      href={href}
      className="bg-background-content px-24 py-20 rounded-button shadow-50 flex items-center justify-between gap-16 no-underline"
      {...rest}
    >
      <span className="flex flex-col gap-4">
        <h2 className="text-h4-md m-0">{title}</h2>
        <p className="text-base font-normal m-0">{subTitle}</p>
      </span>
      <Icon icon={<ChevronRight />} />
    </NextLink>
  );
};
