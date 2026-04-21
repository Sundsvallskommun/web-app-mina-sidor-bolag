import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getStatisticsData } from '../fixtures/getMeasurementData';
import dayjs from 'dayjs';
import { Aggregation, Category } from '@interfaces/measurement-data';
import { getNetOwner } from '../fixtures/getNetOwner';
import { getMyPagedAgreements } from '../fixtures/getMyPagedAgreements';

describe('Statistik - Handle previous (inactive) facility', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/paged/all-agreements', getMyPagedAgreements()).as('getAllAgreements');
  });

  const visitAndSelectPreviousFacility = () => {
    const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
    const today = dayjs().format('YYYY-MM-DD');

    cy.intercept(
      'GET',
      '**/api/measurementdata?category=ELECTRICITY&facilityIds=444&fromDate=*&toDate=*&aggregateOn=*',
      getStatisticsData(monthStart, today, Category.ELECTRICITY, Aggregation.DAY, '444')
    ).as('getPreviousFacilityData');

    cy.intercept(
      'GET',
      '**/api/measurementdata?category=DISTRICT_HEATING&facilityIds=333&fromDate=*&toDate=*&aggregateOn=DAY',
      getStatisticsData(monthStart, today, Category.DISTRICT_HEATING, Aggregation.DAY)
    );

    cy.intercept('POST', '**/api/netowner', getNetOwner());

    cy.visit('/privat/statistik');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Din statistik');

    cy.get('[data-cy="address-select"]').should('exist').select('Gamla Vägen 42');
  };

  it('should render chart for previous (inactive) facility instead of OnlyTrade', () => {
    visitAndSelectPreviousFacility();

    cy.get('[data-cy="contract-select"]').should('exist').should('include.text', '444');

    cy.get('[data-cy="consumption-chart"]').should('exist');
    cy.get('[data-cy="only-trade"]').should('not.exist');
  });

  it('should display correct address for previous facility', () => {
    visitAndSelectPreviousFacility();

    cy.get('[data-cy="address"]').should('exist').should('have.text', 'Gamla Vägen 42');
  });

  it('should show consumption data for previous facility', () => {
    visitAndSelectPreviousFacility();

    cy.wait('@getPreviousFacilityData');
    cy.get('[data-cy="total-consumption-value"]').should('exist');
  });
});
