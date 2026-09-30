import { JSX } from 'react';
import { Consent } from '@interfaces/consent';
import { Table } from '@sk-web-gui/react';

export interface CurrentAndClosedConsentsProps {
  ongoing: boolean;
  activePanel: number;
  headerLabel: (label: string) => string;
  formatDate: (date: string | null) => string;
  filterConsents: (ongoing: boolean) => Consent[];
  revokeActionButton: (p: Consent) => JSX.Element;
  handleEndDate: (p: Consent) => string | null;
}

const CurrentAndClosedConsentsTable = ({
  ongoing,
  activePanel,
  headerLabel,
  formatDate,
  filterConsents,
  revokeActionButton,
  handleEndDate,
}: CurrentAndClosedConsentsProps) => {
  return (
    <div className="bg-background-content p-20 rounded-cards shadow-50">
      <Table data-cy="current-and-closed-consents-table">
        <Table.Header>
          <Table.HeaderColumn>{headerLabel('company')}</Table.HeaderColumn>
          <Table.HeaderColumn>{headerLabel('address')}</Table.HeaderColumn>
          <Table.HeaderColumn>{headerLabel('service-identifier')}</Table.HeaderColumn>
          <Table.HeaderColumn>{headerLabel('validity-period')}</Table.HeaderColumn>
          <Table.HeaderColumn>{headerLabel(activePanel === 0 ? 'approved' : 'closed')}</Table.HeaderColumn>
          <Table.HeaderColumn />
        </Table.Header>
        <Table.Body>
          {filterConsents(ongoing)?.map((p) => {
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

export default CurrentAndClosedConsentsTable;
