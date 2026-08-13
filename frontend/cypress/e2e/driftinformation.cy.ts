import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getAllDisturbances } from '../fixtures/getDisturbances';
import { Affected } from '@data-contracts/backend/data-contracts';

describe('Driftinformation', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/disturbances', getAllDisturbances()).as('getDisturbances');
    cy.visit('/privat/driftinformation');
  });

  it('should render list of disturbances', () => {
    cy.wait('@getDisturbances');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Driftinformation');
    cy.get('[data-cy="status-select"]').should('exist');

    cy.get('[data-cy="disturbances-container"]').should('exist');
    cy.get('[data-cy="disturbance-list-item-1"]').should('exist').contains('Pågående');
    cy.get('[data-cy="disturbance-list-item-3"]').should('exist').contains('Planerad');
    cy.get('[data-cy="disturbance-list-item-5"]').should('exist').contains('Åtgärdat');
  });

  it('disclosure list items should be rendered correctly', () => {
    const allDisturbances = getAllDisturbances();

    cy.get('[data-cy="disturbance-list-item-1"]').within(() => {
      cy.contains('Stort avbrott').should('not.be.visible');
      cy.get('button').first().click();
      cy.contains('Stort avbrott').should('be.visible');

      allDisturbances.data[0]?.affecteds?.forEach((affected: Affected) => {
        cy.contains(affected.reference).should('be.visible');
      });
    });
    cy.contains('29 april 2026').should('be.visible');
  });
});
