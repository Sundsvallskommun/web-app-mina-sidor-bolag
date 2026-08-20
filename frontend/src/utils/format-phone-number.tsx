export const DEFAULT_PHONE_COUNTRY_CODE = '+46';

const MOBILE_NUMBER_REGEXP = /^(?:\+46|0046|0)?7\d{8}$/;

const SUBSCRIBER_GROUPS_REGEXP = /^(\d{2})(\d{3})(\d{2})(\d{2})$/;

const getDialCode = (countryCode: string) => countryCode.split('+').slice(1).join('');

const stripSeparators = (phoneNumber: string) => phoneNumber.replace(/[\s-]/g, '');

const toSubscriberNumber = (digits: string, dialCode: string) => {
  if (digits.startsWith(`+${dialCode}`)) {
    return digits.substring(dialCode.length + 1);
  }
  if (digits.startsWith(`00${dialCode}`)) {
    return digits.substring(dialCode.length + 2);
  }
  if (digits.startsWith('0')) {
    return digits.substring(1);
  }
  return digits.replace(/^\+/, '');
};

/** Turns the number from the input into the stored format (e.g "0701234567" -> "+46701234567") */
export const formatPhoneNumber = (countryCode: string, phoneNumber: string) => {
  const dialCode = getDialCode(countryCode);
  const subscriberNumber = toSubscriberNumber(stripSeparators(phoneNumber), dialCode);

  return subscriberNumber.length ? `+${dialCode}${subscriberNumber}` : '';
};

/** Turns a number "+46701234567" into "701234567". */
const toSubscriberPhoneNumber = (phoneNumber?: string | null, countryCode: string = DEFAULT_PHONE_COUNTRY_CODE) =>
  phoneNumber ? toSubscriberNumber(stripSeparators(phoneNumber), getDialCode(countryCode)) : '';

/** "701234567" -> "70 123 45 67" */
export const toGroupedPhoneNumber = (phoneNumber?: string | null, countryCode: string = DEFAULT_PHONE_COUNTRY_CODE) => {
  const subscriberNumber = toSubscriberPhoneNumber(phoneNumber, countryCode);
  const groups = SUBSCRIBER_GROUPS_REGEXP.exec(subscriberNumber);

  return groups ? `${groups[1]} ${groups[2]} ${groups[3]} ${groups[4]}` : subscriberNumber;
};

export const isValidMobileNumber = (phoneNumber?: string | null) =>
  !phoneNumber || MOBILE_NUMBER_REGEXP.test(stripSeparators(phoneNumber));

export const toDisplayPhoneNumber = (phoneNumber?: string | null, countryCode: string = DEFAULT_PHONE_COUNTRY_CODE) => {
  const dialCode = getDialCode(countryCode);
  const subscriberNumber = toSubscriberNumber(stripSeparators(phoneNumber ?? ''), dialCode);
  const groups = SUBSCRIBER_GROUPS_REGEXP.exec(subscriberNumber);

  return groups ? `+${dialCode} ${groups[1]}-${groups[2]} ${groups[3]} ${groups[4]}` : (phoneNumber ?? '');
};
