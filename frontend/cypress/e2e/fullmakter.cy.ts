import { RepresentingMode } from '../../src/interfaces/app';
import {
  getSignMandate,
  getStatusCancelled,
  getStatusComplete,
  getStatusPending,
  getStatusSigning,
} from '../fixtures/getBankId';
import { getMandate, getOrgMandates } from '../fixtures/getMandate';
import { setIntercepts } from '../support/e2e';

describe('Profil och inställningar', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.BUSINESS);

    cy.visit('/foretag/profil');
  });

  it('users with signing rights can create mandates', () => {
    setIntercepts(RepresentingMode.BUSINESS, 0);
    cy.get('[data-cy="mandate-disclosure"]').click();
    cy.get('[data-cy="create-mandate-button"]').should('exist');
  });

  it('users without signing rights or whitelisting cannot create mandates', () => {
    setIntercepts(RepresentingMode.BUSINESS, 1);
    cy.visit('/foretag/profil');
    cy.get('[data-cy="mandate-disclosure"]').click();
    cy.get('[data-cy="create-mandate-button"]').should('not.exist');
  });

  it('whitelisted users can create mandates', () => {
    setIntercepts(RepresentingMode.BUSINESS, 2);
    cy.get('[data-cy="mandate-disclosure"]').click();
    cy.get('[data-cy="create-mandate-button"]').should('exist');
  });

  it('creates a new mandate', () => {
    cy.intercept('POST', '**/api/sign/mandate', getSignMandate(0));
    cy.intercept('POST', '**/api/mandates', getMandate);
    cy.intercept('GET', '**/api/sign/***', getStatusPending());
    cy.get('[data-cy="mandate-disclosure"]').click();
    cy.get('[data-cy="create-mandate-button"]').click();
    cy.get('[data-cy="create-mandate-modal"]').within(() => {
      cy.get('[data-cy="create-mandate-personnumber-error"]').should('not.exist');
      cy.get('[data-cy="create-mandate-agreement-error"]').should('not.exist');
      cy.get('[data-cy="create-mandate-personnumber-helpertext"]').should('not.exist');
      cy.get('[data-cy="create-mandate-submit"]').click();
      cy.get('[data-cy="create-mandate-personnumber-error"]').should('exist');
      cy.get('[data-cy="create-mandate-agreement-error"]').should('exist');

      //citizen
      cy.get('[data-cy="create-mandate-personnumber"]').type('199001011234');
      cy.get('[data-cy="create-mandate-personnumber-error"]').should('not.exist');
      cy.get('[data-cy="create-mandate-personnumber-helpertext"]').should('have.text', 'Test Testsson');

      //dates
      cy.get('[data-cy="create-mandate-date-from-error"]').should('not.exist');
      cy.get('[data-cy="create-mandate-date-to-error"]').should('not.exist');
      cy.get('[data-cy="create-mandate-date-from"]').clear();
      cy.get('[data-cy="create-mandate-date-from-error"]').should('include.text', 'Ange ett startdatum');
      cy.get('[data-cy="create-mandate-date-from"]').type('2020-01-01');
      cy.get('[data-cy="create-mandate-date-to"]').type('2019-12-31');
      cy.get('[data-cy="create-mandate-date-to-error"]').should(
        'include.text',
        'Fullmakten måste sluta gälla senare än startdatum'
      );
      cy.get('[data-cy="create-mandate-date-to"]').type('2023-01-02');
      cy.get('[data-cy="create-mandate-date-to-error"]').should(
        'include.text',
        'Fullmakten får ej gälla längre än 3 år'
      );
      cy.get('[data-cy="create-mandate-date-to"]').type('2023-01-01');
      cy.get('[data-cy="create-mandate-date-to-error"]').should('not.exist');

      // agreement
      cy.get('[data-cy="create-mandate-agreement"]').click({ force: true });
      cy.get('[data-cy="create-mandate-submit"]').click();
    });
    // Bankid
    cy.get('[data-cy="bankid-sign-modal"]').within(() => {
      cy.wait(1000);
      cy.get('h1').should('include.text', 'Starta BankID-appen');
      cy.intercept('GET', '**/api/sign/***', getStatusSigning());
      cy.wait(1000);
      cy.get('h1').should('include.text', 'Skriv in din säkerhetskod i BankID-appen och skriv under.');
      cy.intercept('GET', '**/api/sign/***', getStatusCancelled()).as('cancelledSign');
      cy.wait('@cancelledSign');
      cy.get('h1').should('include.text', 'Signeringen misslyckades');
      cy.contains('Åtgärden avbröts. Försök igen');
      cy.intercept('GET', '**/api/sign/***', getStatusPending());
      cy.intercept('POST', '**/api/sign/mandate', getSignMandate(1)).as('sign2');
      cy.get('[data-cy="bankid-fail-retry-button"]').click();
      cy.wait('@sign2');
      cy.intercept('GET', '**/api/sign/***', getStatusComplete()).as('signComplete');
      cy.wait('@signComplete');
    });
    // Done
    cy.get('[data-cy="create-mandate-modal"]').within(() => {
      cy.contains('Fullmakt signerad och skapad!');
    });
  });

  it('lists and deletes mandates', () => {
    cy.intercept('DELETE', '**/api/mandates/**', { data: true }).as('getOrgMandates');
    cy.get('[data-cy="mandate-disclosure"]').click();
    cy.get('[data-cy="list-mandate-active"]').find('ul').children().should('have.length', 1);
    cy.get('[data-cy="list-mandate-inactive"]').find('ul').children().should('have.length', 3);
    cy.get('[data-cy="list-mandate-inactive"]')
      .find('ul')
      .children()
      .each(($el, index) => {
        const labels = ['Inaktiv', 'Borttagen', 'Löpt ut'];
        cy.wrap($el).get('[data-cy="mandate-list-inactive-label"]').should('include.text', labels[index]);
      });

    const newMandates = { ...getOrgMandates };
    newMandates.data[0].status = 'DELETED';
    cy.intercept('GET', '**/api/mandates/org', newMandates).as('getNewMandates');
    cy.get('[data-cy="list-mandate-active"]').find('[data-cy="mandate-list-delete.button"]').click();
    cy.get('article.sk-modal-dialog').within(() => {
      cy.get('h1').should('have.text', 'Ta bort fullmakt för Grantee Testsson');
      cy.get('button').contains('Ta bort fullmakt').click();
    });
    cy.get('.sk-snackbar-text').contains('Fullmakten togs bort');
    cy.wait('@getNewMandates');
    cy.get('[data-cy="list-mandate-inactive"]').find('ul').children().should('have.length', 4);
    cy.get('[data-cy="list-mandate-active"]')
      .find('ul')
      .children()
      .first()
      .should('have.text', 'Inga fullmakter funna');
  });
});
