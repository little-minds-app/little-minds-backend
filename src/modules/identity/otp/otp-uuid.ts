/** UUID v4/v7 shape check before casting to Postgres uuid (anti SQL noise / anti-enum). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidV4OrV7(value: string): boolean {
  return UUID_RE.test(value);
}
