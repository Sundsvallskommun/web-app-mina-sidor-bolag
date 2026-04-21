import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getStatisticsData } from '../fixtures/getMeasurementData';
import dayjs from 'dayjs';
import { Aggregation, Category } from '@interfaces/measurement-data';
import { getNetOwner } from '../fixtures/getNetOwner';
import { getMyPagedAgreements } from '../fixtures/getMyPagedAgreements';
import { isReady } from '../fixtures/ai';

describe('Statistik - QUARTER Aggregation', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/ai/isReady', isReady(false)).as('AIisReady');
    cy.intercept('GET', '**/api/paged/all-agreements', getMyPagedAgreements());
  });

  it('should render chart with QUARTER aggregation', () => {
    const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
    const today = dayjs().format('YYYY-MM-DD');
    cy.intercept(
      'GET',
      '**/api/measurementdata?category=DISTRICT_HEATING&facilityIds=*&fromDate=*&toDate=*&aggregateOn=DAY',
      getStatisticsData(monthStart, today, Category.DISTRICT_HEATING, Aggregation.DAY)
    );

    cy.intercept('POST', '**/api/netowner', getNetOwner());

    cy.intercept(
      'GET',
      '**/api/measurementdata?category=ELECTRICITY&facilityIds=*&fromDate=*&toDate=*&aggregateOn=DAY',
      getStatisticsData(monthStart, today, Category.ELECTRICITY, Aggregation.DAY)
    );

    cy.intercept(
      'GET',
      '**/api/measurementdata?category=ELECTRICITY&facilityIds=*&fromDate=*&toDate=*&aggregateOn=HOUR',
      getStatisticsData(today, today, Category.ELECTRICITY, Aggregation.HOUR)
    ).as('hourData');

    cy.intercept(
      'GET',
      '**/api/measurementdata?category=ELECTRICITY&facilityIds=*&fromDate=*&toDate=*&aggregateOn=QUARTER',
      getStatisticsData(today, today, Category.ELECTRICITY, Aggregation.QUARTER)
    ).as('quarterData');

    cy.visit('/privat/statistik');
    cy.get('#content').should('exist');
    cy.get('h1').should('contain.text', 'Din statistik');

    cy.get('[data-cy="contract-select"]').should('exist').select(2);

    // Switch to day view
    cy.get('[data-cy="date-toggle-day-button"]').click();

    cy.wait('@hourData');

    cy.contains('button', '15 min').click();

    cy.wait('@quarterData');

    // Verify chart renders
    cy.get('[data-cy="consumption-chart"]').should('exist');

    cy.get('[data-cy="total-consumption-value"]').should('exist').and('contain.text', '46560');

    cy.get('[data-cy="highest-consumption-value"]').should('exist').and('contain.text', '960');

    cy.get('[data-cy="average-consumption-value"]').should('exist').and('contain.text', '485');

    // Verify day-select date picker is visible and set to today
    cy.get('[data-cy="day-select"]').should('exist').and('have.value', monthStart);

    // Verify TimeIntervalSelector: "15 min" is active (data-inverted="true"), "60 min" is not
    cy.contains('button', '15 min').should('have.attr', 'data-inverted', 'true');
    cy.contains('button', '60 min').should('not.have.attr', 'data-inverted');

    // Switch to table view and verify the measurement data table
    cy.contains('button', 'Tabell').click();
    cy.get('tbody tr').should('have.length', 96);
    cy.get('tbody tr').first().should('contain.text', '00:00');
    cy.get('tbody tr').last().should('contain.text', '23:45');

    // Switch back to chart view
    cy.contains('button', 'Graf').click();
    cy.get('[data-cy="consumption-chart"]').should('exist');
  });
});
