import { useState } from 'react';
import { EligablePartyPart } from '@interfaces/eligibility';
import { Badge, Chip, Label, Spinner, Table, Tabs } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useGetCurrentAndClosedPermissions } from '@services/eligibility-service';

interface CurrentAndClosedEligibilityPermissionsProps {
  customerIds: number[] | undefined;
}

const CurrentAndClosedEligibilityPermissions = ({ customerIds }: CurrentAndClosedEligibilityPermissionsProps) => {
  const { t } = useTranslation('eligibility');
  const [activePanel, setActivePanel] = useState<number>(0);
  const headerLabel = (label: string) => t(`eligibility:permissions.table.header.${label}`);
  const formatDate = (date: string | null) => dayjs(date).format('YYYY-MM-DD');
  const { data: permissions, isLoading, isFetching } = useGetCurrentAndClosedPermissions(customerIds);
  const isLoaded = !isLoading && !isFetching && permissions !== undefined;

  const filterPermissions = (
    ongoing: boolean
  ): { count: number | undefined; items: EligablePartyPart[] | undefined } => {
    const filteredPermissions = permissions?.filter((p) => (p.StatusCategory === 'ongoing') === ongoing);

    return {
      count: filteredPermissions?.length,
      items: filteredPermissions,
    };
  };

  const closedLabel = (statusCategory: EligablePartyPart['StatusCategory']) => {
    return (
      <Label rounded inverted color={statusCategory === 'denied' ? 'error' : 'tertiary'}>
        {t(`eligibility:permissions.table.status.${statusCategory}`)}
      </Label>
    );
  };

  const tabItem = (ongoing: boolean, panelIndex: number) => {
    return (
      <Tabs.Item>
        <Tabs.Button
          rightIcon={<Badge inverted={activePanel !== panelIndex} counter={filterPermissions(ongoing).count} />}
        >
          {t(`eligibility:permissions.${ongoing ? 'current' : 'closed'}`)}
        </Tabs.Button>
        <Tabs.Content>
          <p className="mb-16 mt-24">{t(`eligibility:permissions.description.${ongoing ? 'current' : 'closed'}`)}</p>
          {table(ongoing)}
        </Tabs.Content>
      </Tabs.Item>
    );
  };

  const table = (ongoing: boolean) => {
    return (
      <div className="bg-background-content p-20 rounded-cards shadow-50">
        <Table>
          <Table.Header>
            <Table.HeaderColumn>{headerLabel('company')}</Table.HeaderColumn>
            <Table.HeaderColumn>{headerLabel('address')}</Table.HeaderColumn>
            <Table.HeaderColumn>{headerLabel('service-identifier')}</Table.HeaderColumn>
            <Table.HeaderColumn>{headerLabel('validity-period')}</Table.HeaderColumn>
            <Table.HeaderColumn>{headerLabel(activePanel === 0 ? 'approved' : 'closed')}</Table.HeaderColumn>
            <Table.HeaderColumn />
          </Table.Header>
          <Table.Body>
            {filterPermissions(ongoing).items?.map((p) => {
              return (
                <Table.Row key={p.EligablePartyPermissionId}>
                  <Table.Column>{p.EnergyServiceParty}</Table.Column>
                  <Table.Column>{p.UsePlaceAddress}</Table.Column>
                  <Table.Column>{p.ServiceIdentifier}</Table.Column>
                  <Table.Column>{`${formatDate(p.StartDay)} - ${formatDate(p.EndDay)}`}</Table.Column>
                  <Table.Column>{p.UserHandledTime}</Table.Column>
                  {/* To do: add button for revoke action instead of null in ternary */}
                  <Table.Column>{activePanel === 0 ? null : closedLabel(p.StatusCategory)}</Table.Column>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    );
  };

  return isLoaded ? (
    <Tabs
      className="mt-64"
      onTabChange={(panel) => setActivePanel(panel)}
      underline
      data-cy="current-and-closed-permissions"
    >
      {tabItem(true, 0)}
      {tabItem(false, 1)}
    </Tabs>
  ) : (
    <div className="w-full flex justify-center content-center p-24" data-cy="current-and-closed-permissions-loader">
      <Spinner />
    </div>
  );
};

export default CurrentAndClosedEligibilityPermissions;
