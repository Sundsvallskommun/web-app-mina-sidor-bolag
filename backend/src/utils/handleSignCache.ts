import { RequestWithUser } from '@/interfaces/auth.interface';

const emptysigncache = {
  pending: {},
  completed: {},
  details: {},
  mandates: {},
};

type SignCacheType = keyof RequestWithUser['session']['signs'];

export const handleSignCache = (req: RequestWithUser) => {
  req.session.signs ??= emptysigncache;
  const set = <T = any>(type: SignCacheType, ref: string, data: T) => {
    req.session.signs[type] = { ...req.session.signs[type], [ref]: data as any };
  };
  const get = <T = unknown>(type: SignCacheType, ref: string) => {
    const data = req.session.signs[type]?.[ref];
    if (!data) return undefined;
    return data as T;
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
