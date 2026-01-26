import { JSX } from 'react';
import { EligablePartyPart } from '@interfaces/eligibility';
import { Table } from '@sk-web-gui/react';

export interface CurrentAndClosedEligibilityPermissionsProps {
  ongoing: boolean;
  activePanel: number;
  headerLabel: (label: string) => string;
  formatDate: (date: string | null) => string;
  filterPermissions: (ongoing: boolean) => EligablePartyPart[];
  revokeActionButton: (p: EligablePartyPart) => JSX.Element;
  handleEndDate: (p: EligablePartyPart) => string | null;
}

const CurrentAndClosedEligibilityPermissionsTable = ({
  ongoing,
  activePanel,
  headerLabel,
  formatDate,
  filterPermissions,
  revokeActionButton,
  handleEndDate,
}: CurrentAndClosedEligibilityPermissionsProps) => {
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
          {filterPermissions(ongoing)?.map((p) => {
            return (
              <Table.Row key={p.EligablePartyPermissionId}>
                <Table.Column>{p.EnergyServiceParty}</Table.Column>
                <Table.Column>{p.UsePlaceAddress}</Table.Column>
                <Table.Column>{p.ServiceIdentifier}</Table.Column>
                <Table.Column>
                  <p className="whitespace-nowrap">{`${formatDate(p.StartDay)} - ${formatDate(p.EndDay)}`}</p>
                </Table.Column>
                <Table.Column>
                  <p className="whitespace-nowrap">{formatDate(handleEndDate(p))}</p>
                </Table.Column>
                <Table.Column>{revokeActionButton(p)}</Table.Column>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};

export default CurrentAndClosedEligibilityPermissionsTable;
