//Subscribed APIS as lowercased
export const APIS = [
  {
    name: 'legalentity',
    version: '2.0',
  },
  {
    name: 'contactsettings',
    version: '2.0',
  },
  {
    name: 'citizen',
    version: '3.0',
  },
  {
    name: 'disturbances',
    version: '5.0',
  },
  {
    name: 'invoices',
    version: '9.0',
  },
  {
    name: 'customer',
    version: '4.0',
  },
  {
    name: 'installedbase',
    version: '3.1',
  },
  {
    name: 'agreement',
    version: '4.1',
  },
  {
    name: 'measurementdata',
    version: '3.0',
  },
  {
    name: 'simulatorserver',
    version: '2.0',
  },
  {
    name: 'myrepresentatives',
    version: '4.2',
  },
  {
    name: 'eventlog',
    version: '2.1',
  },
  {
    name: 'bfus',
    version: '1.0.0',
  },
] as const;

type ApiName = (typeof APIS)[number]['name'];

export const getApiBase = (name: ApiName) => {
  const api = APIS.find(api => api.name === name);
  return `${api?.name}/${api?.version}`;
};
