import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getInvoices, getPendingInvoices } from '../fixtures/getInvoices';

describe('Fakturor', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/invoices?**', getInvoices(RepresentingMode.PRIVATE)).as('getInvoices');
    cy.intercept('GET', '**/api/invoices/pending?**', getPendingInvoices()).as('getPendingInvoices');
    cy.visit('/privat/fakturor');
  });

  it('should render invoices tables', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Dina fakturor');

    cy.get('h2').should('exist').should('include.text', 'Ohanterade fakturor');
    cy.get('h2').should('exist').should('include.text', 'Alla fakturor');
  });

  it('should display invoices tables correctly', () => {
    const tableHeaders = ['Leverantör', 'Status', 'Fakturadatum', 'Förfallodatum', 'Belopp', 'Fakturanummer', 'Adress'];
    const unhandled = cy.get('[data-cy="unhandled-invoices-table"]').should('exist');
    const all = cy.get('[data-cy="all-invoices-table"]').should('exist');

    tableHeaders.forEach((header) => {
      cy.get('[data-cy="unhandled-invoices-table"]')
        .should('exist')
        .within(() => {
          cy.get('th').should('exist').contains(header);
        });
      cy.get('[data-cy="all-invoices-table"]')
        .should('exist')
        .within(() => {
          cy.get('th').should('exist').contains(header);
        });
    });
  });

  it('should display table data correctly', () => {
    cy.get('[data-cy="unhandled-invoices-table"]')
      .should('exist')
      .within(() => {
        cy.get('tr').should('exist').contains('240736694');
        cy.get('tr').should('include.text', 'Obetald');
      });

    cy.get('[data-cy="all-invoices-table"]')
      .should('exist')
      .within(() => {
        cy.get('tr').should('exist').contains('96758235');
      });
  });
});
