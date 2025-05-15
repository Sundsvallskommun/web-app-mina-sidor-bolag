'use client';

import { useAppContext } from '@contexts/app.context';
import { Button, Icon } from '@sk-web-gui/react';
import { getAdjustedPathname } from '@utils/representingModeRoute';
import { ChevronRight, Files, Mail } from 'lucide-react';
import NextLink from 'next/link';

type TodoTypeUnion = 'messaging' | 'invoices';

interface TodoListItemProps {
  type: TodoTypeUnion;
  title: string;
  subTitle?: string;
  linkText: string;
  linkPath: string;
}

const getIcon = (type: TodoTypeUnion) => {
  switch (type) {
    case 'invoices':
      return <Files/>;

    case 'messaging':
      return <Mail/>;

    default:
      return <></>;
  }
};

export const TodoListItem = (props: TodoListItemProps) => {
  const { type, title, subTitle, linkText, linkPath } = props;
  const { representingMode } = useAppContext();

  const adjustedPath = getAdjustedPathname(linkPath, representingMode);

  const IconComponent = getIcon(type);

  return (
    <div className="w-full flex mb-16 bg-background-content shadow-50 py-16 px-20 rounded-cards justify-between">
      <div className="flex lg:items-center justify-between">
        <div className="bg-background-color-mixin-2 flex justify-center items-center w-52 h-52 rounded-button mr-16">
          <Icon icon={IconComponent} size={30} />
        </div>

        <div>
          <p className="text-large font-bold">{title}</p>

          <div className="lg:flex items-center text-small text-secondary">{subTitle}</div>
        </div>
      </div>

      <NextLink className="flex lg:items-center" href={adjustedPath}>
        <Button
          variant="primary"
          size="lg"
          rightIcon={<Icon icon={<ChevronRight />} />}
        >
            { linkText }
        </Button>
      </NextLink>
    </div>
  );
};
