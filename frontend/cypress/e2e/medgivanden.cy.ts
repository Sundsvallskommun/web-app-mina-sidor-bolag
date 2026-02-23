import { RepresentingMode } from '@interfaces/app';
import { setIntercepts } from '../support/e2e';
import { getBfusCustomerIds } from 'cypress/fixtures/getBfusCustomerIds';
import { getBfusPartyPermissions } from 'cypress/fixtures/getBfusPartyPermissions';

describe('Dina medgivanden', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/bfus/eligable-party-customer-id', getBfusCustomerIds(RepresentingMode.PRIVATE)).as(
      'getCustomerIds'
    );
    cy.intercept(
      'GET',
      '**/api/bfus/eligable-party-permissions?customerIds=12345678',
      getBfusPartyPermissions(RepresentingMode.PRIVATE)
    ).as('getPartyPermissions');
    cy.visit('/privat/medgivanden');
    cy.wait('@getCustomerIds').its('response.body.data.customerIds').should('deep.equal', [12345678]);
  });

  it('should render card and table for new eligibility permissions', () => {
    const permissionCard = cy.get('[data-cy="new-permissions-card"]');
    permissionCard.find('h4').should('have.text', '99887 - Demo Grid Services');
    cy.get('[data-cy="new-permissions-table"]').should('exist').should('have.length', 1);
  });

  it('should render a table for new and current and closed eligibility permissions', () => {
    cy.get('[data-cy="current-and-closed-permissions-loader"]').should('exist');
    cy.wait('@getPartyPermissions', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
    cy.get('[data-cy="current-and-closed-permissions-loader"]').should('not.exist');
    cy.get('[data-cy="current-and-closed-permissions"]').find('table').should('exist');
  });

  it('can approve permission', () => {
    cy.get('[data-cy="new-permissions-table"]')
      .should('exist')
      .within(() => {
        cy.get('[data-cy="approveOne"]').should('exist').click();
      });
  });
});
