/**
 * Helpers for reading NEXT_PUBLIC_* values.
 *
 * Next inlines NEXT_PUBLIC_* values as string literals at build time. The Docker image is built with
 * placeholders (.env-cicd) that entrypoint.sh replaces with the real values when the container
 * starts. A comparison written directly on the inlined value, such as
 * `process.env.NEXT_PUBLIC_X === 'true'`, is evaluated by the minifier at build time against the
 * placeholder and removed, so it never sees the real value. Doing the comparison inside this module
 * keeps it at runtime.
 */

export const envEquals = (value: string | undefined, expected: string): boolean => value === expected;

/** True only when the value is exactly "true". */
export const isEnvEnabled = (value: string | undefined): boolean => envEquals(value, 'true');

/** A positive integer, or the fallback when the value is unset, empty or invalid. */
export const envPositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
