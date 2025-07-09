import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import dayjs from 'dayjs';
import {
  getOverviewDistrictHeatingData,
  getOverviewElectricityData,
  getOverviewElectricityProductionData,
} from '../fixtures/getMeasurementData';
import { getMe } from '../fixtures/getMe';
import { getPendingInvoices } from '../fixtures/getInvoices';

describe('Översikt', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.visit('/privat/oversikt');

    cy.intercept('GET', '**/api/invoices/pending?**', getPendingInvoices()).as('getPendingInvoices');

    const fromDate = dayjs().startOf('month').subtract(12, 'months').toISOString();
    const toDate = dayjs().endOf('month').toISOString();

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=DISTRICT_HEATING&facilityId=333&fromDate=*&toDate=*&aggregateOn=MONTH`,
      getOverviewDistrictHeatingData(fromDate, toDate)
    ).as('getOverviewDistrictHeatingData');

    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityId=111&fromDate=*&toDate=*&aggregateOn=MONTH`,
      getOverviewElectricityData(fromDate, toDate)
    ).as('getOverviewElectricityData');
    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityId=222&fromDate=*&toDate=*&aggregateOn=MONTH`,
      getOverviewElectricityProductionData(fromDate, toDate)
    ).as('getOverviewElectricityProductionData');
  });

  it('should render Översikt', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', '');

    // Consumption cards
    getMe.data.addresses[0].facilityIds.forEach((facility) => {
      cy.get(`[data-cy="${facility}"]`).should('exist');
    });

    // To do
    cy.get('[data-cy="todo-invoices-item"]').should('exist').contains('Att göra');
    cy.get('[data-cy="todo-list-item-subtitle"]')
      .should('exist')
      .should('include.text', `Du har ${getPendingInvoices().data._meta.totalRecords} fakturor att betala.`);
  });
});
