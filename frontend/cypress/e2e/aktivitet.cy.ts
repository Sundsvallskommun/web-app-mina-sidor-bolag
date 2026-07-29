import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import dayjs from 'dayjs';
import { getActivityEvents, getActivityEventsPageTwo, getEmptyActivityEvents } from '../fixtures/getActivityEvents';

describe('Aktivitet', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
  });

  const visitActivity = (response = getActivityEvents()) => {
    cy.intercept('GET', '**/api/event/activity?**', response).as('getActivity');
    cy.visit('/privat/aktivitet');
    cy.get('#content').should('exist');
    cy.get('h1').should('contain.text', 'Aktivitet');
    cy.wait('@getActivity');
  };

  it('renders the page shell with filter and timeline', () => {
    visitActivity();

    cy.get('[data-cy="activity-filter"]').should('exist');
    cy.get('[data-cy="timeline"]').should('exist');
    cy.get('[data-cy="activity-list-item"]').should('have.length.greaterThan', 0);
    cy.get('[data-cy="timeline"]').should('include.text', '2026').should('include.text', '2025');
  });

  it('renders a login event with company and badge', () => {
    visitActivity();

    cy.get('[data-cy="activity-badge-login"]').first().should('contain.text', 'Inloggning');
    cy.get('[data-cy="activity-badge-login"]')
      .first()
      .closest('[data-cy="activity-list-item"]')
      .should('include.text', 'Kalle Karlsson')
      .should('include.text', 'Företag')
      .should('include.text', 'Blåmesen AB');
  });

  it('renders a kundtjänst (impersonation) event with support reason', () => {
    visitActivity();

    cy.get('[data-cy="activity-badge-impersonation"]').should('contain.text', 'Kundtjänst');
    cy.get('[data-cy="activity-badge-impersonation"]')
      .closest('[data-cy="activity-list-item"]')
      .should('include.text', 'Maja Andersson')
      .should('include.text', 'Supportanledning')
      .should('include.text', 'I samtal med kunden');
  });

  it('renders HAN-port activated and deactivated events', () => {
    visitActivity();

    cy.get('[data-cy="activity-badge-hanActivated"]')
      .should('contain.text', 'HAN-port aktiverad')
      .closest('[data-cy="activity-list-item"]')
      .should('include.text', 'Adress')
      .should('include.text', 'Kajvägen 10')
      .should('include.text', 'Anläggnings-ID')
      .should('include.text', '735999109515160509');

    cy.get('[data-cy="activity-badge-hanDeactivated"]').should('contain.text', 'HAN-port inaktiverad');
  });

  it('omits the trailing comma when a personnummer is missing', () => {
    visitActivity();

    cy.get('[data-cy="activity-badge-hanDeactivated"]')
      .closest('[data-cy="activity-list-item"]')
      .find('p')
      .first()
      .should('have.text', 'Mirsad Andersson');
  });

  it('filters by Inloggningar', () => {
    visitActivity();

    cy.get('[data-cy="activity-filter-login"]').click();
    cy.wait('@getActivity').its('request.query.sourceTypeFilter').should('eq', 'login');
  });

  it('filters by HAN-port', () => {
    visitActivity();

    cy.get('[data-cy="activity-filter-han"]').click();
    cy.wait('@getActivity').its('request.query.sourceTypeFilter').should('eq', 'han');
  });

  it('sends the selected period as from/to', () => {
    visitActivity();

    cy.get('[data-cy="activity-filter-from"]').clear().type('2026-02-01');
    cy.wait('@getActivity').its('request.query.from').should('eq', '2026-02-01');

    cy.get('[data-cy="activity-filter-to"]').clear().type('2026-04-30');
    cy.wait('@getActivity').its('request.query.to').should('eq', '2026-04-30');
  });

  it('pages through results on desktop', () => {
    visitActivity();

    cy.get('[data-cy="activity-pagination"]').should('exist');

    cy.intercept('GET', '**/api/event/activity?**page=1**', getActivityEventsPageTwo()).as('getActivityPage2');
    cy.get('[data-cy="activity-pagination"]').contains('2').click();

    cy.wait('@getActivityPage2').its('request.query.page').should('eq', '1');
    cy.get('[data-cy="activity-list-item"]').should('include.text', 'Sven Svensson');
  });

  it('shows the empty state when there is no activity', () => {
    visitActivity(getEmptyActivityEvents());

    cy.get('[data-cy="activity-empty"]').should('exist');
    cy.get('[data-cy="activity-list-item"]').should('not.exist');
  });

  it('shows the error state when the request fails', () => {
    cy.intercept('GET', '**/api/event/activity?**', { statusCode: 503, body: {} }).as('getActivity');
    cy.visit('/privat/aktivitet');
    cy.get('h1').should('contain.text', 'Aktivitet');

    cy.get('[data-cy="activity-error"]').should('exist');
    cy.get('[data-cy="activity-list-item"]').should('not.exist');
  });

  it('pages by year on mobile', () => {
    cy.viewport('iphone-x');
    const currentYear = dayjs().year();

    cy.intercept('GET', '**/api/event/activity?**', getActivityEvents()).as('getActivity');
    cy.visit('/privat/aktivitet');
    cy.get('h1').should('contain.text', 'Aktivitet');

    cy.wait('@getActivity').its('request.query.from').should('eq', `${currentYear}-01-01`);

    cy.get('[data-cy="activity-year-pagination"]').should('exist');
    cy.get('[aria-label="Föregående år"]').should('be.disabled');

    cy.get(`[data-cy="activity-year-${currentYear - 1}"]`).click();
    cy.wait('@getActivity')
      .its('request.query.from')
      .should('eq', `${currentYear - 1}-01-01`);

    cy.get(`[data-cy="activity-year-${currentYear - 3}"]`).click();
    cy.wait('@getActivity');
    cy.get('[aria-label="Nästa år"]').should('be.disabled');
  });
});
