import { RepresentingMode } from '@interfaces/app';
import { getRepresentingEntity } from 'cypress/fixtures/getRepresentingEntity';
import { setIntercepts } from '../support/e2e';

describe('Valj företag', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept(
      'GET',
      '**/api/representing',
      getRepresentingEntity({ BUSINESS: undefined, mode: RepresentingMode.BUSINESS })
    ).as('getRepresenting');
    cy.visit('/foretag/valj-foretag');
  });

  it('should render #content and h1', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist');
  });

  it('choosing an engagement should redirect', () => {
    setIntercepts(RepresentingMode.BUSINESS);

    cy.contains('Styrbjörns båtar').click();
    cy.contains('button', 'Fortsätt').click();
    cy.url().should('include', '/foretag/oversikt');
    cy.contains('Styrbjörns båtar');
  });

  it('should show norepresent page if no engagements', () => {
    cy.intercept('GET', '**/api/engagements', { statusCode: 404 }).as('getEngagements');
    cy.visit('/foretag/valj-foretag');
    cy.contains('h1', 'Hoppsan, vi hittade inget företag som är registrerat på dig');
  });
});
