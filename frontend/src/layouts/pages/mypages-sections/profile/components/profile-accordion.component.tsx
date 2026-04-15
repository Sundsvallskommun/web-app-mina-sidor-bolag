import { Disclosure, DisclosureProps, Divider, Icon } from '@sk-web-gui/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProfileAccordionProp extends React.ComponentPropsWithoutRef<DisclosureProps> {
  title: string;
  subTitle: string;
  children: React.ReactNode;
}

export const ProfileAccordion: React.FC<ProfileAccordionProp> = (props) => {
  const { title, subTitle, children, ...rest } = props;
  return (
    <Disclosure className="bg-background-content px-24 py-8 rounded-button shadow-50" size="lg" {...rest}>
      <Disclosure.Header>
        <Disclosure.Title className="flex-col items-start gap-4">
          <h2 className="text-h4-md">{title}</h2>
          <p className="text-base font-normal m-0">{subTitle}</p>
        </Disclosure.Title>
        <Disclosure.Button>
          {(open: boolean) => <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />}
        </Disclosure.Button>
      </Disclosure.Header>
      <Disclosure.Content>
        <div className="-ml-24 -mr-68 pt-6">
          <Divider />
          <div className="py-32 px-24">{children}</div>
        </div>
      </Disclosure.Content>
    </Disclosure>
  );
};
