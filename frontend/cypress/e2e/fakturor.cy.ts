import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getInvoices, getPendingInvoices } from '../fixtures/getInvoices';
import { CustomerInvoice } from '@data-contracts/backend/data-contracts';

describe('Fakturor', () => {
  beforeEach(() => {
    cy.viewport('macbook-16');
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/invoices?**', {
      data: {
        invoices: [
          ...(getPendingInvoices().data.invoices ?? []),
          ...(getInvoices(RepresentingMode.PRIVATE).data.invoices ?? []),
        ],
        _meta: { page: 1, limit: 100, totalRecords: 999, totalPages: 1, count: 999 },
      },
      message: 'success',
    }).as('getInvoices');
    cy.intercept('GET', '**/api/invoices/pending?**', getPendingInvoices()).as('getPendingInvoices');
    cy.visit('/privat/fakturor');
  });

  it('should display invoices correctly', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Dina fakturor');

    cy.get('h2').should('exist').should('include.text', 'Ohanterade fakturor');
    cy.get('h2').should('exist').should('include.text', 'Alla fakturor');

    const invoice: CustomerInvoice = getPendingInvoices().data.invoices![0] ?? {};
    cy.get(`[data-cy='invoice-list-item-1']`)
      .first()
      .within(() => {
        cy.get('[data-cy="amount"]').should('include.text', invoice.totalAmount);
        cy.get('[data-cy="street"]').should('include.text', invoice.street);
        cy.get('[data-cy="invoice-status-label"]').should('have.text', 'Obetald');
      });
  });

  it('can view invoice details', () => {
    cy.get('[data-cy="unhandled-invoices"]').should('exist');
    cy.get(`[data-cy='invoice-list-item-1']`).first().click();
    cy.wait('@getInvoices');

    const invoice: CustomerInvoice = getPendingInvoices().data.invoices![0] ?? {};
    cy.get('[data-cy="invoice-details"]').should('exist');
    cy.get('[data-cy="description"]').should('have.text', invoice.invoiceDescription);
    cy.get('[data-cy="invoice-status-label"]').should('have.text', 'Obetald');
    cy.get('[data-cy="administration"]').should('exist').should('have.text', 'Sundsvall Energi');
  });

  it('shows an error state when the pending fetch fails', () => {
    cy.intercept('GET', '**/api/invoices/pending?**', { statusCode: 500 }).as('getPendingError');
    cy.reload();
    cy.wait('@getPendingError');
    cy.get('[data-cy="unhandled-invoices"]').should('contain.text', 'Något gick fel, vänligen försök igen senare');
  });

  it('shows an error state when the all-invoices fetch fails', () => {
    cy.intercept('GET', '**/api/invoices?**', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('getInvoicesError');
    cy.reload();
    cy.wait('@getInvoicesError');

    cy.get('[data-cy="all-invoices"]').should('contain.text', 'Något gick fel, vänligen försök igen senare');
  });

  it('shows a noData state when there are no invoices', () => {
    cy.intercept('GET', '**/api/invoices?**', {
      data: {
        invoices: [],
        _meta: { page: 1, limit: 12, totalRecords: 0, totalPages: 0, count: 0 },
      },
      message: 'success',
    }).as('getInvoicesEmpty');
    cy.intercept('GET', '**/api/invoices/pending?**', {
      data: {
        invoices: [],
        _meta: { page: 1, limit: 12, totalRecords: 0, totalPages: 0, count: 0 },
      },
      message: 'success',
    }).as('getPendingEmpty');
    cy.reload();
    cy.wait(['@getInvoicesEmpty', '@getPendingEmpty']);

    cy.get('[data-cy="all-invoices"]').should('contain.text', 'Inga fakturor');
    cy.get('[data-cy="unhandled-invoices"]').should('contain.text', 'Inga fakturor');
  });

  it('shows an error state when the detail fetch fails', () => {
    cy.intercept('GET', '**/api/invoices?**', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('getInvoiceError');
    cy.visit('/privat/fakturor/1?page=1&limit=12');
    cy.wait('@getInvoiceError');

    cy.contains('Något gick fel').should('be.visible');
    cy.contains('Gå tillbaka till Mina fakturor').should('have.attr', 'href'); // the back link
  });

  it('shows a notFound state when the invoice is not in the response', () => {
    cy.intercept('GET', '**/api/invoices?**', {
      data: {
        invoices: [],
        _meta: { page: 1, limit: 12, totalRecords: 0, totalPages: 0, count: 0 },
      },
      message: 'success',
    }).as('getInvoicesEmpty');
    cy.visit('/privat/fakturor/123?page=1&limit=12');
    cy.wait('@getInvoicesEmpty');

    cy.contains('Kunde inte hitta faktura med fakturanummer 123').should('be.visible');
    cy.contains('Gå tillbaka till Mina fakturor').should('have.attr', 'href');
  });
});
