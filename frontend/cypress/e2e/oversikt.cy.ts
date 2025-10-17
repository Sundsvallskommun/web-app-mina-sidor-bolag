import { getMe } from '../fixtures/getMe';
import { getPendingInvoices } from '../fixtures/getInvoices';

describe('Översikt', () => {
  beforeEach(() => {
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
});
