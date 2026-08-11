import { getMe } from '../fixtures/getMe';
import { getPendingInvoices } from '../fixtures/getInvoices';
import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getBFUSConsents } from '../fixtures/getBFUSConsents';
import { getOverviewDisturbances } from '../fixtures/getDisturbances';

describe('Översikt', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/bfus/consents?customerIds=12345678', getBFUSConsents(RepresentingMode.PRIVATE)).as(
      'getPartyPermissions'
    );
    cy.intercept('GET', '**/api/bfus/consents/new?customerIds=12345678', getBFUSConsents(RepresentingMode.PRIVATE)).as(
      'getNewPermissions'
    );

    cy.intercept('GET', '**/api/invoices/pending?**', getPendingInvoices()).as('getPendingInvoices');
    cy.intercept('GET', '**/api/disturbances?status=*', getOverviewDisturbances()).as('getOverviewDisturbances');
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
      .should('include.text', `Du har ${getPendingInvoices().data._meta?.totalRecords} fakturor att betala.`);

    // Disturbances
    cy.get('[data-cy="overview-disturbances"]').should('exist').contains('Driftinformation');
    cy.get('[data-cy="overview-disturbances"]').within(() => {
      cy.contains('button', 'Visa alla').should('be.visible');
    });
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
