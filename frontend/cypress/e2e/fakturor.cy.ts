import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getPendingInvoices } from '../fixtures/getInvoices';
import { getGeneratedInvoices } from '../fixtures/utils';

describe('Fakturor', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.visit('/privat/fakturor');

    cy.intercept('GET', '**/api/invoices/pending?**', getPendingInvoices()).as('getPendingInvoices');
  });

  it('should render invoices tables', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Dina fakturor');

    cy.get('h2').should('exist').should('include.text', 'Ohanterade fakturor');
    cy.get('h2').should('exist').should('include.text', 'Alla fakturor');
  });

  it('should display table headers correctly', () => {
    const tableHeaders = ['Leverantör', 'Status', 'Fakturadatum', 'Förfallodatum', 'Belopp', 'Fakturanummer', 'Adress'];

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
    getPendingInvoices().data.invoices.forEach(() => {
      cy.get('[data-cy="unhandled-invoices-table"]')
        .should('exist')
        .within(() => {
          cy.get('tr').should('exist').contains('240736694');
          cy.get('tr').should('include.text', 'Obetald');
        });
    });

    getGeneratedInvoices().forEach(() => {
      cy.get('[data-cy="all-invoices-table"]')
        .should('exist')
        .within(() => {
          cy.get('tr').should('exist').contains('96758235');
        });
    });
  });
});
