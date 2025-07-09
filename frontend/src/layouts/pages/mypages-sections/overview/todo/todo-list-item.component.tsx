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
      return <Files />;

    case 'messaging':
      return <Mail />;

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
    <div className="w-full md:flex mb-16 bg-background-content shadow-50 py-16 px-20 rounded-cards justify-between">
      <div className="flex md:items-center md:justify-between">
        <div className="bg-background-color-mixin-2 flex justify-center items-center sm:w-52 sm:h-52 sm:p-0 w-38 h-38 p-6 rounded-button mr-16">
          <Icon icon={IconComponent} size={30} />
        </div>

        <div>
          <p className="text-large font-bold m-0">{title}</p>

          <div className="md:flex items-center text-small text-secondary" data-cy="todo-list-item-subtitle">
            {subTitle}
          </div>
        </div>
      </div>

      <NextLink className="flex md:items-center md:pt-0 pt-32" href={adjustedPath}>
        <Button className="md:w-auto w-full" variant="primary" size="md" rightIcon={<Icon icon={<ChevronRight />} />}>
          {linkText}
        </Button>
      </NextLink>
    </div>
  );
};
