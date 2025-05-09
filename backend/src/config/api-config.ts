//Subscribed APIS as lowercased
export const APIS = [
  {
    name: 'businessengagements',
    version: '3.0',
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
    version: '8.0',
  },
  {
    name: 'customer',
    version: '4.0',
  },
  {
    name: 'installedbase',
    version: '3.0',
  },
] as const;

export const getApiBase = (name: string) => {
  const api = APIS.find(api => api.name === name);
  return `${api?.name}/${api?.version}`;
};
