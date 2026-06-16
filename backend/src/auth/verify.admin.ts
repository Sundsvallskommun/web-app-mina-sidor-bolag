import { VerifiedCallback } from '@node-saml/passport-saml';
import { RequestWithUser } from '../interfaces/auth.interface';
import { Profile } from '../interfaces/profile.interface';
import { RepresentingMode } from '../interfaces/representing.interface';
import { User } from '../interfaces/users.interface';
import { getPermissionsByGroups } from '@/services/authorization.service';

/**
 * Verify callback for the internal admin IdP.
 *
 * Admins are NOT identified by personnummer and do not exist in the Citizen API,
 * so this flow does not perform any Citizen lookup, create user settings, or fetch
 * business engagements. Users are tagged with `userType: 'admin'` so authorization
 * middleware can gate admin-only areas.
 *
 * TODO: Confirm the exact attribute names emitted by the admin IdP and adjust the
 * reads below (and the optional AD-group gate).
 */
export const adminVerify = async (profile: Profile, done: VerifiedCallback) => {
  if (!profile) {
    return done({
      name: 'SAML_MISSING_PROFILE',
      message: 'Missing SAML profile',
    });
  }

  console.log('Admin SAML profile:', JSON.stringify(profile));

  // TODO: confirm admin IdP attribute names
  const username = profile.attributes?.['userid'];
  // const email = profile.attributes?.['email'];
  const groups = profile.attributes?.['groups'];
  const displayName = `${profile.attributes?.['firstname'] ?? ''} ${profile.attributes?.['Surname'] ?? ''}`;

  if (!username) {
    return done(null, null, {
      name: 'SAML_MISSING_ATTRIBUTES',
      message: 'Missing admin attributes',
    });
  }

  console.log('Admin SAML attributes:', { username, groups, displayName });

  console.log('Parsed admin groups:', groups.split(',').map((g: string) => g.trim()));

  // TODO: optionally gate on a required AD group and emit 'SAML_MISSING_GROUP' otherwise.

  const adminUser: User = {
    partyId: username,
    name: displayName ?? username,
    givenName: profile.firstname ?? '',
    surname: profile.Surname ?? '',
    username,
    groups,
    userType: 'admin',
    nameID: profile.nameID,
    nameIDFormat: profile.nameIDFormat,
    sessionIndex: profile.sessionIndex,
    permissions: await getPermissionsByGroups(groups.split(',').map((g: string) => g.trim())),
  };

  done(null, adminUser);
};

/**
 * Post-login hook for the admin flow. Admins have no citizen identity, so we set an
 * explicit ADMIN representing context (no PRIVATE/BUSINESS, no partyId). This gives the
 * frontend an `/admin` mode to render against, while `getRepresentingPartyId` still
 * resolves to undefined so no citizen data is fetched.
 */
export const adminLoginSuccess = async (req: RequestWithUser): Promise<void> => {
  req.session.representing = { mode: RepresentingMode.ADMIN };
};
