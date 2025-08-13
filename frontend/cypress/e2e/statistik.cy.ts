import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getStatisticsData } from '../fixtures/getMeasurementData';
import dayjs from 'dayjs';
import { getMe } from '../fixtures/getMe';
import { Aggregation, Category } from '@interfaces/measurement-data';

describe('Statistik', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.visit('/privat/statistik');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Din statistik');

    const fromDate = dayjs().startOf('month').format('YYYY');
    const toDate = dayjs().format('YYYY');

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityId=111&fromDate=${fromDate}*&toDate=${toDate}*&aggregateOn=DAY`,
      getStatisticsData(
        dayjs().startOf('month').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD'),
        Category.ELECTRICITY,
        Aggregation.DAY
      )
    ).as('getStatisticsData');
  });

  it('should render components correctly', () => {
    cy.get('[data-cy="statistics-filter"]').should('exist');
    cy.get('[data-cy="consumption-chart"]').should('exist');
    cy.get('[data-cy="outdoor-temperature-chart"]').should('exist');
    cy.get('[data-cy="export-statistics-button"]').should('exist');
    cy.get('[data-cy="export-statistics-button"]').should('not.be.disabled');
    cy.get('[data-cy="statistics-faq"]').should('exist');
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

  it('can change category', () => {
    const fromDate = dayjs().startOf('month').toISOString();
    const toDate = dayjs().toISOString();

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=DISTRICT_HEATING&facilityId=333&fromDate=*&toDate=*&aggregateOn=DAY`,
      getStatisticsData(fromDate, toDate, Category.DISTRICT_HEATING, Aggregation.DAY)
    ).as('getStatisticsData');

    cy.get('[data-cy="contract-select"]').should('exist').select(2);
    cy.get('[data-cy="contract-select"]').should('exist').should('include.text', getMe.data.facilities[2].facilityId);
  });

  it('can display statistics by year, month and day', () => {
    const fromDate = dayjs().startOf('month').toISOString();
    const toDate = dayjs().toISOString();

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityId=111&fromDate=*&toDate=*&aggregateOn=HOUR`,
      getStatisticsData(fromDate, toDate, Category.ELECTRICITY, Aggregation.HOUR)
    ).as('getStatisticsData');

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityId=111&fromDate=*&toDate=*&aggregateOn=MONTH`,
      getStatisticsData(fromDate, toDate, Category.ELECTRICITY, Aggregation.MONTH)
    ).as('getStatisticsData');

    cy.get('[data-cy="date-toggle"]').should('exist');

    cy.get('[data-cy="date-toggle-year-button"]').should('exist').click();
    cy.get('[data-cy="date-toggle-day-button"]').should('exist').click();
  });

  it('requests and receives correct dates when comparing statistics', () => {
    const fromDate = dayjs().startOf('month').subtract(1, 'year').format('YYYY');
    const toDate = dayjs().subtract(1, 'year').format('YYYY');

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityId=111&fromDate=${fromDate}*&toDate=${toDate}*&aggregateOn=DAY`,
      getStatisticsData(
        dayjs().startOf('month').subtract(1, 'year').format('YYYY-MM-DD'),
        dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
        Category.ELECTRICITY,
        Aggregation.DAY
      )
    ).as('getStatisticsDataToCompare');

    cy.get('[data-cy="compare-year-select"]').should('exist').select(1);
    cy.wait('@getStatisticsDataToCompare').then((interception) => {
      cy.get('[data-cy="compare-year-select"]').should(
        'have.value',
        dayjs(interception.request.query.fromDate).format('YYYY')
      );
      cy.get('[data-cy="compare-year-select"]').should(
        'have.value',
        dayjs(interception.request.query.toDate).format('YYYY')
      );
      cy.get('[data-cy="compare-year-select"]').should(
        'have.value',
        dayjs(interception.response?.body.data.fromDate).format('YYYY')
      );
      cy.get('[data-cy="compare-year-select"]').should(
        'have.value',
        dayjs(interception.response?.body.data.toDate).format('YYYY')
      );
    });
  });

  it('can export statistics', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    const exportFileName = `${downloadsFolder}\\Export-${getMe.data.facilities[0].address?.street}-Elförbrukning-${dayjs().format('YYYY-MM-DD')}.xlsx`;

    cy.get('[data-cy="export-statistics-button"]').should('not.be.disabled').click();
    cy.readFile(exportFileName);
  });

  it('can handle empty data response', () => {
    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityId=111&fromDate=*&toDate=*&aggregateOn=DAY`,
      { fixture: null }
    );

    cy.get('[data-cy="empty-response-container"]').should('exist');
    cy.get('[data-cy="export-statistics-button"]').should('be.disabled');
  });
});
