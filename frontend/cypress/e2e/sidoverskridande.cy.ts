import { RepresentingMode } from '@interfaces/app';
import { setIntercepts } from 'cypress/support/e2e';
import { getPendingInvoices } from '../fixtures/getInvoices';

describe('Sidöverskridande', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/invoices/pending?**', getPendingInvoices()).as('getPendingInvoices');
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

    cy.get('select').select('Styrbjörns båtar');
    cy.wait('@postRepresenting').its('response.statusCode').should('eq', 200);
  });

  it('displays user menu and navigation correctly on desktop', () => {
    cy.visit('/');
    cy.url().should('include', '/privat/oversikt');

    cy.get('[data-cy="user-menu"]').should('exist').contains('Förnamn Efternamn').click();
    cy.get('[data-cy="user-menu-profile-button"]').should('exist').should('have.text', 'Profil och inställningar');
    // NOTE: Hide until release
    // cy.get('[data-cy="user-menu-eligibility-button"]').should('exist').should('have.text', 'Medgivanden');
    cy.get('[data-cy="user-menu-impersonate-user-button"]').should('exist').should('have.text', 'Växla användare');
    cy.get('[data-cy="user-menu-logout-button"]').should('exist').should('have.text', 'Logga ut');
    cy.get('[data-cy="desktop-navigation"] li').should('have.length', 5);
  });
});
