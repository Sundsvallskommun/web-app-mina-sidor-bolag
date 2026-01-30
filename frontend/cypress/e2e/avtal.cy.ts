import { getAgreement, getMyPagedAgreements, getProductionAgreement } from '../fixtures/getMyPagedAgreements';
import { Agreement } from '../../src/interfaces/agreement';
import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '../../src/interfaces/app';

describe('Avtal', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.visit('/privat/avtal');
  });

  it('should render list of agreements', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Dina avtal');
    cy.get('[data-cy="agreement-search-field"]').should('not.exist');

    getMyPagedAgreements().data.forEach((agreement: Agreement) => {
      if (agreement.mainAgreement) {
        cy.get(`[data-cy="agreement-${agreement.facilityId}-${agreement.description}"]`)
          .should('exist')
          .contains(agreement.facilityId);
      }
    });
  });

  it('can view specific agreements', () => {
    cy.intercept('GET', '**/api/agreement/ELECTRICITY/111', getAgreement()).as('getAgreement');
    cy.intercept('GET', '**/api/agreement/ELECTRICITY/222', getProductionAgreement()).as('getProductionAgreement');

    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Dina avtal');

    cy.get(`[data-cy="agreement-111-Säkringsabonnemang"]`).should('exist').contains('111').click();
    cy.wait('@getAgreement');
    cy.get('[data-cy="agreement-label"]').should('exist').should('not.include.text', 'produktion');
    cy.get('[data-cy="agreement-to-statistics-button"]').should('exist');

    getAgreement().data.forEach((agreement: Agreement) => {
      if (!agreement.mainAgreement) {
        cy.get(`[data-cy="additional-agreement-111-${agreement.description}"]`).should('exist');
      }
    });

    cy.get('a').contains('Avtal').should('exist').click();
    cy.get(`[data-cy="agreement-222-Produktionsavtal"]`).should('exist').contains('222').click();
    cy.wait('@getProductionAgreement');
    cy.get('[data-cy="agreement-label"]').should('exist').should('include.text', 'produktion');
    cy.get('[data-cy="agreement-to-statistics-button"]').should('not.exist');
  });
});
