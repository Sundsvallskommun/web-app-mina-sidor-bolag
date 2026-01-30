import { RepresentingMode } from '@interfaces/app';
import { getMe } from 'cypress/fixtures/getMe';
import { getPrivateRepresentFromGetMe, getRepresentingEntity } from 'cypress/fixtures/getRepresentingEntity';
import { setIntercepts } from 'cypress/support/e2e';

describe('Ändra representationsläge (privat/företag)', () => {
  beforeEach(() => {
    cy.intercept(
      'GET',
      '**/api/representing',
      getRepresentingEntity({ PRIVATE: getPrivateRepresentFromGetMe(), mode: RepresentingMode.PRIVATE })
    ).as('getRepresenting');
    cy.intercept(
      'POST',
      '**/api/representing',
      getRepresentingEntity({ PRIVATE: getPrivateRepresentFromGetMe(), mode: RepresentingMode.PRIVATE })
    ).as('postRepresenting');
    setIntercepts(RepresentingMode.PRIVATE);
    cy.visit('/privat');
  });

  it('should render /privat/oversikt then /foretag/valj-foretag then /foretag/oversikt with no chosen business', () => {
    cy.contains('[data-cy="representingLabel"]', getMe.data.name);
    cy.url().should('include', '/privat/oversikt');
    cy.wait(['@getRepresenting']).then(() => {
      setIntercepts(RepresentingMode.BUSINESS);
      cy.intercept('GET', '**/api/representing', { statusCode: 400 }).as('getRepresenting');

      // RepresentingSwitchButton
      cy.get('[data-cy="representing-business-menu-item"]').should('exist').click();
      cy.url().should('include', '/foretag/valj-foretag');

      cy.intercept('GET', '**/api/representing', getRepresentingEntity({ mode: RepresentingMode.BUSINESS })).as(
        'getRepresenting'
      );

      // välj organisation
      cy.contains('Styrbjörns båtar').click();
      cy.contains('button', 'Fortsätt').click();
      cy.contains('[data-cy="representingLabel"]', 'Styrbjörns båtar');
      cy.url().should('include', '/foretag/oversikt');
    });
  });

  it('should render /privat/oversikt then /foretag/oversikt then /privat/oversikt', () => {
    cy.url().should('include', '/privat/oversikt');
    cy.wait(['@getRepresenting'])
      .then(() => {
        setIntercepts(RepresentingMode.BUSINESS);

        // RepresentingSwitchButton
        cy.get('[data-cy="representing-business-menu-item"]').should('exist').click();
        cy.url().should('include', '/foretag/oversikt');
        cy.contains('Styrbjörns båtar');
      })
      .then(() => {
        setIntercepts(RepresentingMode.PRIVATE);
        cy.get('[data-cy="representing-private-menu-item"]').should('exist').click();
        cy.url().should('include', '/privat/oversikt');
      });
  });

  it('should render /privat/oversikt then /foretag/oversikt', () => {
    cy.url().should('include', '/privat/oversikt');
    cy.wait(['@getRepresenting']).then(() => {
      setIntercepts(RepresentingMode.BUSINESS);

      // RepresentingSwitchButton
      cy.get('[data-cy="representing-business-menu-item"]').should('exist').click();
      cy.url().should('include', '/foretag/oversikt');
    });
  });
});
