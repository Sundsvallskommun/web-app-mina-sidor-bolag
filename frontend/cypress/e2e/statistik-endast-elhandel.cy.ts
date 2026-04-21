import { RepresentingMode } from '@interfaces/app';
import { getMeOnlyTrade } from '../fixtures/getMe';
import { interceptRepresentingMode } from '../support/e2e';
import { getStatisticsData } from '../fixtures/getMeasurementData';
import dayjs from 'dayjs';
import { Aggregation, Category } from '../../src/interfaces/measurement-data';
import { getNetOwner } from '../fixtures/getNetOwner';
import { getMyRelationsOnlyTrade } from '../fixtures/getMyRelations';
import { getAgreementOnlyTrade } from '../fixtures/getMyPagedAgreements';
import { isReady } from 'cypress/fixtures/ai';

describe('Handle user with only trade agreement', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/me', getMeOnlyTrade);
    interceptRepresentingMode(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/paged/all-agreements', getAgreementOnlyTrade());
    cy.intercept('GET', '**/api/ai/isReady', isReady(false));
    cy.intercept(
      'GET',
      `**/api/measurementdata?category=ELECTRICITY&facilityIds=111&fromDate=**&toDate=**&aggregateOn=DAY`,
      getStatisticsData(
        dayjs().startOf('month').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD'),
        Category.ELECTRICITY,
        Aggregation.DAY
      )
    );
    cy.intercept('POST', '**/api/netowner', getNetOwner());
    cy.intercept('GET', '**/api/myrelations', getMyRelationsOnlyTrade);
    cy.intercept('GET', '**/api/paged/agreements', getAgreementOnlyTrade());

    cy.visit('/privat/statistik');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Din statistik');
  });

  it('can handle only electricity trade', () => {
    cy.get('[data-cy="only-trade"]')
      .should('exist')
      .contains(
        'Din förbrukning ser du hos ditt elnätsbolag. För denna anläggning ser vi att du har Sundsvall Elnät AB.'
      );
  });
});
