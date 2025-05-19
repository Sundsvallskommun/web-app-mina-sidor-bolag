export const appURL = (withSubPath: boolean): string => {
  return `${window.location.origin}${withSubPath ? process.env.NEXT_PUBLIC_BASE_PATH : ''}`;
};
