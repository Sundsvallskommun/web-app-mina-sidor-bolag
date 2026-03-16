import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';

describe('Växla användare', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.visit('/privat/vaxla-anvandare');
  });

  it('should render page', () => {
    cy.get('h1').should('exist').should('contain.text', 'Växla användare');
  });
});
