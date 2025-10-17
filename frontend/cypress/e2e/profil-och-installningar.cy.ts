import { deleteDelegate, patchDelegates, postDelegate } from '../fixtures/getDelegates';
import { deleteContactSetting, getContactSettings, patchContactSettings } from '../fixtures/getContactSettings';
import {
  deleteFacilityDelegate,
  getFacilityDelegates,
  patchFacilityDelegate,
  postFacilityDelegate,
} from '../fixtures/getFacilityDelegates';

describe('Profil och inställningar', () => {
  beforeEach(() => {
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
    cy.intercept('GET', '**/api/facility/delegations', getFacilityDelegates()).as('getFacilityDelegates');

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
    cy.get('.sk-form-error-message').should('exist').contains('Fyll i ett giltigt mobilnummer');
    cy.get('[data-cy="cancel-edit-phone-button"]').should('exist').click();
    cy.get('[data-cy="form-box-phone"]').should('exist').should('have.text', getContactSettings(0).data.phone);
    cy.get('[data-cy="edit-phone-button"]').should('exist').click();
    cy.get('input').should('exist').clear().type('701740635');
    cy.get('[data-cy="save-phone-button"]').should('exist').click();
  });

  it('can edit notification channels', () => {
    cy.intercept('POST', '**/api/contactsettings', patchContactSettings()).as('patchContactSettings');

    cy.get('[data-cy="notifications-disclosure"]').should('exist').should('include.text', 'Aviseringar').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist').click();
    cy.get('[data-cy="notification-channel-sms-checkbox"]')
      .should('exist')
      .should('not.be.checked')
      .check({ force: true });
    cy.get('[data-cy="notification-channel-email-checkbox"]')
      .should('exist')
      .should('not.be.checked')
      .check({ force: true });

    cy.get('[data-cy="notification-channel-sms-checkbox"]').should('exist').should('be.checked').check();
    cy.get('[data-cy="notification-channel-email-checkbox"]').should('exist').should('be.checked').check();
    cy.get('[data-cy="save-notification-channel-button"]').should('exist').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist').click();
    cy.get('[data-cy="notification-channel-sms-checkbox"]').should('exist').should('be.checked');
    cy.get('[data-cy="notification-channel-email-checkbox"]').should('exist').should('be.checked');
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
    cy.get('[data-cy="edit-delegate"]').should('exist').contains('Redigera').click();

    cy.get('input[name="contactSetting.alias"]').should('exist').clear();
    cy.get('input[name="contactSetting.phoneNumber"]').should('exist').clear();

    cy.get('[data-cy="cancel-delegate-form-button"]').should('exist').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist');
    cy.get('[data-cy="edit-delegate"]').should('exist').contains('Redigera').click();
    cy.get('[data-cy="delegate-alias"]').should('exist').contains('Kontaktperson');

    cy.get('input[name="contactSetting.alias"]').should('exist').clear().type('Kontaktperson Kontaktpersson');
    cy.get('input[name="contactSetting.phoneNumber"]').should('exist').clear().type('701740635');

    cy.get('[data-cy="save-delegate-button"]').should('exist').click();
  });

  it('can add contact person', () => {
    cy.intercept('POST', '**/api/contactsettings', patchContactSettings());
    cy.intercept('POST', '**/api/delegates', postDelegate());

    cy.get('[data-cy="notifications-disclosure"]').should('exist').should('include.text', 'Aviseringar').click();

    cy.get('[data-cy="add-delegate-button"]').should('exist').contains('Lägg till kontaktperson').click();
    cy.get('input[name="contactSetting.alias"]').should('exist').type('Kontaktperson Kontaktpersson');
    cy.get('input[name="contactSetting.phoneNumber"]').should('exist').type('701740635');

    cy.get('[data-cy="delegation-all-addresses-checkbox"]').should('exist').check({ force: true });

    cy.get('[data-cy="save-delegate-button"]').should('exist').click();
  });

  it('can remove contact person', () => {
    cy.intercept('DELETE', '**/api/delegates/**', deleteContactSetting());
    cy.intercept('DELETE', '**/api/contactsettings/**', deleteDelegate());

    cy.get('[data-cy="notifications-disclosure"]').should('exist').should('include.text', 'Aviseringar').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist');
    cy.get('[data-cy="delegate-alias"]').should('exist').contains('Kontaktperson');
    cy.get('[data-cy="edit-delegate"]').should('exist').click({ multiple: true });
    cy.get('[data-cy="remove-contact-person-button"]').should('exist').click({ multiple: true });
    cy.get('.sk-dialog-buttons > .sk-btn-primary').should('have.text', 'Ta bort').click();
  });

  it('should render facility delegates correctly', () => {
    cy.get('[data-cy="facility-delegates-disclosure"]').should('exist').should('include.text', 'Behörigheter').click();

    cy.get('[data-cy="edit-notification-channel-button"]').should('exist');
    cy.get('[data-cy="delegatedToName"]').should('exist').contains('Testperson Delegerade anläggningar');
    cy.get('[data-cy="edit-delegate"]').should('exist');
    cy.get('[data-cy="add-delegate-button"]').should('exist');
  });

  it('can add facility delegate', () => {
    cy.intercept('POST', '**/api/delegations', postFacilityDelegate());

    cy.get('[data-cy="facility-delegates-disclosure"]').should('exist').should('include.text', 'Behörigheter').click();

    cy.get('[data-cy="add-delegate-button"]').should('exist').contains('Lägg till behörighet').click();
    cy.get('input[name="delegatedToBirthDate"]').should('exist').type('19500101****');

    cy.get('[data-cy="facility-id-111"]').should('exist').check({ force: true });
    cy.get('[data-cy="facility-id-222"]').should('exist').check({ force: true });

    cy.get('[data-cy="save-delegate-button"]').should('exist').click();
  });

  it('can edit facility delegate', () => {
    cy.intercept('PATCH', '**/api/delegations/**', patchFacilityDelegate());

    cy.get('[data-cy="facility-delegates-disclosure"]').should('exist').should('include.text', 'Behörigheter').click();
    cy.get('[data-cy="delegatedToName"]').should('exist').contains('Testperson Delegerade anläggningar');

    cy.get('[data-cy="edit-facility-delegate"]').should('exist').contains('Redigera').click({ force: true });

    cy.get('input[name="delegatedToBirthDate"]').should('exist').should('have.attr', 'readonly', 'readonly');
    cy.get('[data-cy="facility-id-222"]').should('exist').should('be.checked').click({ force: true, multiple: true });
    cy.get('[data-cy="facility-id-222"]').should('exist').should('not.be.checked');

    cy.get('[data-cy="save-delegate-button"]').should('exist').click();
  });

  it('can remove facility delegate', () => {
    cy.intercept('DELETE', '**/api/delegations/**', deleteFacilityDelegate());

    cy.get('[data-cy="facility-delegates-disclosure"]').should('exist').should('include.text', 'Behörigheter').click();
    cy.get('[data-cy="delegatedToName"]').should('exist').contains('Testperson Delegerade anläggningar');

    cy.get('[data-cy="edit-facility-delegate"]').should('exist').click({ multiple: true });
    cy.get('[data-cy="remove-facility-delegate-button"]').should('exist').click({ multiple: true });
    cy.get('.sk-dialog-buttons > .sk-btn-primary').should('have.text', 'Ta bort').click();
  });
});
