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
  });

  it('should render a table for current and closed eligibility permissions', () => {
    cy.wait('@getCustomerIds').its('response.body.data.customerIds').should('deep.equal', [12345678]);
    cy.get('[data-cy="current-and-closed-permissions-loader"]').should('exist');
    cy.wait('@getPartyPermissions', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
    cy.get('[data-cy="current-and-closed-permissions-loader"]').should('not.exist');
    cy.get('[data-cy="current-and-closed-permissions"]').find('table').should('exist');
  });
});
