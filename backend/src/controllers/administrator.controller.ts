import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponse } from '@/interfaces/service';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import adminMiddleware from '@middlewares/admin.middleware';
import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { UserEngagement } from '@interfaces/users.interface';
import { logger } from '@utils/logger';

@Controller()
@UseBefore(authMiddleware)
@UseBefore(adminMiddleware)
export class AdministratorController {
  private readonly apiService = new ApiService();
  private readonly CitizenApiBase = getApiBase('citizen');
  private readonly LEApiBase = getApiBase('legalentity');

  @Get('/user-engagements/:personNumber')
  @OpenAPI({ summary: 'Get engagements by person number' })
  async getUserEngagements(
    @Req() req: RequestWithUser,
    @Param('personNumber') personNumber: string,
  ): Promise<ApiResponse<UserEngagement>> {
    const representing = req.session?.representing ?? undefined;
    const partyId = getRepresentingPartyId(representing);
    const userEngagements: UserEngagement = {} as UserEngagement;

    if (!partyId || !personNumber) {
      throw new HttpException(400, 'Bad Request');
    }

    try {
      const url = `${this.CitizenApiBase}/${MUNICIPALITY_ID}/${personNumber}/guid`;
      const partyId = await this.apiService.get<string>({ url }, req.user);
      const userPartyId = partyId.data;

      if (userPartyId) {
        const citizenUrl = `${this.CitizenApiBase}/${MUNICIPALITY_ID}/${userPartyId}`;
        const citizenResponse = await this.apiService.get<CitizenExtended>({ url: citizenUrl }, req.user);

        if (citizenResponse.data) {
          userEngagements.userPersonNumber = personNumber;
          userEngagements.userPartyId = userPartyId;
          userEngagements.canRepresent = [
            {
              name: `${citizenResponse.data.givenname} ${citizenResponse.data.lastname}`,
              representingNumber: personNumber,
            },
          ];
        }
      }
    } catch (error) {
      if (error.status === 404 || error.status === 400) {
        return { data: {} as UserEngagement, message: 'success' };
      }
      logger.error('Error getting user engagements', error);
      throw new HttpException(500, 'Error getting user engagement');
    }

    try {
      const LEUrl = `${this.LEApiBase}/${MUNICIPALITY_ID}/engagements/person/${personNumber}`;
      const LEResponse = await this.apiService.get<PersonEngagement[]>({ url: LEUrl }, req.user);

      if (LEResponse.data) {
        LEResponse.data.forEach(engagement => {
          userEngagements.canRepresent.push({
            name: engagement.name,
            representingNumber: engagement.organizationNumber,
          });
        });
      }
    } catch (error) {
      logger.error('Error getting LE engagements', error);
    }

    return { data: userEngagements, message: 'success' };
  }
}
