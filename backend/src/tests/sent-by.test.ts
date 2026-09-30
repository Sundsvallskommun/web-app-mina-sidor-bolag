import { buildSentBy } from '@services/api.service';

describe('buildSentBy', () => {
  it('labels an admin as an AD account', () => {
    expect(buildSentBy({ username: 'abc123', userType: 'admin' })).toBe('type=adAccount; abc123');
  });

  it('labels a customer by partyId', () => {
    const partyId = '1dabb1b3-fbcc-4515-935c-bd8d38ff1df2';
    expect(buildSentBy({ username: partyId, userType: 'customer' })).toBe(`type=partyId; ${partyId}`);
  });

  it('defaults to partyId when the kind is unknown', () => {
    expect(buildSentBy({ username: 'saml-login' })).toBe('type=partyId; saml-login');
  });
});
