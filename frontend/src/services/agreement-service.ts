import { Agreement, Category, AgreementData, RefinedAgreement } from '@interfaces/agreement';

const visibleCategories = ['ELECTRICITY', 'ELECTRICITY_TRADE', 'DISTRICT_HEATING'];

export const agreementCategories = {
  DISTRICT_COOLING: { label: 'Fjärrkyla', color: 'vattjom', icon: 'snowflake', contractor: 'Sundsvall energi' },
  DISTRICT_HEATING: { label: 'Fjärrvärme', color: 'vattjom', icon: 'waves', contractor: 'Sundsvall energi' },
  ELECTRICITY: { label: 'Elnät', color: 'warning', icon: 'utility', contractor: 'Sundsvall elnät' },
  ELECTRICITY_TRADE: { label: 'Elhandel', color: 'vattjom', icon: 'lightbulb', contractor: 'Sundsvall elnät' },
  WASTE_MANAGEMENT: { label: 'Avfall', color: 'warning', icon: 'trash', contractor: 'Sundsvall energi' },
  COMMUNICATION: { label: 'Bredband', color: 'vattjom', icon: 'wifi', contractor: 'Servanet' },
  UNKNOWN: { label: 'Okänd', color: 'gray', icon: 'question', contractor: 'Okänd' },
};

export const mapCategory = (category?: Category) => {
  if (category === undefined)
    return {
      code: 'UNKNOWN' as Category,
      color: agreementCategories['UNKNOWN'].color,
      label: agreementCategories['UNKNOWN'].label,
      icon: agreementCategories['UNKNOWN'].icon,
      contractor: agreementCategories['UNKNOWN'].contractor,
    };
  return Object.keys(agreementCategories).includes(category as unknown as string)
    ? {
        code: category,
        color: agreementCategories[category as keyof typeof agreementCategories].color,
        label: agreementCategories[category as keyof typeof agreementCategories].label,
        icon: agreementCategories[category as keyof typeof agreementCategories].icon,
        contractor: agreementCategories[category as keyof typeof agreementCategories].contractor,
      }
    : {
        code: 'UNKNOWN' as Category,
        color: agreementCategories['UNKNOWN'].color,
        label: agreementCategories['UNKNOWN'].label,
        icon: agreementCategories['UNKNOWN'].icon,
        contractor: agreementCategories['UNKNOWN'].contractor,
      };
};

export const handlePagedAgreementsResponse: (data: Agreement[]) => AgreementData = (data) => {
  if (data) {
    return data.reduce(function (r: { [key: string]: RefinedAgreement[] }, a: Agreement) {
      const key: string = a.siteAddress;
      if (a.mainAgreement && visibleCategories.includes(a.category)) {
        r[key] = r[key] || [];
        r[key].push({ ...a, category: mapCategory(a.category) });
      }
      return r;
    }, Object.create(null));
  } else {
    return {};
  }
};

export const pagedAgreementsHandler = (data: Agreement[]): AgreementData => handlePagedAgreementsResponse(data);

export const handleAgreementResponse: (data: Agreement[]) => RefinedAgreement[] = (data) => {
  return data
    ? data
        .map((agreement) => {
          return {
            ...agreement,
            category: mapCategory(agreement.category),
          };
        })
        .sort((a, b) => Number(b.mainAgreement) - Number(a.mainAgreement))
    : ([] as RefinedAgreement[]);
};

export const agreementHandler = (data: Agreement[]): RefinedAgreement[] => handleAgreementResponse(data);

export const getCategoryAsString = (categoryNumber: string): string => {
  switch (categoryNumber) {
    case '0':
      return 'ELECTRICITY';
    case '1':
      return 'ELECTRICITY_TRADE';
    case '2':
      return 'DISTRICT_COOLING';
    case '3':
      return 'DISTRICT_HEATING';
    case '4':
      return 'WASTE_MANAGEMENT';
    case '5':
      return 'COMMUNICATION';
    default:
      return '';
  }
};

export const getCategoryAsNumber = (category: string): string | undefined => {
  switch (category) {
    case 'ELECTRICITY':
      return '0';
    case 'ELECTRICITY_TRADE':
      return '1';
    case 'DISTRICT_COOLING':
      return '2';
    case 'DISTRICT_HEATING':
      return '3';
    case 'WASTE_MANAGEMENT':
      return '4';
    case 'COMMUNICATION':
      return '5';
    default:
      return undefined;
  }
};
