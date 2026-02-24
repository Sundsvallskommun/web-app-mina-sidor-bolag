import { Button, Disclosure, Divider, Icon, List } from '@sk-web-gui/react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateMandateModal } from './components/create-mandate-modal/create-mandate-modal.component';
import { ListMandates } from './components/list-mandates/list-mandates.component';
import { useApi } from '@services/api-service';
import { RepresentingEntity } from '@data-contracts/backend/data-contracts';

export const Mandates: React.FC = () => {
  const { data: representingEntity } = useApi<RepresentingEntity>({ url: '/representing', method: 'get' });

  const [showCreate, setShowCreate] = useState(false);
  const { t } = useTranslation();

  return (
    representingEntity?.BUSINESS?.isAuthorizedSignatory && (
      <Disclosure
        className="bg-background-content px-24 py-8 rounded-button shadow-50"
        data-cy="mandate-disclosure"
        size="lg"
      >
        <Disclosure.Header>
          <Disclosure.Title className="flex-col items-start gap-4">
            <h2 className="text-h4-md">{t('profile:mandates.title')}</h2>
            <p className="text-base font-normal m-0">{t('profile:mandates.description')}</p>
          </Disclosure.Title>
          <Disclosure.Button>
            {(open: boolean) => <Icon icon={open ? <ChevronUp /> : <ChevronDown />} />}
          </Disclosure.Button>
        </Disclosure.Header>
        <Disclosure.Content>
          <div className="-ml-24 -mr-68">
            {showCreate && <CreateMandateModal open={showCreate} onClose={() => setShowCreate(false)} />}
            <Divider />
            <div className="px-24 pt-32 pb-16 flex flex-col gap-40">
              <div className="max-w-[80rem]">
                <p>{t('profile:mandates.information')}</p>
                <List listStyle="bullet">
                  <List.Item className="p-0 before:!m-0">
                    <List.Text>{t('profile:mandates.bullets.1')}</List.Text>
                  </List.Item>
                  <List.Item className="p-0 before:!m-0">
                    <List.Text>{t('profile:mandates.bullets.2')}</List.Text>
                  </List.Item>
                  <List.Item className="p-0 before:!m-0">
                    <List.Text>{t('profile:mandates.bullets.3')}</List.Text>
                  </List.Item>
                  <List.Item className="p-0 before:!m-0">
                    <List.Text>{t('profile:mandates.bullets.4')}</List.Text>
                  </List.Item>
                </List>
              </div>
              <Button
                data-cy="create-mandate-button"
                className="w-fit grow-0"
                leftIcon={<Icon icon={<Plus />} />}
                onClick={() => setShowCreate(true)}
              >
                {t('profile:mandates.create_new')}
              </Button>
              <ListMandates />
            </div>
          </div>
        </Disclosure.Content>
      </Disclosure>
    )
  );
};
