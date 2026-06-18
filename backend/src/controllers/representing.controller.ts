import { PersonEngagement } from '@/data-contracts/legalentity/data-contracts';
import { ClientRepresentingApiResponse } from '@/responses/representing.response';
import { getBusinessInformation } from '@services/legal-entity.service';
import { deleteAISession, startAISession } from '@/services/selfserviceai.service';
import { getRepresentingPartyId } from '@/utils/getRepresentingPartyId';
import { logger } from '@/utils/logger';
import { RepresentsDto } from '@dtos/represents.dto';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import authMiddleware from '@middlewares/auth.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import getDelegatedFacilities from '@services/delegation.service';
import { Response } from 'express';
import { Body, Controller, Get, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { RepresentingEntity, RepresentingEntityClient, RepresentingMode } from '../interfaces/representing.interface';
import { getIsWhitelisted } from '@services/mandate.service';

type IntersectByProperties<T, U> = Pick<T & U, Extract<keyof T, keyof U>>;

@Controller()
export class RepresentingController {
  getSelected = <
    TSelected extends Record<string, any>,
    MatchKey extends keyof IntersectByProperties<TSelected, RepresentsDto>,
  >(
    choices: TSelected[],
    selectedRepresenting: RepresentsDto,
    matchKey: MatchKey,
  ): TSelected => {
    if (!choices) {
      throw new HttpException(400, 'Bad Request - No choices');
    }
    const selected = choices.find(rc => rc[matchKey] === selectedRepresenting[matchKey]);

    if (!selected) {
      throw new HttpException(400, 'Bad Request - Does not exists');
    }
    return selected;
  };

  fixGuid = guid => guid?.replace(/[^a-zA-Z0-9-]/g, '');

  getDefaultPRIVATE = (req: RequestWithUser) => ({
    partyId: this.fixGuid(req.user.partyId),
    personNumber: req.user.personNumber,
    name: req.user.name,
  });

  getDefaultBUSINESS = async (req: RequestWithUser) => {
    const representingBusinessChoices = req.session?.representingBusinessChoices || [];
    const selected = this.getSelected<PersonEngagement, 'organizationNumber'>(
      representingBusinessChoices,
      req.body,
      'organizationNumber',
    );
    const { address, partyId } = await getBusinessInformation(selected, req.user);
    const whitelisted = await getIsWhitelisted(req.user, partyId);

    return {
      partyId: this.fixGuid(partyId),
      organizationName: selected.name,
      organizationNumber: selected.organizationNumber,
      isAuthorizedSignatory: selected.isAuthorizedSignatory,
      whitelisted: whitelisted,
      information: { address },
    };
  };

  getRepresentingToSend: (representing: RepresentingEntity) => RepresentingEntityClient = newRepresenting => ({
    BUSINESS: newRepresenting?.BUSINESS
      ? {
          organizationName: newRepresenting?.BUSINESS?.organizationName,
          organizationNumber: newRepresenting?.BUSINESS?.organizationNumber,
          isAuthorizedSignatory: newRepresenting?.BUSINESS?.isAuthorizedSignatory,
          whitelisted: newRepresenting?.BUSINESS?.whitelisted,
          information: newRepresenting?.BUSINESS?.information,
        }
      : undefined,
    PRIVATE: newRepresenting.PRIVATE
      ? {
          name: newRepresenting?.PRIVATE?.name,
        }
      : undefined,
    mode: newRepresenting?.mode,
  });

  @Get('/representing')
  @OpenAPI({ summary: 'Return which entity a logged in user represents' })
  @ResponseSchema(ClientRepresentingApiResponse)
  @UseBefore(authMiddleware)
  async getRepresenting(
    @Req() req: RequestWithUser,
    @Res() res: Response<ClientRepresentingApiResponse>,
  ): Promise<Response<ClientRepresentingApiResponse>> {
    const representing = req.session?.representing ?? undefined;

    if (!representing) {
      return res.send({
        data: this.getRepresentingToSend({ mode: undefined } as RepresentingEntity),
        message: 'success',
      });
    }

    if (representing.mode !== RepresentingMode.ADMIN && !representing.PRIVATE) {
      req.session.representing.PRIVATE = this.getDefaultPRIVATE(req);
    }

    if (representing.mode === RepresentingMode.BUSINESS && !representing.BUSINESS) {
      throw new HttpException(400, 'Representing not set');
    }

    return res.send({ data: this.getRepresentingToSend(req.session.representing), message: 'success' });
  }

  @Post('/representing')
  @UseBefore(validationMiddleware(RepresentsDto, 'body'))
  @ResponseSchema(ClientRepresentingApiResponse)
  @OpenAPI({ summary: 'Sets which entity a logged in user represents' })
  @UseBefore(authMiddleware)
  async postRepresenting(
    @Body() selectedRepresenting: RepresentsDto,
    @Req() req: RequestWithUser,
    @Res() res: Response<ClientRepresentingApiResponse>,
  ): Promise<Response<ClientRepresentingApiResponse>> {
    if (req.user.userType === 'admin' && !req.user.permissions?.isImpersonatingUser) {
      throw new HttpException(403, 'MISSING_PERMISSIONS');
    }

    const representing = req.session?.representing ?? undefined;
    try {
      await deleteAISession(req);
    } catch (error) {
      logger.error('Error deleting session', error);
    }

    let newRepresenting = representing;

    if (selectedRepresenting.organizationNumber !== undefined) {
      const data: RepresentingEntity = {
        BUSINESS: await this.getDefaultBUSINESS(req),
        PRIVATE: newRepresenting?.PRIVATE,
        mode: newRepresenting?.mode,
      };
      newRepresenting = data;
    }
    if (
      selectedRepresenting.personNumber !== undefined ||
      selectedRepresenting.mode === RepresentingMode.PRIVATE ||
      selectedRepresenting.mode === undefined
    ) {
      const data: RepresentingEntity = {
        BUSINESS: newRepresenting?.BUSINESS,
        PRIVATE: this.getDefaultPRIVATE(req),
        mode: newRepresenting?.mode,
      };
      newRepresenting = data;
    }
    if (selectedRepresenting.mode !== undefined) {
      const data: RepresentingEntity = {
        BUSINESS: newRepresenting?.BUSINESS,
        PRIVATE: newRepresenting?.PRIVATE,
        mode: selectedRepresenting.mode,
      };
      newRepresenting = data;
    }

    req.session.representing = newRepresenting;

    const clearRelations = () => (req.session.cache.relations = null);

    if (getRepresentingPartyId(newRepresenting)) {
      req.session.cache.delegations = await getDelegatedFacilities(getRepresentingPartyId(newRepresenting)).catch(
        err => {
          console.error('Error fetching delegated facilities:', err);
          return [];
        },
      );

      clearRelations();
    }

    try {
      await startAISession(req);
    } catch (error) {
      logger.error('Error starting new AI session', error);
    }

    return res.send({ data: this.getRepresentingToSend(newRepresenting), message: 'success' });
  }
}
