import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getStatisticsData } from '../fixtures/getMeasurementData';
import dayjs from 'dayjs';
import { getMe } from '../fixtures/getMe';
import { Aggregation, Category } from '@interfaces/measurement-data';
import { getNetOwner } from '../fixtures/getNetOwner';
import path from 'path';
import { createEvent, getEvents } from '../fixtures/getExportEvents';

describe('Statistik', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
  });

  const statisticsDataIntercept = () => {
    cy.intercept(
      'GET',
      `**/api/measurementdata?category=DISTRICT_HEATING&facilityId=333&fromDate=**&toDate=**&aggregateOn=DAY`,
      getStatisticsData(
        dayjs().startOf('month').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD'),
        Category.DISTRICT_HEATING,
        Aggregation.DAY
      )
    );
    cy.intercept('POST', '**/api/netowner', getNetOwner());

    cy.visit('/privat/statistik');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Din statistik');
  };

  const emptyStatisticsDataIntercept = () => {
    cy.intercept(
      'GET',
      `**/api/measurementdata?category=DISTRICT_HEATING&facilityId=333&fromDate=*&toDate=*&aggregateOn=DAY`,
      { fixture: null }
    );

    cy.intercept('POST', '**/api/netowner', getNetOwner());

    cy.visit('/privat/statistik');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Din statistik');
  };

  it('should render components correctly', () => {
    statisticsDataIntercept();
    cy.get('[data-cy="statistics-filter"]').should('exist');
    cy.get('[data-cy="consumption-chart"]').should('exist');
    cy.get('[data-cy="contract-select"]').should('exist').contains('Fjärrvärme (333)');
    cy.get('[data-cy="outdoor-temperature-chart"]').should('exist');
    cy.get('[data-cy="export-statistics-button"]').should('exist');
    cy.get('[data-cy="export-statistics-button"]').should('not.be.disabled');
    cy.get('[data-cy="statistics-faq"]').should('exist');
  });

  it('should render filters correctly', () => {
    statisticsDataIntercept();

    cy.get('[data-cy="address-select"]').should('exist').should('have.text', getMe.data.addresses[0].address);
    cy.get('[data-cy="contract-select"]').should('exist').should('include.text', getMe.data.facilities[0].facilityId);
    cy.get('[data-cy="date-toggle"]').should('exist');
    cy.get('[data-cy="date-toggle-year-button"]').should('exist');
    cy.get('[data-cy="date-toggle-month-button"]').should('exist');
    cy.get('[data-cy="date-toggle-day-button"]').should('exist');
    cy.get('[data-cy="compare-year-select"]').should('exist');
  });

  it('should render consumption information correctly', () => {
    statisticsDataIntercept();

    cy.get('[data-cy="address"]').should('exist').should('have.text', getMe.data.addresses[0].address);
    cy.get('[data-cy="total-consumption-value"]').should('exist');
    cy.get('[data-cy="highest-consumption-value"]').should('exist');
    cy.get('[data-cy="average-consumption-value"]').should('exist');
  });

  it('can change category', () => {
    statisticsDataIntercept();

    const fromDate = dayjs().startOf('month').toISOString();
    const toDate = dayjs().toISOString();

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=DISTRICT_HEATING&facilityId=333&fromDate=*&toDate=*&aggregateOn=DAY`,
      getStatisticsData(fromDate, toDate, Category.DISTRICT_HEATING, Aggregation.DAY)
    );
    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityId=111&fromDate=*&toDate=*&aggregateOn=DAY`,
      getStatisticsData(fromDate, toDate, Category.ELECTRICITY, Aggregation.DAY)
    );

    cy.get('[data-cy="contract-select"]').should('exist').select(2);
    cy.get('[data-cy="contract-select"]').should('exist').should('include.text', getMe.data.facilities[2].facilityId);
  });

  it('can display statistics by year, month and day', () => {
    statisticsDataIntercept();

    const fromDate = dayjs().startOf('month').toISOString();
    const toDate = dayjs().toISOString();

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=DISTRICT_HEATING&facilityId=333&fromDate=*&toDate=*&aggregateOn=HOUR`,
      getStatisticsData(fromDate, toDate, Category.DISTRICT_HEATING, Aggregation.HOUR)
    ).as('getStatisticsData');

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=DISTRICT_HEATING&facilityId=333&fromDate=*&toDate=*&aggregateOn=MONTH`,
      getStatisticsData(fromDate, toDate, Category.DISTRICT_HEATING, Aggregation.MONTH)
    ).as('getStatisticsData');

    cy.get('[data-cy="date-toggle"]').should('exist');

    cy.get('[data-cy="date-toggle-year-button"]').should('exist').click();
    cy.get('[data-cy="date-toggle-day-button"]').should('exist').click();
  });

  it('requests and receives correct dates when comparing statistics', () => {
    statisticsDataIntercept();

    const fromDate = dayjs().startOf('month').subtract(1, 'year').format('YYYY');
    const toDate = dayjs().subtract(1, 'year').format('YYYY');

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=DISTRICT_HEATING&facilityId=333&fromDate=${fromDate}*&toDate=${toDate}*&aggregateOn=DAY`,
      getStatisticsData(
        dayjs().startOf('month').subtract(1, 'year').format('YYYY-MM-DD'),
        dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
        Category.DISTRICT_HEATING,
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

  it('can view export events', () => {
    statisticsDataIntercept();
    cy.intercept('GET', '**/api/event/get?**', getEvents());

    cy.get('[data-cy="event-log-toggle"]').should('exist').contains('Visa exporter').click({ force: true });
    cy.get('[data-cy="event-item-2025-01-07"]')
      .should('exist')
      .should('include.text', 'Storgatan 1')
      .should('include.text', '333')
      .should('include.text', 'Fjärrvärme');

    cy.get('[data-cy="page-count"]')
      .should('exist')
      .should('have.text', `Visar ${getEvents().data.size} av ${getEvents().data.totalElements}`);
    cy.get('[data-cy="show-more-events-button"]').should('exist');
    cy.get('[data-cy="event-log-toggle"]').should('exist').contains('Dölj exporter').click({ force: true });
  });

  it('can export statistics and create event', () => {
    statisticsDataIntercept();
    cy.intercept('POST', '**/api/event/create**', createEvent());

    const downloadsFolder = Cypress.config('downloadsFolder');
    const exportFileName = path.join(
      downloadsFolder,
      `Export-${getMe.data.facilities[0].address?.street}-Fjärrvärme-${dayjs().format('YYYY-MM-DD')}.xlsx`
    );

    cy.get('[data-cy="export-statistics-button"]').should('not.be.disabled').click();
    cy.readFile(exportFileName);
  });

  it('can handle empty data response', () => {
    emptyStatisticsDataIntercept();

    cy.get('[data-cy="empty-response-container"]').should('exist');
    cy.get('[data-cy="export-statistics-button"]').should('be.disabled');
  });
});
