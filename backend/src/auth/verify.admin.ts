import { VerifiedCallback } from '@node-saml/passport-saml';
import { Profile } from '@interfaces/profile.interface';
import { User } from '@interfaces/users.interface';
import { getPermissionsByGroups } from '@/services/authorization.service';
import { RequestWithUser } from '@interfaces/auth.interface';
import { RepresentingMode } from '@interfaces/representing.interface';

export const adminVerify = async (profile: Profile, done: VerifiedCallback) => {
  if (!profile) {
    return done({
      name: 'SAML_MISSING_PROFILE',
      message: 'Missing SAML profile',
    });
  }

  const username = profile.attributes?.['username'];
  const email = profile.attributes?.['email'];
  const groups = profile.attributes?.['groups'];
  const displayName = profile.attributes?.['displayName'];

  if (!username || !groups) {
    return done(null, null, {
      name: 'SAML_MISSING_ATTRIBUTES',
      message: 'Missing admin attributes',
    });
  }

  const adminUser: User = {
    partyId: username,
    name: displayName ?? username,
    givenName: profile.firstname ?? '',
    surname: profile.Surname ?? '',
    username,
    email,
    groups,
    userType: 'admin',
    nameID: profile.nameID,
    nameIDFormat: profile.nameIDFormat,
    sessionIndex: profile.sessionIndex,
    permissions: await getPermissionsByGroups(groups.split(',').map((g: string) => g.trim())),
  };

  done(null, adminUser);
};

export const adminLoginSuccess = async (req: RequestWithUser): Promise<void> => {
  req.session.representing = { mode: RepresentingMode.ADMIN };
};
