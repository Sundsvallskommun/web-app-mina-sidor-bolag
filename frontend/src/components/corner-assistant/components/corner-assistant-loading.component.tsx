import { Spinner } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';

interface CornerAssistantLoadingProps {
  isMobile: boolean;
}

export const CornerAssistantLoading: React.FC<CornerAssistantLoadingProps> = ({ isMobile }) => {
  const { t } = useTranslation();
  return (
    <div
      className="sk-ai-corner-module"
      data-cy="corner-assistant-loading"
      data-fullscreen="false"
      data-docked="true"
      data-mobile={isMobile}
      aria-busy="true"
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
              <Spinner className="white-spinner" size={3.2} />
              <div className="sk-ai-corner-module-header-header">{t('ai:loading_assistant')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
