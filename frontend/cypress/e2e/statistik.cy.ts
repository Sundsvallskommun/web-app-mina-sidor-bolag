import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getStatisticsData } from '../fixtures/getMeasurementData';
import dayjs from 'dayjs';
import { getMe } from '../fixtures/getMe';
import { Aggregation, Category } from '@interfaces/measurement-data';
import { getNetOwner } from '../fixtures/getNetOwner';
import path from 'path';
import { createEvent, getEvents } from '../fixtures/getExportEvents';
import { getMyPagedAgreements } from 'cypress/fixtures/getMyPagedAgreements';
describe('Statistik', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/paged/all-agreements', getMyPagedAgreements());
  });

  const statisticsDataIntercept = () => {
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityIds=*&fromDate=*&toDate=*&aggregateOn=*`,
      getStatisticsData(yesterday, yesterday, Category.ELECTRICITY, Aggregation.HOUR)
    );
    cy.intercept('POST', '**/api/netowner', getNetOwner());

    cy.visit('/privat/statistik');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Din statistik');
  };

  const emptyStatisticsDataIntercept = () => {
    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityIds=*&fromDate=*&toDate=*&aggregateOn=*`,
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
    cy.get('[data-cy="facility-select"]').should('exist');
    cy.get('[data-cy="outdoor-temperature-chart"]').should('exist');
    cy.get('[data-cy="export-statistics-button"]').should('exist');
    cy.get('[data-cy="export-statistics-button"]').should('not.be.disabled');
    cy.get('[data-cy="statistics-faq"]').should('exist');
  });

  it('should render filters correctly', () => {
    statisticsDataIntercept();

    cy.get('[data-cy="address-select"]').should('exist');
    cy.get('[data-cy="facility-select"]').should('exist');
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
      `**/api/measurementdata?category=DISTRICT_HEATING&facilityIds=*&fromDate=*&toDate=*&aggregateOn=*`,
      getStatisticsData(fromDate, toDate, Category.DISTRICT_HEATING, Aggregation.HOUR)
    ).as('getDistrictHeatingData');

    cy.get('[data-cy="facility-type-Fjärrvärme"]').should('exist').click({ force: true });

    cy.get('[data-cy="facility-select"]').should('exist');
  });

  it('can display statistics by year, month and day', () => {
    statisticsDataIntercept();

    const fromDate = dayjs().startOf('month').toISOString();
    const toDate = dayjs().toISOString();

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityIds=*&fromDate=*&toDate=*&aggregateOn=HOUR`,
      getStatisticsData(fromDate, toDate, Category.ELECTRICITY, Aggregation.HOUR)
    ).as('getStatisticsData');

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityIds=*&fromDate=*&toDate=*&aggregateOn=MONTH`,
      getStatisticsData(fromDate, toDate, Category.ELECTRICITY, Aggregation.MONTH)
    ).as('getStatisticsData');

    cy.get('[data-cy="date-toggle"]').should('exist');

    cy.get('[data-cy="date-toggle-year-button"]').should('exist').click();
    cy.get('[data-cy="date-toggle-day-button"]').should('exist').click();
  });


  it('clamps day when switching from a 31-day month to a shorter month', () => {
    statisticsDataIntercept();

    cy.get('[data-cy="date-toggle-day-button"]').should('exist').click();
    cy.get('[data-cy="day-select"]').clear().type('2024-03-31').blur();
    cy.get('[data-cy="day-select"]').should('have.value', '2024-03-31');

    cy.get('[data-cy="date-toggle-month-button"]').should('exist').click();
    cy.get('[data-cy="month-select"]').select('2024-04-01');

    cy.get('[data-cy="date-toggle-day-button"]').should('exist').click();
    cy.get('[data-cy="day-select"]').should('have.value', '2024-04-30');
  });

  it('requests and receives correct dates when comparing statistics', () => {
    statisticsDataIntercept();

    const fromDate = dayjs().startOf('month').subtract(1, 'year').format('YYYY');
    const toDate = dayjs().subtract(1, 'year').format('YYYY');

    const yesterdayLastYear = dayjs().subtract(1, 'day').subtract(1, 'year').format('YYYY-MM-DD');
    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityIds=*&fromDate=${fromDate}*&toDate=${toDate}*&aggregateOn=*`,
      getStatisticsData(yesterdayLastYear, yesterdayLastYear, Category.ELECTRICITY, Aggregation.HOUR)
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

  it('can open and close export modal', () => {
    statisticsDataIntercept();

    cy.get('[data-cy="export-statistics-button"]').should('not.be.disabled').click();
    cy.contains('Exportera statistik till Excel').should('exist');
    cy.get('[data-cy="export-modal-cancel-button"]').click();
    cy.contains('Exportera statistik till Excel').should('not.exist');
  });

  it('export modal has facility pre-selected and export button is enabled', () => {
    statisticsDataIntercept();

    cy.get('[data-cy="export-statistics-button"]').should('not.be.disabled').click();
    cy.get('[data-cy="export-modal-confirm-button"]').should('not.be.disabled');
  });

  it('export modal disables export when all facilities are deselected', () => {
    statisticsDataIntercept();

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=DISTRICT_HEATING&facilityIds=*&fromDate=*&toDate=*&aggregateOn=*`,
      getStatisticsData(
        dayjs().startOf('month').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD'),
        Category.DISTRICT_HEATING,
        Aggregation.HOUR
      )
    );
    cy.get('[data-cy="facility-type-Fjärrvärme"]').click({ force: true });

    cy.get('[data-cy="export-statistics-button"]').should('not.be.disabled').click();
    cy.get('[data-cy="export-facilities-accordion-header"]').click();
    cy.get('[data-cy="export-facilities-select-all"]').click({ force: true });
    cy.get('[data-cy="export-modal-confirm-button"]').should('be.disabled');
  });

  it('export modal shows time interval option for electricity day period', () => {
    statisticsDataIntercept();

    cy.get('[data-cy="export-statistics-button"]').should('not.be.disabled').click();
    cy.get('[data-cy="export-category-select"]').select(Category.ELECTRICITY);
    cy.get('[data-cy="export-modal-date-toggle-day-button"]').click();
    cy.contains('Tidsupplösning').should('exist');
  });

  it('can export statistics and create event', () => {
    statisticsDataIntercept();
    cy.intercept('POST', '**/api/event/create**', createEvent());

    const downloadsFolder = Cypress.config('downloadsFolder');
    const exportFileName = path.join(downloadsFolder, `Export-Elförbrukning-${dayjs().format('YYYY-MM-DD')}.xlsx`);

    cy.get('[data-cy="export-statistics-button"]').should('not.be.disabled').click();
    cy.get('[data-cy="export-modal-confirm-button"]').should('not.be.disabled').click();
    cy.readFile(exportFileName);
  });

  it('can handle empty data response', () => {
    emptyStatisticsDataIntercept();

    cy.get('[data-cy="empty-response-container"]').should('exist');
    cy.get('[data-cy="export-statistics-button"]').should('be.disabled');
  });
});
