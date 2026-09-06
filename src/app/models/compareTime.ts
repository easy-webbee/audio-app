function parseProviderDate(
  dateValue: string | Date,
  timeZone: string
): Date | null {
  if (!dateValue) return null;

  // Already a Date
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }

  // Convert to string safely
  const dateString = String(dateValue).trim();

  // Expected: yyyy-MM-dd HH:mm:ss
  const match = dateString.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;

  /*
   * Interpret the provider date as a local time
   * in the requested timezone.
   */
  const target = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  );

  // Get timezone offset for that specific date.
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(target);

  const offsetString = parts.find(
    (part) => part.type === 'timeZoneName'
  )?.value;

  if (!offsetString) {
    return null;
  }

  // Example: GMT-04:00 / GMT-05:00
  const offsetMatch = offsetString.match(/^GMT([+-])(\d{2}):?(\d{2})$/);

  if (!offsetMatch) {
    return null;
  }

  const sign = offsetMatch[1] === '+' ? 1 : -1;

  const offsetMinutes =
    sign * (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3]));

  return new Date(target.getTime() - offsetMinutes * 60 * 1000);
}

export function checkIfWithin5MinutesEST(
  dateValue: string | Date,
  range = 7
): boolean {
  const providerTime = parseProviderDate(dateValue, 'America/New_York');

  if (!providerTime) {
    return false;
  }

  const now = new Date();

  const diff = (providerTime.getTime() - now.getTime()) / (1000 * 60);

  return Math.abs(diff) <= range;
}

export function checkIfWithin5MinutesCST(
  dateValue: string | Date,
  range = 7
): boolean {
  const providerTime = parseProviderDate(dateValue, 'America/Chicago');

  if (!providerTime) {
    return false;
  }

  const now = new Date();

  const diff = (providerTime.getTime() - now.getTime()) / (1000 * 60);
  return Math.abs(diff) <= range;
}
