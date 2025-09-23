export const formatPhoneNumber = (countryCode: string, phoneNumber: string) => {
  if (phoneNumber.startsWith('0')) {
    phoneNumber = phoneNumber.substring(1);
  }

  return phoneNumber.length
    ? `+${countryCode.split('+').slice(1)}${phoneNumber}`.replaceAll('-', '').replaceAll(' ', '')
    : '';
};
