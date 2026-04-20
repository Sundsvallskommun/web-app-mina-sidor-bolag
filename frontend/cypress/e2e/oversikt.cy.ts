import { getMe } from '../fixtures/getMe';
import { getPendingInvoices } from '../fixtures/getInvoices';
import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '../../src/interfaces/app';
import { getBfusPartyPermissions } from 'cypress/fixtures/getBfusPartyPermissions';

describe('Översikt', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept(
      'GET',
      '**/api/bfus/eligable-party-permissions?customerIds=12345678',
      getBfusPartyPermissions(RepresentingMode.PRIVATE)
    ).as('getPartyPermissions');
    cy.intercept('GET', '**/api/invoices/pending?**', getPendingInvoices()).as('getPendingInvoices');
    cy.visit('/privat/oversikt');
  });

  it('should render Översikt', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', '');

    // Consumption cards
    getMe.data.addresses[0].facilityIds.forEach((facility) => {
      cy.get(`[data-cy="${facility}"]`).should('exist');
    });

    // To do
    cy.get('[data-cy="todo-invoices-item"]').should('exist').contains('Att göra');
    cy.get('[data-cy="todo-list-item-subtitle"]')
      .should('exist')
      .should('include.text', `Du har ${getPendingInvoices().data._meta.totalRecords} fakturor att betala.`);
  });

  it('should display current and previous year measurement data on consumption cards', () => {
    cy.get('article[data-cy="111"]')
      .first()
      .within(() => {
        cy.contains('Elförbrukning').should('exist');
        cy.get('h2').should('contain.text', '12kWh');
        cy.contains('100 kWh').should('exist');
        cy.contains('-88%').should('exist');
      });

    cy.get('article[data-cy="222"]')
      .first()
      .within(() => {
        cy.contains('Elproduktion').should('exist');
        cy.get('h2').should('contain.text', '2222kWh');
        cy.contains('2222 kWh').should('exist');
        cy.contains('0%').should('exist');
      });

    cy.get('article[data-cy="333"]')
      .first()
      .within(() => {
        cy.contains('Fjärrvärme').should('exist');
        cy.get('h2').should('contain.text', '2kWh');
        cy.contains('1 kWh').should('exist');
      });
  });
});
