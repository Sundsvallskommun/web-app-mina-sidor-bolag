import { RepresentingEntity } from '@data-contracts/backend/data-contracts';
import { useApi } from '@services/api-service';
import { Button, Icon, List } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileAccordion } from '../profile-accordion.component';
import { CreateMandateModal } from './components/create-mandate-modal/create-mandate-modal.component';
import { ListMandates } from './components/list-mandates/list-mandates.component';

export const Mandates: React.FC = () => {
  const { data: representingEntity } = useApi<RepresentingEntity>({ url: '/representing', method: 'get' });

  const [showCreate, setShowCreate] = useState(false);
  const { t } = useTranslation();

  return (
    representingEntity?.BUSINESS?.isAuthorizedSignatory && (
      <ProfileAccordion
        data-cy="mandate-disclosure"
        title={t('profile:mandates.title')}
        subTitle={t('profile:mandates.description')}
      >
        <>
          {showCreate && <CreateMandateModal open={showCreate} onClose={() => setShowCreate(false)} />}
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
        </>
      </ProfileAccordion>
    )
  );
};
