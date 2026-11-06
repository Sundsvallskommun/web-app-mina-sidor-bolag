import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { getStatisticsData } from '../fixtures/getMeasurementData';
import dayjs from 'dayjs';
import { Aggregation, Category } from '@interfaces/measurement-data';
import { getNetOwner } from '../fixtures/getNetOwner';

describe('Statistik - Handle previous (inactive) facility', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
  });

  const visitAndSelectPreviousFacility = () => {
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    // Initial single-facility request fired on mount (default selects only Storgatan 1 / facility 111).
    // Stub it so React Query doesn't sit in a failed state while we switch to facility 444.
    cy.intercept(
      'GET',
      '**/api/measurementdata?category=ELECTRICITY&facilityIds=*',
      getStatisticsData(yesterday, yesterday, Category.ELECTRICITY, Aggregation.HOUR)
    );

    cy.intercept(
      'GET',
      '**/api/measurementdata?category=ELECTRICITY&facilityIds=444&fromDate=*&toDate=*&aggregateOn=*',
      getStatisticsData(yesterday, yesterday, Category.ELECTRICITY, Aggregation.HOUR, '444')
    ).as('getPreviousFacilityData');

    cy.intercept(
      'GET',
      '**/api/measurementdata?category=DISTRICT_HEATING&facilityIds=333&fromDate=*&toDate=*&aggregateOn=HOUR',
      getStatisticsData(yesterday, yesterday, Category.DISTRICT_HEATING, Aggregation.HOUR)
    );

    cy.intercept('POST', '**/api/netowner', getNetOwner());

    cy.visit('/privat/statistik');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Din statistik');

    cy.get('[data-cy="facility-select"] input.sk-form-combobox-select').click();
    cy.get('[data-cy="facility-select"] input[role="option"][value="444"]')
      .check({ force: true })
      .should('be.checked');
    cy.get('[data-cy="facility-select"] input[role="option"][value="111"]')
      .uncheck({ force: true })
      .should('not.be.checked');
  };

  it('should render chart for previous (inactive) facility instead of OnlyTrade', () => {
    visitAndSelectPreviousFacility();

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
