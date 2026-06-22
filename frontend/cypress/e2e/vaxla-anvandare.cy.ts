import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getUserEngagements } from '../fixtures/impersonation';
import { getMeEmptyUser, getMeEmptyUserExtendedView } from '../fixtures/getMe';
import { getPendingInvoices } from '../fixtures/getInvoices';
import { getEmptyBfusCustomerIds } from '../fixtures/getBfusCustomerIds';
import { getEmptyBfusPartyPermissions } from '../fixtures/getBfusPartyPermissions';

describe('Växla användare', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/bfus/eligable-party-customer-id', getEmptyBfusCustomerIds(RepresentingMode.PRIVATE));
    cy.intercept('GET', '**/api/bfus/new-permissions?**', getEmptyBfusPartyPermissions());
    cy.intercept('GET', '**/api/invoices/pending?**', getPendingInvoices());
  });

  it('can impersonate user', () => {
    cy.visit('/admin');
    cy.get('h1').should('exist').should('contain.text', 'Administration');
    cy.get('button').should('exist').should('contain.text', 'Växla användare').click({ multiple: true });

    cy.intercept('POST', '**/api/user-engagements', getUserEngagements).as('getUserEngagements');
    cy.intercept('POST', '**/api/impersonate-user', getMeEmptyUserExtendedView).as('impersonateUser');

    cy.get('[data-cy="extended-view-banner"]').should('not.exist');

    cy.get('[data-cy="search-user-to-impersonate"]').should('exist').type('199001012385');
    cy.get('button').contains('Sök').click();
    cy.wait('@getUserEngagements');
    cy.get('[data-cy="user-to-impersonate-radio-button"]').should('exist').click();

    // User should not be able to proceed without selecting access reason
    cy.get('[data-cy="access-reason-error"]').should('not.exist');
    cy.get('[data-cy="submit-button"]').should('exist').click();
    cy.get('[data-cy="access-reason-error"]').should('exist');
    cy.get('[data-cy="access-reason"]').should('exist').select(1);

    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@impersonateUser');
    cy.intercept('GET', '**/api/me', getMeEmptyUserExtendedView);

    cy.get('[data-cy="extended-view-banner"]').should('exist');
  });

  it('user without permission should not be able to reach /vaxla-anvandare', () => {
    cy.intercept('GET', '**/api/me', getMeEmptyUser);
    cy.visit('/admin');
    cy.get('h1').should('contain.text', 'Administratörsinloggning');
  });
});
