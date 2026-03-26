import { RepresentingMode } from '@interfaces/app';
import { setIntercepts } from '../support/e2e';
import { getBfusPartyPermissions } from 'cypress/fixtures/getBfusPartyPermissions';

describe('Dina medgivanden', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept(
      'GET',
      '**/api/bfus/eligable-party-permissions?customerIds=12345678',
      getBfusPartyPermissions(RepresentingMode.PRIVATE)
    ).as('getPartyPermissions');
  });

  it('should render list items for new eligibility permissions', () => {
    handleVisitWait();
    getBfusPartyPermissions(RepresentingMode.PRIVATE).data.eligablePartyParts.forEach((part) => {
      if (part.StatusCategory === 'new') {
        cy.get(`[data-cy="new-permissions-card-${part.EnergyServiceParty}"]`).should('exist');
      }
    });
  });

  it('should render a table for current and closed eligibility permissions', () => {
    handleVisitWait();
    cy.wait('@getPartyPermissions', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
    cy.get('[data-cy="current-and-closed-permissions-loader"]').should('not.exist');
    cy.get('[data-cy="revoke-button"]').should('exist').contains('Återkalla medgivande');
    cy.get('[data-cy="current-and-closed-permissions"]').find('table').should('exist');
    cy.get('button').contains('Avslutade').click();
    cy.get('[data-cy="revoke-button"]').should('not.exist');
  });

  it('can approve permission', () => {
    cy.intercept(
      'POST',
      '**/api/bfus/eligable-party-grant-permission',
      getBfusPartyPermissions(RepresentingMode.PRIVATE)
    ).as('getPartyPermissions');
    handleVisitWait();
    cy.get('[data-cy="new-permissions-card-99887 - Demo Grid Services"]')
      .should('exist')
      .within(() => {
        cy.get('[data-cy="approveOne"]').should('exist').click();
      });
  });

  it('can handle and deny permissions', () => {
    cy.intercept(
      'POST',
      '**/api/bfus/eligable-party-deny-permission',
      getBfusPartyPermissions(RepresentingMode.PRIVATE)
    ).as('getPartyPermissions');
    handleVisitWait();

    // New permission requests with multiple facilities that have already been handled (individual facilities have been approved) can not be denied
    cy.get('[data-cy="new-permissions-card-99887 - Demo Grid Services"]')
      .should('exist')
      .within(() => {
        cy.get('[data-cy="denyRequest"]').should('be.disabled');
      });

    cy.get('[data-cy="new-permissions-card-45210 - Test Energy Service AB"]')
      .should('exist')
      .within(() => {
        cy.get('[data-cy="denyRequest"]').should('exist').click();
      });
  });

  it('can revoke permission', () => {
    cy.intercept(
      'POST',
      '**/api/bfus/eligable-party-revoke-permission',
      getBfusPartyPermissions(RepresentingMode.PRIVATE)
    ).as('getPartyPermissions');
    handleVisitWait();

    cy.get('[data-cy="current-and-closed-permissions-table"]').should('exist');
    cy.get('[data-cy="revoke-button"]').should('exist').contains('Återkalla medgivande').click();
  });

  it('can handle user with customerIds, without any permissions', () => {
    cy.intercept('GET', '**/api/bfus/eligable-party-permissions?customerIds=12345678', { fixture: null }).as(
      'getPartyPermissions'
    );
    handleVisitWait();
    cy.get('[data-cy="no-data"]').should('exist').contains('Du har inga medgivanden.');
  });

  it('can handle user without customerIds or permissions', () => {
    cy.intercept('GET', '**/api/bfus/eligable-party-customer-id', { fixture: null }).as('getCustomerIds');
    cy.intercept('GET', '**/api/bfus/eligable-party-permissions?customerIds=12345678', { fixture: null });
    cy.visit('/privat/medgivanden');

    cy.get('[data-cy="no-customer-id"]').should('exist').contains('Kunde inte hitta något kund-id. Försök igen.');
  });
});

const handleVisitWait = () => {
  cy.visit('/privat/medgivanden');
  cy.wait('@getCustomerIds').its('response.body.data.customerIds').should('deep.equal', [12345678]);
};
