'use client';

import { useTranslation } from 'react-i18next';
import { queryClient, useApi } from '@services/api-service';
import { consentQueryKeys, Group } from '@services/consent-service';
import React from 'react';
import { useSnackbar, useThemeQueries } from '@sk-web-gui/react';
import { ConsentRequestDto } from '@interfaces/consent';
import { NewConsentListItem } from '@layouts/pages/mypages-sections/consent/new-consents/new-consent-list-item/new-consent-list-item.component';
import { NewConsentCardItem } from '@layouts/pages/mypages-sections/consent/new-consents/new-consent-card-item/new-consent-card-item.component';

interface NewConsentProps {
  consents: Record<string, Group>;
  customerIds: number[];
}

type ConsentMutationOptions<TPayload> = {
  payload: TPayload;
  mutation: {
    mutateAsync: (payload: TPayload) => Promise<unknown>;
  };
  successMessage: string;
  errorMessage: string;
};

export const NewConsents = (props: NewConsentProps) => {
  const { consents, customerIds } = props;
  const { t } = useTranslation(['common', 'consent']);
  const { isMinLg } = useThemeQueries();
  const snackBar = useSnackbar();

  const grantConsent = useApi({
    url: '/bfus/consent/grant',
    method: 'post',
    mutationOptions: {
      onSuccess: () => {
        queryClient.refetchQueries({
          queryKey: [consentQueryKeys.consents, customerIds],
        });
      },
    },
  });

  const denyConsent = useApi({
    url: '/bfus/consent/deny',
    method: 'post',
    mutationOptions: {
      onSuccess: () => {
        queryClient.refetchQueries({
          queryKey: [consentQueryKeys.consents, customerIds],
        });
      },
    },
  });

  const handleConsentMutation = async ({
    payload,
    mutation,
    successMessage,
    errorMessage,
  }: ConsentMutationOptions<ConsentRequestDto>) => {
    try {
      await mutation.mutateAsync(payload);
      await queryClient.invalidateQueries({
        queryKey: [consentQueryKeys.consents],
      });
      snackBar({
        message: successMessage,
        status: 'success',
      });
    } catch {
      snackBar({
        message: errorMessage,
        status: 'error',
      });
    }
  };

  const handleApproveConsent = async (contractIds: number[], eligablePartyId: string, customerId: number) => {
    await handleConsentMutation({
      payload: {
        PermissionRequest: {
          ContractIdList: contractIds,
          EligablePartyId: eligablePartyId,
          CustomerId: customerId,
        },
      },
      mutation: grantConsent,
      successMessage: t('consent:consents.item.approveSuccess'),
      errorMessage: t('consent:consents.item.approveError'),
    });
  };

  const handleDenyConsent = async (customerId: number, eligablePartyId: string) => {
    await handleConsentMutation({
      payload: {
        PermissionRequest: {
          CustomerId: customerId,
          EligablePartyId: eligablePartyId,
        },
      },
      mutation: denyConsent,
      successMessage: t('consent:consents.item.denySuccess'),
      errorMessage: t('consent:consents.item.denyError'),
    });
  };

  if (!consents || Object.keys(consents).length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="leading-h3-lg">{t('consent:consents.new')}</h3>
      <p className="pt-8">{t('consent:consents.description.new')}</p>
      {...Object.entries(consents).map(([company, parts]: [string, Group]) => {
        const commonProps = {
          company,
          consents: parts.parts,
          hasBeenProcessed: parts.hasBeenProcessed,
          handleApproveConsent,
          handleDenyConsent,
        };

        return isMinLg ? (
          <NewConsentListItem {...commonProps} key={company} />
        ) : (
          <NewConsentCardItem {...commonProps} key={company} />
        );
      })}
    </div>
  );
};
