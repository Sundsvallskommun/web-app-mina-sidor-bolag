import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '../../src/interfaces/app';
import { isReady } from 'cypress/fixtures/ai';
import { getPendingInvoices } from '../fixtures/getInvoices';
import { getBfusPartyPermissions } from 'cypress/fixtures/getBfusPartyPermissions';

describe('Corner Assistant', () => {
  before(() => {
    if (Cypress.env('aiAssistantEnabled') !== 'true') {
      cy.log('NEXT_PUBLIC_FEATURE_AI_ASSISTANT is not enabled, skipping tests');
    }
  });

  beforeEach(function () {
    if (Cypress.env('aiAssistantEnabled') !== 'true') {
      this.skip();
    }
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/invoices/pending?**', getPendingInvoices()).as('getPendingInvoices');
    cy.intercept('GET', '**/api/ai/isReady', {
      data: { status: 'PENDING', details: 'pending' },
      message: 'pending',
    }).as('AIisReadyPending');
    cy.intercept(
          'GET',
          '**/api/bfus/new-permissions?customerIds=12345678',
          getBfusPartyPermissions(RepresentingMode.PRIVATE)
        ).as('getNewPermissions');
    cy.visit('/privat/oversikt');
  });

  it('should render loading state until ready', () => {
    cy.wait('@AIisReadyPending');
    cy.get('[data-cy="corner-assistant-state"]').should('include.text', 'Förbereder din assistent...');
    cy.intercept('GET', '**/api/ai/isReady', isReady(true)).as('AIisReadyDone');
    cy.wait('@AIisReadyDone', { timeout: 10000 });
    cy.get('[data-cy="corner-assistant"]').should('include.text', 'Assistent');
  });

  it('should render loading state until fail', () => {
    cy.wait('@AIisReadyPending');
    cy.get('[data-cy="corner-assistant-state"]').should('include.text', 'Förbereder din assistent...');
    cy.intercept('GET', '**/api/ai/isReady', isReady(false)).as('AIisReadyDone');
    cy.wait('@AIisReadyDone', { timeout: 10000 });
    cy.get('[data-cy="corner-assistant-state"]').should('include.text', 'Kunde inte starta session');
  });
});
