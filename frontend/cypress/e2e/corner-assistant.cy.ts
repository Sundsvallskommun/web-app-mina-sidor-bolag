import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '../../src/interfaces/app';
import { isReady } from 'cypress/fixtures/ai';

describe('Corner Assistant', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.visit('/privat/oversikt');
  });

  it('should render loading state until ready', () => {
    cy.get('[data-cy="corner-assistant-loading"]').should('include.text', 'Förbereder din assistent...');
    cy.intercept('GET', '**/api/ai/isReady', isReady(true)).as('AIisReadyDone');
    cy.wait('@AIisReadyDone');
    cy.get('[data-cy="corner-assistant"]').should('include.text', 'Assistent');
  });
});
