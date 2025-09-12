export function tle_cleaner(TLE_line: string): string {
  return TLE_line.replace("\r", "").trim();
}
