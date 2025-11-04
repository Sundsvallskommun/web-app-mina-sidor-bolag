export const getMandate = {
  grantorDetails: {
    name: 'Ankeborgs Margarinfabrik',
    grantorPartyId: 'fb2f0290-3820-11ed-a261-0242ac120002',
    signatoryPartyId: 'fb2f0290-3820-11ed-a261-0242ac120003',
  },
  granteeDetails: {
    partyId: 'fb2f0290-3820-11ed-a261-0242ac120004',
  },
  activeFrom: '2025-08-01',
  inactiveAfter: '2025-12-31',
  signingInfo: {
    orderRef: '131daac9-16c6-4618-beb0-365768f37288',
    status: 'complete',
    completionData: {
      bankIdIssueDate: '2020-01-02',
      signature: 'YmFzZTY0LWVuY29kZWQgZGF0YQ==',
      ocspResponse: 'YmFzZTY0LWVuY29kZWQgZGF0YQ==',
      risk: 'low',
      user: {
        personalNumber: '200001012384',
        name: 'John Wick',
        givenName: 'John',
        surname: 'Wick',
      },
      device: {
        ipAddress: '192.168.1.1',
        uhi: 'OZvYM9VvyiAmG7NA5jU5zqGcVpo=',
      },
      stepUp: {
        mrtd: true,
      },
    },
  },
};

export const getOrgMandates = {
  message: 'success',
  page: 1,
  limit: 100,
  count: 7,
  totalRecords: 7,
  totalPages: 1,
  sortBy: ['status', 'created'],
  sortDirection: 'ASC',
  data: [
    {
      id: '12345678-1234-1234-1234-123455678890',
      activeFrom: '2025-11-03',
      inactiveAfter: '2028-11-03',
      created: '2025-11-03T16:28:24.429+01:00',
      status: 'ACTIVE',
      grantor: {
        name: 'Test Testsson',
      },
      grantee: {
        name: 'Grantee Testsson',
        personNumber: 190021079999,
      },
    },
    {
      id: '12345678-1234-1234-1234-123455678891',
      activeFrom: '2025-11-03',
      inactiveAfter: '2028-11-03',
      created: '2025-11-03T16:28:24.429+01:00',
      status: 'INACTIVE',
      grantor: {
        name: 'Test Testsson',
      },
      grantee: {
        name: 'Grantee Grantsson',
        personNumber: 200001019999,
      },
    },
    {
      id: '12345678-1234-1234-1234-123455678892',
      activeFrom: '2025-11-03',
      inactiveAfter: '2028-11-03',
      created: '2025-11-03T16:28:24.429+01:00',
      status: 'DELETED',
      grantor: {
        name: 'Test Testsson',
      },
      grantee: {
        name: 'Grantee Testsson',
        personNumber: 190021079999,
      },
    },
    {
      id: '12345678-1234-1234-1234-123455678893',
      activeFrom: '2020-11-03',
      inactiveAfter: '2021-11-03',
      created: '2025-11-03T16:28:24.429+01:00',
      status: 'EXPIRED',
      grantor: {
        name: 'Test Testsson',
      },
      grantee: {
        name: 'Grantee Grantsson',
        personNumber: 190021079999,
      },
    },
  ],
};
