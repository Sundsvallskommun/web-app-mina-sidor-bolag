import '@cypress/code-coverage/support';

import { CookieConsentUtils } from '@sk-web-gui/react';
import { getEngagements } from '../fixtures/getEngagements';
import { getContactSettings } from 'cypress/fixtures/getContactSettings';
import { getRepresentingEntity } from 'cypress/fixtures/getRepresentingEntity';
import { getMe } from '../fixtures/getMe';
import { getMyRelations } from '../fixtures/getMyRelations';
import { getMyPagedAgreements } from '../fixtures/getMyPagedAgreements';
import dayjs from 'dayjs';
import {
  getOverviewDistrictHeatingData,
  getOverviewElectricityData,
  getOverviewElectricityProductionData,
} from '../fixtures/getMeasurementData';
import { getDelegates } from '../fixtures/getDelegates';
import { getFacilityDelegates } from '../fixtures/getFacilityDelegates';
import { getCitizen } from '../fixtures/getCitizen';
import { getOrgMandates } from 'cypress/fixtures/getMandate';
import { RepresentingMode } from '@interfaces/app';
import { isReady } from 'cypress/fixtures/ai';
import { getBFUSCustomerIds } from '../fixtures/getBFUSCustomerIds';
export const DEFAULT_COOKIE_VALUE = 'necessary%2Cstats';

localStorage.clear();

export const representingModeDefault = RepresentingMode.PRIVATE;

export const interceptRepresentingMode = (
  representingMode: RepresentingMode = representingModeDefault,
  businessIndex: number = 0
) => {
  cy.intercept('GET', '**/api/representing', getRepresentingEntity({ mode: representingMode, businessIndex })).as(
    `getRepresenting`
  );
  cy.intercept('POST', '**/api/representing', getRepresentingEntity({ mode: representingMode, businessIndex })).as(
    `postRepresenting`
  );
};

export const setIntercepts = (
  representingMode: RepresentingMode = representingModeDefault,
  businessIndex: number = 0
) => {
  cy.intercept('GET', '**/api/me', getMe).as('getUser');
  interceptRepresentingMode(representingMode, businessIndex);
  cy.intercept('GET', '**/api/engagements', getEngagements).as('getEngagements');
  cy.intercept('GET', '**/api/myrelations', getMyRelations).as('getMyRelations');
  cy.intercept('GET', '**/api/paged/agreements', getMyPagedAgreements()).as('getMyPagedAgreements');
  cy.intercept('GET', '**/api/paged/agreements?page=*', {
    data: {
      agreements: getMyPagedAgreements().data,
      _meta: { page: 1, limit: 100, totalPages: 1 },
    },
    message: 'success',
  }).as('getMyPagedAgreementsPages');
  cy.intercept('GET', '**/api/paged/all-agreements?page=*', {
    data: {
      agreements: getMyPagedAgreements().data,
      _meta: { page: 1, limit: 100, totalPages: 1 },
    },
    message: 'success',
  }).as('getMyPagedAllAgreementsPages');
  cy.intercept('GET', '**/api/contactsettings', getContactSettings(representingMode)).as('getContactSettings');

  cy.intercept('GET', '**/api/delegates', getDelegates()).as('getDelegates');
  cy.intercept('GET', '**/api/facility/delegations', getFacilityDelegates()).as('getFacilityDelegates');

  cy.intercept('POST', '**/api/citizen', getCitizen).as('getCitizen');
  cy.intercept('GET', '**/api/mandates/org', getOrgMandates).as('getOrgMandates');
  cy.intercept('GET', '**/api/ai/isReady', isReady()).as('AIisReady');

  cy.intercept('GET', '**/api/bfus/eligable-party-customer-id', getBFUSCustomerIds(RepresentingMode.PRIVATE)).as(
    'getCustomerIds'
  );

  const fromDate = dayjs().subtract(1, 'year').startOf('month').toISOString();
  const toDate = dayjs().endOf('month').toISOString();

  cy.intercept(
    'GET',
    `**/api/measurementdata?category=DISTRICT_HEATING&facilityIds=333&fromDate=*&toDate=*&aggregateOn=MONTH`,
    getOverviewDistrictHeatingData(fromDate, toDate)
  ).as('getOverviewDistrictHeatingData');

  cy.intercept(
    'GET',
    `**/api/measurementdata?category=ELECTRICITY&facilityIds=111&fromDate=*&toDate=*&aggregateOn=MONTH`,
    getOverviewElectricityData(fromDate, toDate)
  ).as('getOverviewElectricityData');
  cy.intercept(
    'GET',
    `**/api/measurementdata?category=ELECTRICITY&facilityIds=222&fromDate=*&toDate=*&aggregateOn=MONTH`,
    getOverviewElectricityProductionData(fromDate, toDate)
  ).as('getOverviewElectricityProductionData');

  cy.intercept(
    'GET',
    `**/api/measurementdata?category=ELECTRICITY&facilityIds=444&fromDate=*&toDate=*&aggregateOn=MONTH`,
    getOverviewElectricityData(fromDate, toDate)
  ).as('getOverviewPreviousFacilityData');
};

beforeEach(() => {
  cy.setCookie(CookieConsentUtils.defaultCookieConsentName, DEFAULT_COOKIE_VALUE);
  cy.viewport('macbook-16');
});
