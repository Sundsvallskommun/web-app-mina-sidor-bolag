import { setIntercepts } from '../support/e2e';
import { RepresentingMode } from '@interfaces/app';
import { deleteDelegate, getDelegates, patchDelegates, postDelegate } from '../fixtures/getDelegates';
import { deleteContactSetting, getContactSettings, patchContactSettings } from '../fixtures/getContactSettings';

describe('Profil och inställningar', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/delegates', getDelegates()).as('getDelegates');

    cy.visit('/privat/profil');
  });

  it('should render page correctly', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Din profil och inställningar');

    cy.get('[data-cy="contact-information-disclosure"]').should('exist').should('include.text', 'Kontaktuppgifter');
    cy.get('[data-cy="notifications-disclosure"]').should('exist').should('include.text', 'Aviseringar');
  });

  it('should render contact information correctly', () => {
    cy.get('[data-cy="contact-information-disclosure"]')
      .should('exist')
      .should('include.text', 'Kontaktuppgifter')
      .click();

    cy.get('[data-cy="form-box-name"]').should('exist').should('have.text', getContactSettings(0).data.name);
    cy.get('[data-cy="form-box-email"]').should('exist').should('have.text', getContactSettings(0).data.email);
    cy.get('[data-cy="form-box-phone"]').should('exist').should('have.text', getContactSettings(0).data.phone);
  });

  it('can edit email and phone number', () => {
    cy.intercept('POST', '**/api/contactsettings', patchContactSettings()).as('patchContactSettings');

    cy.get('[data-cy="contact-information-disclosure"]')
      .should('exist')
      .should('include.text', 'Kontaktuppgifter')
      .click();

    // Edit email
    cy.get('[data-cy="edit-email-button"]').should('exist').click();
    cy.get('input').should('exist').clear().type('123');
    cy.get('.sk-form-error-message').should('exist').contains('E-postadress har fel format');
    cy.get('[data-cy="cancel-edit-email-button"]').should('exist').click();
    cy.get('[data-cy="form-box-email"]').should('exist').should('have.text', getContactSettings(0).data.email);
    cy.get('[data-cy="edit-email-button"]').should('exist').click();
    cy.get('input').should('exist').clear().type('mail@example.com');
    cy.get('[data-cy="save-email-button"]').should('exist').click();

    // Edit phone
    cy.get('[data-cy="edit-phone-button"]').should('exist').click();
    cy.get('input').should('exist').clear().type('abc');
    cy.get('.sk-form-error-message').should('exist').contains('Telefonnummer har fel format');
    cy.get('[data-cy="cancel-edit-phone-button"]').should('exist').click();
    cy.get('[data-cy="form-box-phone"]').should('exist').should('have.text', getContactSettings(0).data.phone);
    cy.get('[data-cy="edit-phone-button"]').should('exist').click();
    cy.get('input').should('exist').clear().type('+46701740635');
    cy.get('[data-cy="save-phone-button"]').should('exist').click();
  });

  it('can edit notification channels', () => {
    cy.intercept('POST', '**/api/contactsettings', patchContactSettings()).as('patchContactSettings');

    cy.get('[data-cy="notifications-disclosure"]').should('exist').should('include.text', 'Aviseringar').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist').click();
    cy.get('[data-cy="notification-channel-sms-checkbox"]').should('exist').should('be.checked').check();
    cy.get('[data-cy="notification-channel-email-checkbox"]').should('exist').should('be.checked').check();
    cy.get('[data-cy="cancel-edit-notification-channel-button"]').should('exist').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist').click();
    cy.get('[data-cy="notification-channel-sms-checkbox"]').should('exist').should('be.checked').check();
    cy.get('[data-cy="notification-channel-email-checkbox"]').should('exist').should('be.checked').check();
    cy.get('[data-cy="save-notification-channel-button"]').should('exist').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist').click();
    cy.get('[data-cy="notification-channel-sms-checkbox"]').should('exist').should('not.be.checked');
    cy.get('[data-cy="notification-channel-email-checkbox"]').should('exist').should('not.be.checked');
  });

  it('should render notifications and contact persons correctly', () => {
    cy.get('[data-cy="notifications-disclosure"]').should('exist').should('include.text', 'Aviseringar').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist');
    cy.get('[data-cy="delegate-alias"]').should('exist').contains('Kontaktperson');
    cy.get('[data-cy="edit-delegate"]').should('exist');
    cy.get('[data-cy="add-delegate-button"]').should('exist');
  });

  it('can edit contact person', () => {
    cy.intercept('PATCH', '**/api/contactsettings', patchContactSettings()).as('patchContactSettings');
    cy.intercept('PATCH', '**/api/delegates', patchDelegates()).as('patchDelegates');

    cy.get('[data-cy="notifications-disclosure"]').should('exist').should('include.text', 'Aviseringar').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist');
    cy.get('[data-cy="delegate-alias"]').should('exist').contains('Kontaktperson');
    cy.get('[data-cy="edit-delegate"]').should('exist').click();

    cy.get('input[name="contactSetting.alias"]').should('exist').clear();
    cy.get('input[name="contactSetting.phone"]').should('exist').clear();

    cy.get('[data-cy="cancel-delegate-form-button"]').should('exist').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist');
    cy.get('[data-cy="edit-delegate"]').should('exist').click();
    cy.get('[data-cy="delegate-alias"]').should('exist').contains('Kontaktperson');

    cy.get('input[name="contactSetting.alias"]').should('exist').clear().type('Kontaktperson Kontaktpersson');
    cy.get('input[name="contactSetting.phone"]').should('exist').clear().type('+46701740635');

    cy.get('[data-cy="save-delegate-button"]').should('exist').click();
  });

  it('can add contact person', () => {
    cy.intercept('POST', '**/api/contactsettings', patchContactSettings());
    cy.intercept('POST', '**/api/delegates', postDelegate());

    cy.get('[data-cy="notifications-disclosure"]').should('exist').should('include.text', 'Aviseringar').click();

    cy.get('[data-cy="add-delegate-button"]').should('exist').click();
    cy.get('input[name="contactSetting.alias"]').should('exist').type('Kontaktperson Kontaktpersson');
    cy.get('input[name="contactSetting.phone"]').should('exist').type('+46701740635');

    cy.get('[data-cy="delegation-all-addresses-checkbox"]').should('exist').check({ force: true });

    cy.get('[data-cy="save-delegate-button"]').should('exist').click();
  });

  it('can remove contact person', () => {
    cy.intercept('DELETE', '**/api/delegates/**', deleteContactSetting());
    cy.intercept('DELETE', '**/api/contactsettings/**', deleteDelegate());

    cy.get('[data-cy="notifications-disclosure"]').should('exist').should('include.text', 'Aviseringar').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist');
    cy.get('[data-cy="delegate-alias"]').should('exist').contains('Kontaktperson');
    cy.get('[data-cy="edit-delegate"]').should('exist').click();
    cy.get('[data-cy="remove-contact-person-button"]').should('exist').click();
    cy.get('.sk-dialog-buttons > .sk-btn-primary').should('have.text', 'Ta bort').click();
  });
});
