import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { PersonEngagementsApiResponse, BusinessInformationApiResponse } from '@/responses/legal-entity.response';
import { getPersonEngagements, getBusinessInformation } from '@services/legal-entity.service';
import { logger } from '@/utils/logger';
import { Response } from 'express';
import { Controller, Get, Req, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
export class LegalEntityController {
  @Get('/engagements')
  @OpenAPI({ summary: 'Return a list of business engagements for current logged in user' })
  @ResponseSchema(PersonEngagementsApiResponse)
  async getEngagements(
    @Req() req: RequestWithUser,
    @Res() res: Response<PersonEngagementsApiResponse>,
  ): Promise<Response<PersonEngagementsApiResponse>> {
    if (!req.user.personNumber) {
      throw new HttpException(400, 'Bad Request');
    }

    const controller = new AbortController();
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });
    try {
      let engagements = req.session.representingBusinessChoices;

      if (!engagements || engagements.length <= 0) {
        engagements = await getPersonEngagements(req.user);
        if (!engagements) {
          throw new HttpException(404, 'Not Found');
        }
        req.session.representingBusinessChoices = engagements ?? [];
      }

      const data = engagements.map(engagement => {
        const { organizationNumber, name, isAuthorizedSignatory, isSoleTrader } = engagement;
        return { organizationNumber, name, isAuthorizedSignatory, isSoleTrader };
      });

      return res.send({ data, message: 'success' });
    } catch (error) {
      logger.error('Error getting business engagements', error);
      throw new HttpException(500, 'Internal server error');
    }
  }

  @Get('/businessinformation')
  @OpenAPI({ summary: 'Return business information for current representing organisation' })
  @ResponseSchema(BusinessInformationApiResponse)
  async getBusinessInformation(
    @Req() req: RequestWithUser,
    @Res() res: Response<BusinessInformationApiResponse>,
  ): Promise<Response<BusinessInformationApiResponse>> {
    const engagement = req.session.representing?.BUSINESS;
    const controller = new AbortController();
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    if (!engagement) {
      throw new HttpException(500, 'Internal Server Error - Does not exist');
    }

    if (!engagement.organizationNumber) {
      throw new HttpException(500, 'Internal Server Error - Data not complete');
    }
    const details = await getBusinessInformation(engagement, req.user);

    if (!details) {
      throw new HttpException(404, 'Not Found');
    }
    const { address } = details;

    return res.send({ data: { address }, message: 'success' });
  }
}
