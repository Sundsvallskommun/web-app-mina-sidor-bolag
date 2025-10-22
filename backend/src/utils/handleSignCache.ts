import { RequestWithUser } from '@/interfaces/auth.interface';

const emptysigncache = {
  pending: {},
  completed: {},
  details: {},
};

type SignCacheType = keyof RequestWithUser['session']['signs'];

export const handleSignCache = (req: RequestWithUser) => {
  req.session.signs ??= emptysigncache;
  const set = (type: SignCacheType, ref: string, data: any) => {
    req.session.signs[type] = { ...req.session.signs[type], [ref]: data };
  };
  const get = (type: SignCacheType, ref: string) => {
    return req.session.signs[type]?.[ref];
  };
  const remove = (type: SignCacheType, ref: string) => {
    const old = req.session.signs[type];
    if (old?.[ref]) {
      delete old?.[ref];
    }
    req.session.signs[type] = old ?? {};
  };

  return { set, get, remove };
};
