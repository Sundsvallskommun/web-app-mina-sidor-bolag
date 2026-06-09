import { MUNICIPALITY_ID } from '@config';
import { VerifiedCallback } from '@node-saml/passport-saml';
import { logger } from '@utils/logger';
import prisma from '@utils/prisma';
import { sanitizePersonNumber } from '@utils/sanitizePersonNumber';
import { getApiBase } from '../config/api-config';
import { HttpException } from '../exceptions/HttpException';
import { RequestWithUser } from '../interfaces/auth.interface';
import { Profile } from '../interfaces/profile.interface';
import { RepresentingMode } from '../interfaces/representing.interface';
import { User } from '../interfaces/users.interface';
import ApiService from '../services/api.service';
import { getBusinessEngagements } from '../services/business-engagements.service';
import getDelegatedFacilities from '../services/delegation.service';
import { getPermissions } from '@/services/authorization.service';

/**
 * Verify callback for the external customer IdP. Resolves a partyId from the
 * Citizen API using the SAML personnummer and creates user settings for new users.
 */
export const customerVerify =
  (apiService: ApiService) =>
  async (profile: Profile, done: VerifiedCallback) => {
    if (!profile) {
      return done({
        name: 'SAML_MISSING_PROFILE',
        message: 'Missing SAML profile',
      });
    }
    const { firstname: givenName, Surname: surname, citizenIdentifier } = profile;

    if (!givenName || !surname || !citizenIdentifier) {
      return done(null, null, {
        name: 'SAML_MISSING_ATTRIBUTES',
        message: 'Missing profile attributes',
      });
    }

    try {
      const apiBase = getApiBase('citizen');
      const personNumber = sanitizePersonNumber(profile.citizenIdentifier);
      const url = `${apiBase}/${MUNICIPALITY_ID}/${personNumber}/guid`;
      const citizenResult = await apiService.get<any>({ url }, { username: 'unknown' });
      const { data: personId } = citizenResult;

      if (!personId) {
        return done({
          name: 'SAML_CITIZEN_FAILED',
          message: 'Failed to fetch user from Citizen API',
        });
      }

      const findUser: User = {
        partyId: personId,
        personNumber: personNumber,
        name: `${givenName} ${surname}`,
        givenName: givenName,
        surname: surname,
        username: 'unknown',
        userType: 'customer',
        nameID: profile.nameID,
        nameIDFormat: profile.nameIDFormat,
        sessionIndex: profile.sessionIndex,
        permissions: await getPermissions(personId),
      };

      const userSettings = await prisma.userSettings.findFirst({ where: { userId: findUser.partyId } });
      // Create user settings for new users
      if (!userSettings) {
        await prisma.userSettings.create({
          data: {
            userId: findUser.partyId,
            feedbackLifespan: 'oneMonth',
            readNotificationsClearedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          },
        });
      }
      done(null, findUser);
    } catch (err) {
      if (err instanceof HttpException && err?.status === 404) {
        // TODO: Handle missing person form Citizen?
      }
      done(err);
    }
  };

/**
 * Post-login hook for the customer flow: stores the representing entity and
 * caches business engagements and delegated facilities on the session.
 */
export const customerLoginSuccess = async (
  req: RequestWithUser,
  user: User,
  relay: Record<string, any> | null,
): Promise<void> => {
  try {
    if (relay?.representingMode != null) {
      const mode = parseInt(relay.representingMode, 10) as RepresentingMode;
      req.session.representing = {
        mode,
        PRIVATE: {
          partyId: req.user.partyId?.replace(/[^a-zA-Z0-9-]/g, ''),
          personNumber: req.user.personNumber,
          name: req.user.name,
        },
      };
    }

    await getBusinessEngagements(user)
      .then(engagements => {
        req.session.representingBusinessChoices = engagements;
      })
      .catch(err => {
        console.error('Error fetching business engagements:', err);
        req.session.representingBusinessChoices = [];
      });

    req.session.cache ??= {};
    const delegations = await getDelegatedFacilities(user.partyId).catch(err => {
      console.error('Error fetching delegated facilities:', err);
      return [];
    });
    req.session.cache.delegations = delegations;
  } catch (error) {
    logger.error(error);
  }
};

/** No-op logout verify, shared by all flows. */
export const noopLogoutVerify = async (_profile: Profile, done: VerifiedCallback) => {
  return done(null, {});
};
