import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getStatisticsElectricityData } from '../fixtures/getMeasurementData';
import dayjs from 'dayjs';
import { getMe } from '../fixtures/getMe';

describe('Statistik', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.visit('/privat/statistik');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Din statistik');

    const fromDate = dayjs().startOf('month').toISOString();
    const toDate = dayjs().toISOString();
    const currentDaysOfMonth = parseInt(dayjs().format('DD'));

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityId=111&fromDate=*&toDate=*&aggregateOn=DAY`,
      getStatisticsElectricityData(fromDate, toDate, currentDaysOfMonth)
    ).as('getStatisticsElectricityData');
  });

  it('should render filters correctly', () => {
    cy.get('[data-cy="address-select"]').should('exist').should('have.text', getMe.data.addresses[0].address);
    cy.get('[data-cy="contract-select"]').should('exist').should('include.text', getMe.data.facilities[0].facilityId);
    cy.get('[data-cy="date-toggle"]').should('exist');
    cy.get('[data-cy="year-select"]').should('exist');
    cy.get('[data-cy="month-select"]').should('exist');
    cy.get('[data-cy="day-select"]').should('exist');
    cy.get('[data-cy="compare-year-select"]').should('exist');
  });

  it('should render consumption information correctly', () => {
    cy.get('[data-cy="address"]').should('exist').should('have.text', getMe.data.addresses[0].address);
    cy.get('[data-cy="total-consumption-value"]').should('exist');
    cy.get('[data-cy="highest-consumption-value"]').should('exist');
    cy.get('[data-cy="average-consumption-value"]').should('exist');
  });
});
