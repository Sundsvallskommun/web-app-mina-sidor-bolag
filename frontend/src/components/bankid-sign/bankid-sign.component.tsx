'use client';

import { apiService } from '@services/api-service';
import { cx, Modal } from '@sk-web-gui/react';
import isMobile from 'is-mobile';
import { useEffect, useRef, useState } from 'react';
import { Sign, SignCollect, SignCollectApiResponse } from 'src/data-contracts/backend/data-contracts';
import { BankIdFail } from './components/bankid-fail.component';
import { BankIdSignContent } from './components/bankid-sign-content.component';
import { BankIdSignFooter } from './components/bankid-sign-footer.component';

interface BankIdSignModalProps {
  open: boolean;
  data: Sign;
  onClose: (status?: SignCollect['status']) => void;
  onRenew: () => void;
}

export const INITIAL_TIME = 60 * 5;

export const BankIdSignModal: React.FC<BankIdSignModalProps> = (props) => {
  const { open, onClose, data, onRenew } = props;

  const [qrCode, setQrCode] = useState<string | undefined>();
  const [status, setStatus] = useState<SignCollect['status'] | undefined>();
  const [hintCode, setHintCode] = useState<string | undefined>();

  // NOTE: Time in seconds until
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [timeSinceStart, setTimeSinceStart] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isDevice = isMobile({ tablet: true, featureDetect: true });

  const [showQrCode, setShowQrCode] = useState<boolean>(!isDevice);

  const cancel = async () => {
    try {
      await apiService.post(`/sign/cancel/${data.orderRef}`);
    } catch (error) {
      console.error('Failed to cancel BankID signing process', error);
    }
  };

  const handleClose = async (currentstatus?: SignCollect['status']) => {
    const _status = currentstatus ?? status;
    if (_status === 'pending' && data?.orderRef) {
      await cancel();
    }
    clearInterval(intervalRef.current!);
    onClose(_status);
  };

  const renew = async () => {
    clearInterval(intervalRef.current!);
    await cancel();
    onRenew();
  };

  useEffect(() => {
    const stop = async () => {
      clearInterval(intervalRef.current!);
      if (status === 'pending' && hintCode === 'outstandingTransaction') {
        await cancel();
        setStatus('failed');
        setHintCode('timeout');
      }
    };
    if (!timeLeft) {
      stop();
    } else if (timeSinceStart > 27 && status === 'pending' && hintCode === 'outstandingTransaction') {
      renew();
    }
  }, [timeSinceStart, timeLeft]);

  const handleRenew = () => {
    setQrCode(undefined);
    setHintCode(undefined);
    setStatus(undefined);
    setTimeLeft(INITIAL_TIME);
    onRenew();
  };

  const checkStatus = () => {
    if (data?.orderRef) {
      apiService
        .get<SignCollectApiResponse>('/sign/' + data.orderRef)
        .then(async (response) => {
          setStatus(response.data.data.status);
          setHintCode(response.data.data.hintCode);
          if (response.data.data.status === 'pending' && response.data.data.hintCode === 'outstandingTransaction') {
            setQrCode(response.data.data.qrCode);
          } else {
            setQrCode(undefined);
          }
          if (response.data.data.status === 'complete') {
            setQrCode(undefined);
            clearInterval(intervalRef.current!);
            handleClose('complete');
          }
          if (response.data.data.status === 'failed') {
            setQrCode(undefined);
            clearInterval(intervalRef.current!);
          }
        })
        .catch((e) => {
          console.log(e);
          setStatus('failed');
          setHintCode(undefined);
        });
    }
  };

  useEffect(() => {
    if (open && data.orderRef) {
      setTimeSinceStart(0);
      setStatus('pending');
      setQrCode(data.qrCode);
      intervalRef.current = setInterval(() => {
        checkStatus();
        setTimeLeft((time) => time - 1);
        setTimeSinceStart((time) => time + 1);
      }, 1000);
    }
    return () => {
      clearInterval(intervalRef.current!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data.orderRef]);

  return (
    <Modal
      data-cy="bankid-sign-modal"
      className={cx('w-full max-h-full', 'bg-background-100', {
        ['bg-error-background-100']: status === 'failed',
        ['sm:max-w-[52rem] md:mx-0']: !isDevice,
        ['max-md:w-screen max-md:h-screen max-md:-ml-16 max-md:-mr-16 max-md:rounded-0']: isDevice,
      })}
      show={open && !!data}
      onClose={handleClose}
    >
      {status === 'failed' ? (
        <BankIdFail onClose={handleClose} onRetry={handleRenew} hintCode={hintCode} />
      ) : (
        <>
          <BankIdSignContent showQrCode={showQrCode} qrCode={qrCode} timeLeft={timeLeft} hintCode={hintCode} />
          <BankIdSignFooter data={data} onShowQrCode={setShowQrCode} />
        </>
      )}
    </Modal>
  );
};
