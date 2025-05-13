import { RepresentingMode } from '@interfaces/app';
import { notPaidInvoices, paidInvoices, statusMapInvoices } from '@services/invoice-service';
import { getContactSettings } from 'cypress/fixtures/getContactSettings';
import { getPdf } from 'cypress/fixtures/getPdf';
import { representingModeDefault } from 'cypress/support/e2e';

export const testContactSettings = (representingMode: RepresentingMode = representingModeDefault) => {
  // Kontaktuppgifter
  cy.intercept('POST', '**/api/contactsettings', getContactSettings(representingMode)).as(`postContactSettings`);
  cy.contains('h2', 'Kontaktuppgifter').next().contains('button', 'Redigera').click();
  cy.contains('label', `name-${RepresentingMode[representingMode]}`).should('exist');
  cy.get('input[name="email"]').should('have.value', 'test@example.com');
  cy.get('input[name="phone"]').should('have.value', '+46701740605');
  cy.contains('button:visible', 'Spara').click();
  cy.wait('@postContactSettings');
  cy.get('.sk-snackbar').contains('Uppgifterna sparades.').should('be.visible');
  cy.get('.sk-snackbar').contains('button', 'Stäng').click();
  cy.contains('h2', 'Kontaktuppgifter').next().contains('button', 'Redigera').should('be.visible');

  // Kontaktvägar
  cy.contains('h2', 'Kontaktvägar').next().contains('button', 'Redigera').click();
  cy.get('[name="notifications.phone_disabled"]').should('be.checked');
  cy.get('[name="notifications.email_disabled"]').should('be.checked');
  cy.contains('button:visible', 'Spara').click();
  cy.wait('@postContactSettings');
  cy.get('.sk-snackbar').contains('Uppgifterna sparades.').should('be.visible');
  cy.get('.sk-snackbar').contains('button', 'Stäng').click();
  cy.contains('h2', 'Kontaktvägar').next().contains('button', 'Redigera').should('be.visible');
};

export const testPaidInvoices = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.contains('h2', /^Ohanterade fakturor/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      paidInvoices.map((key) => {
        cy.contains(statusMapInvoices[key].label).should('exist');
        cy.contains(RepresentingMode[representingMode]).should('exist');
      });
    });
};

export const testAllInvoices = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.contains('h2', /Alla fakturor/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      notPaidInvoices.map((key) => {
        cy.contains(statusMapInvoices[key].label).should('exist');
        cy.contains(RepresentingMode[representingMode]).should('exist');
      });
    });
};

// NOTE: Outdated, needs updating if used
export const testAllInvoicesMobile = () => {
  cy.viewport('iphone-5');

  cy.contains('h2', /^betalda/i)
    .next()
    .contains('*', /Visar \d+ av \d+/)
    .should('not.exist');

  cy.contains('h1, h2', /^betalda/i)
    .next()
    .contains('h3', /PAID/)
    .should('be.visible')
    .parentsUntil('article')
    .find('button')
    .click();

  cy.contains('h1, h2', /^betalda/i)
    .next()
    .contains('h3', /PAID/)
    .should('be.visible')
    .parentsUntil('article')
    .contains('strong', 'OCR-nummer');

  cy.viewport('macbook-16');
};

export const testPaidInvoicesPdf = () => {
  cy.intercept('GET', '**/api/invoicepdf/999', getPdf).as('getPdf');
  cy.contains('h2', /^Ohanterade fakturor/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody tr:nth-child(1)')
    .contains('button', 'Hämta pdf')
    .click();
  cy.wait('@getPdf').then((interception) => {
    expect(interception.response?.statusCode).to.eq(200);
    cy.readFile('cypress/downloads/999.pdf', { timeout: 15000 }).should('exist');
  });
};

export const testInvoices = (representingMode: RepresentingMode = representingModeDefault) => {
  testPaidInvoices(representingMode);
  // testNotPaidInvoices(representingMode);
  // testOtherInvoices(representingMode);
  // testPaidInvoicesMobile();
  testPaidInvoicesPdf();
};
