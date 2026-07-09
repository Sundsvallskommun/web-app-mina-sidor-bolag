import { RepresentingMode } from '@interfaces/app';
import { setIntercepts } from '../support/e2e';
import { getBFUSConsents } from '../fixtures/getBFUSConsents';
import { Consent } from '@interfaces/consent';

describe('Dina medgivanden', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/bfus/consents?customerIds=12345678', getBFUSConsents(RepresentingMode.PRIVATE)).as(
      'getConsents'
    );
  });

  it('should render list items for new consents', () => {
    handleVisitWait();
    getBFUSConsents(RepresentingMode.PRIVATE).data.consents.forEach((consent: Consent) => {
      if (consent.StatusCategory === 'new') {
        cy.get(`[data-cy="new-consents-card-${consent.EnergyServiceParty}"]`).should('exist');
      }
    });
  });

  it('should render a table for current and closed consents', () => {
    handleVisitWait();
    cy.wait('@getConsents', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
    cy.get('[data-cy="current-and-closed-consents-loader"]').should('not.exist');
    cy.get('[data-cy="revoke-button"]').should('exist').contains('Återkalla medgivande');
    cy.get('[data-cy="current-and-closed-consents"]').find('table').should('exist');
    cy.get('button').contains('Avslutade').click();
    cy.get('[data-cy="revoke-button"]').should('not.exist');
  });

  it('can approve consent', () => {
    cy.intercept('POST', '**/api/bfus/consent/grant', getBFUSConsents(RepresentingMode.PRIVATE)).as('getConsents');
    handleVisitWait();
    cy.get('[data-cy="new-consents-card-99887 - Demo Grid Services"]')
      .should('exist')
      .within(() => {
        cy.get('[data-cy="approveOne"]').should('exist').click();
      });
  });

  it('can handle and deny consents', () => {
    cy.intercept('POST', '**/api/bfus/consent/deny', getBFUSConsents(RepresentingMode.PRIVATE)).as('getConsents');
    handleVisitWait();

    // New consent requests with multiple facilities that have already been handled (individual facilities have been approved) can not be denied
    cy.get('[data-cy="new-consents-card-99887 - Demo Grid Services"]')
      .should('exist')
      .within(() => {
        cy.get('[data-cy="denyRequest"]').should('be.disabled');
      });

    cy.get('[data-cy="new-consents-card-45210 - Test Energy Service AB"]')
      .should('exist')
      .within(() => {
        cy.get('[data-cy="denyRequest"]').should('exist').click();
      });
  });

  it('can revoke consent', () => {
    cy.intercept('POST', '**/api/bfus/consent/revoke', getBFUSConsents(RepresentingMode.PRIVATE)).as('getConsents');
    handleVisitWait();

    cy.get('[data-cy="current-and-closed-consents-table"]').should('exist');
    cy.get('[data-cy="revoke-button"]').should('exist').contains('Återkalla medgivande').click();
  });

  it('can handle user with customerIds, without any consents', () => {
    cy.intercept('GET', '**/api/bfus/consents?customerIds=12345678', { fixture: null }).as('getConsents');
    handleVisitWait();
    cy.get('[data-cy="no-data"]').should('exist').contains('Du har inga medgivanden.');
  });

  it('can handle user without customerIds or consents', () => {
    cy.intercept('GET', '**/api/bfus/eligable-party-customer-id', { fixture: null }).as('getCustomerIds');
    cy.intercept('GET', '**/api/bfus/consents?customerIds=12345678', { fixture: null }).as('getConsents');
    cy.visit('/privat/medgivanden');
    cy.get('[data-cy="no-customer-id"]').should('exist').contains('Du har just nu inga medgivanden.');
  });
});

const handleVisitWait = () => {
  cy.visit('/privat/medgivanden');
  cy.wait('@getCustomerIds').its('response.body.data.customerIds').should('deep.equal', [12345678]);
};
