import { RequestWithUser } from '@/interfaces/auth.interface';
import ApiService from '@/services/api.service';
import { CustomerRelation, Customer } from '@/data-contracts/customer/data-contracts';
import { getRepresentingPartyId } from '@utils/getRepresentingPartyId';
import { MUNICIPALITY_ID } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { logger } from '@/utils/logger';

export class SessionCacheService {
  private readonly apiService = new ApiService();

  private handleCustomerRelationsError(error: any): void {
    if (error.status === 404) {
      logger.info('User has no relations');
    } else {
      throw new HttpException(500, 'Could not fetch customer relations');
    }
  }

  public async cacheRelations(req: RequestWithUser): Promise<void> {
    req.session.cache ??= {};
    const delegations = req.session.cache.delegations ?? [];
    const allRelations: CustomerRelation[] = [];
    const { representing } = req.session ?? {};

    if (req.session.cache.relations) return;

    const partyId = getRepresentingPartyId(representing);
    if (!partyId) throw new HttpException(400, 'Representing partyId not available');

    try {
      const url = `/customer/${MUNICIPALITY_ID}/relations/${partyId}`;
      const res = await this.apiService.get<Customer>({ url }, req.user);

      const relations = res.data?.customerRelations ?? [];

      relations.forEach(r =>
        allRelations.push({
          ...r,
          organizationName: r.organizationName.replace(/\s*(AB)\s*$/g, ''),
        }),
      );
    } catch (error) {
      this.handleCustomerRelationsError(error);
    }

    for (const delegation of delegations) {
      try {
        const url = `/customer/${MUNICIPALITY_ID}/relations/${delegation.owner}`;
        const res = await this.apiService.get<Customer>({ url }, req.user);

        const relations = res.data?.customerRelations ?? [];

        relations.forEach(r => {
          if (!allRelations.some(existing => existing.organizationNumber === r.organizationNumber)) {
            allRelations.push({
              customerNumber: r.customerNumber,
              organizationNumber: r.organizationNumber,
              organizationName: r.organizationName.replace(/\s*(AB)\s*$/g, ''),
            });
          }
        });
      } catch (error) {
        this.handleCustomerRelationsError(error);
      }
    }

    const customerNumbers = Array.from(new Set(allRelations.map(r => r.customerNumber).filter(Boolean)));

    req.session.cache.relations = {
      customerRelations: allRelations,
      customerNumber: customerNumbers,
    };
  }
}

export const sessionCacheService = new SessionCacheService();
