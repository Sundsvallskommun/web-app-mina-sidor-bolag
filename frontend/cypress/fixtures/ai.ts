export const isReady = (ready: boolean = false) =>
  ready
    ? {
        data: { status: 'READY', details: 'success' },
        message: 'success',
      }
    : { data: { status: 'FAILED', details: 'success' }, message: 'success' };
