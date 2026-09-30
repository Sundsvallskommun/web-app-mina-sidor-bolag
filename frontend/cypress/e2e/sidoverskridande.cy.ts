import { RepresentingMode } from '@interfaces/app';
import { setIntercepts } from 'cypress/support/e2e';
import { getBFUSConsents } from '../fixtures/getBFUSConsents';
import { getOverviewDisturbances } from '../fixtures/getDisturbances';
import { getPendingInvoices } from '../fixtures/getInvoices';

describe('Sidöverskridande', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/bfus/consents/new?customerIds=12345678', getBFUSConsents(RepresentingMode.PRIVATE)).as(
      'getNewPermissions'
    );
    cy.intercept('GET', '**/api/invoices/pending?**', getPendingInvoices()).as('getPendingInvoices');
    cy.intercept('GET', '**/api/disturbances?status=*', getOverviewDisturbances()).as('getOverviewDisturbances');
  });

  it('Set focus to main', () => {
    cy.visit('/');
    cy.contains('h1', 'Aktuell förbrukning och produktion');
    cy.contains('a', 'Hoppa till innehåll').then(($link) => {
      cy.wrap($link).focus().click({ force: true });
    });
    cy.focused().should(($el) => {
      expect($el.prop('tagName')).to.equal('MAIN');
    });
  });

  it('mobile menu can be opened', () => {
    // privat
    cy.viewport('iphone-5');
    cy.visit('/');

    cy.url().should('include', '/privat/oversikt');

    cy.get('button[aria-label="Meny"]').should('be.visible').click();
    cy.get('button[aria-label="Stäng meny"]').should('be.visible');
    cy.get('ul[aria-label="Undersidor"] li').should('have.length', 8);

    // foretag
    setIntercepts(RepresentingMode.BUSINESS);
    cy.contains('button', 'Till Mina sidor företag').click();
    cy.url().should('include', '/foretag/oversikt');

    cy.get('button[aria-label="Meny"]').should('be.visible').click();
    cy.get('button[aria-label="Stäng meny"]').should('be.visible');

    cy.get('button[aria-label="Stäng meny"]').parents('[role="dialog"]').find('select').select('Styrbjörns båtar');
    cy.wait('@postRepresenting').its('response.statusCode').should('eq', 200);
  });

  it('displays user menu and navigation correctly on desktop', () => {
    cy.visit('/');
    cy.url().should('include', '/privat/oversikt');

    cy.get('[data-cy="user-menu"]').should('exist').contains('Förnamn Efternamn').click();
    cy.get('[data-cy="user-menu-profile-button"]').should('exist').should('have.text', 'Profil och inställningar');
    cy.get('[data-cy="user-menu-consents-button"]').should('exist').should('have.text', 'Medgivanden');
    cy.get('[data-cy="user-menu-disturbances-button"]').should('exist').should('have.text', 'Driftinformation');
    cy.get('[data-cy="user-menu-logout-button"]').should('exist').should('have.text', 'Logga ut');
    cy.get('[data-cy="desktop-navigation"] li').should('have.length', 5);
  });
});
