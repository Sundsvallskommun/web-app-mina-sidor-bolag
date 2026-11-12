import CountdownTimer from '@components/countdown/countdown-timer.component';
import { useInactivityTrigger } from '@utils/use-inactivity-trigger.hook';
import { Button, Dialog } from '@sk-web-gui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const WARNING_TIMEOUT = process.env.NEXT_PUBLIC_INACTIVITY_WARNING_TIMEOUT
  ? Number.parseInt(process.env.NEXT_PUBLIC_INACTIVITY_WARNING_TIMEOUT, 10)
  : 10 * 60 * 1000;
const COUNTDOWN_TIMEOUT = process.env.NEXT_PUBLIC_INACTIVITY_COUNTDOWN_TIMEOUT
  ? Number.parseInt(process.env.NEXT_PUBLIC_INACTIVITY_COUNTDOWN_TIMEOUT, 10)
  : 5 * 60 * 1000;

interface InactivityAlertProps {
  onLogout: () => void;
  enabled: boolean;
}

export const InactivityAlert: React.FC<InactivityAlertProps> = ({ onLogout, enabled }) => {
  const { t } = useTranslation(['common']);
  const [showWarning, setShowWarning] = useState(false);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleLogout = useCallback(() => {
    clearTimeout(countdownTimerRef.current);
    setShowWarning(false);
    onLogout();
  }, [onLogout]);

  const handleInactive = useCallback(() => {
    setShowWarning(true);
    countdownTimerRef.current = setTimeout(handleLogout, COUNTDOWN_TIMEOUT);
  }, [handleLogout]);

  // Activity while the dialog is open must not count; the user has to answer it.
  useInactivityTrigger({ onInactive: handleInactive, timeout: WARNING_TIMEOUT, enabled: enabled && !showWarning });

  const handleStay = () => {
    clearTimeout(countdownTimerRef.current);
    setShowWarning(false);
  };

  useEffect(() => () => clearTimeout(countdownTimerRef.current), []);

  return (
    <Dialog show={showWarning} aria-label={t('common:inactivity.title')} hideLabel onClose={handleStay}>
      <Dialog.Content>
        <h1 className="sk-dialog-confirm-heading">{t('common:inactivity.title')}</h1>
        <p>
          {showWarning && (
            <Trans
              i18nKey="common:inactivity.description"
              components={{ strong: <strong />, countdown: <CountdownTimer timeout={COUNTDOWN_TIMEOUT} /> }}
            />
          )}
        </p>
      </Dialog.Content>
      <Dialog.Buttons>
        <Button variant="secondary" onClick={handleLogout}>
          {t('common:logout.logout')}
        </Button>
        <Button variant="primary" color="primary" onClick={handleStay}>
          {t('common:inactivity.stay')}
        </Button>
      </Dialog.Buttons>
    </Dialog>
  );
};
