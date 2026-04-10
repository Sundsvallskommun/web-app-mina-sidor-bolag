import { Avatar, Spinner } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import React from 'react';

interface CornerAssistantStateProps {
  isMobile: boolean;
  isPending: boolean;
}

export const CornerAssistantState: React.FC<CornerAssistantStateProps> = ({ isMobile, isPending }) => {
  const { t } = useTranslation();

  return (
    <div
      className="sk-ai-corner-module"
      data-cy="corner-assistant-loading"
      data-fullscreen="false"
      data-docked="true"
      data-mobile={isMobile}
      aria-busy={isPending ? 'true' : 'false'}
    >
      <div className="sk-ai-corner-module-content">
        <div className="sk-ai-corner-module-content-row sk-ai-corner-module-content-main">
          <div
            className="sk-ai-corner-module-header !cursor-default"
            data-docked="true"
            data-fullscreen="false"
            data-mobile={isMobile}
            data-variant="default"
          >
            <div className="sk-ai-corner-module-header-title">
              {isPending ? (
                <>
                  <Spinner className="white-spinner" size={3.2} />
                  <div className="sk-ai-corner-module-header-header">{t('ai:loading_assistant')}</div>
                </>
              ) : (
                <div className="flex justify-start gap-16">
                  <Avatar className="my-auto" imageUrl="/ai/avatar.png" />
                  <div>
                    <p className="mb-0 font-bold">{t('ai:assistant_failed')}</p>
                    <p className="mt-0 text-small">{t('ai:try_again_later')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
