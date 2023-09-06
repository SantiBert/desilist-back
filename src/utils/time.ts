import {DateTime, Duration} from 'luxon';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {getNetworkTime} = require('@destinationstransfers/ntp');

export interface TraceTimer {
  getElapsedTime: () => number;
}

export function getISONow(): DateTime {
  return DateTime.now().toISO();
}

export function getUTCNow(): DateTime {
  return DateTime.utc();
}

export function dateToUTC(date: Date): DateTime {
  return DateTime.fromISO(date.toISOString()).toUTC();
}

export function dateToEpoch(date: DateTime): number {
  const MILLISECONDS_IN_SECOND = 1000;
  return Math.floor(date.valueOf() / MILLISECONDS_IN_SECOND);
}

export function getLocalEndOfDay(): DateTime {
  const local = DateTime.local().setZone(process.env.LOCALE_TIMEZONE);
  return local.endOf('day');
}

export function parseISOToTimeZone(date: string, timezone?: string): DateTime {
  const zone = timezone || process.env.LOCALE_TIMEZONE;
  return DateTime.fromISO(date, {zone});
}

export function secondsToMinutes(numberOfSeconds: number): number {
  const SECONDS_IN_MINUTE = 60;
  return Math.ceil(numberOfSeconds / SECONDS_IN_MINUTE);
}

export function secondsToHours(numberOfSeconds: number): number {
  const SECONDS_IN_HOUR = 3600;
  return Math.ceil(numberOfSeconds / SECONDS_IN_HOUR);
}

export function calculateServiceTimeInMillis(
  start: number,
  end: number
): number {
  return end - start;
}

export function initTimer(): TraceTimer {
  const startDate = Date.now();
  return {
    getElapsedTime: (): number => Date.now() - startDate
  };
}

export function addHours(hours: number): string {
  const date = DateTime.utc();
  return date.plus({hours}).toISO();
}

export function getPreviousMonths(months: number): string {
  const date = DateTime.utc();
  return date.minus({months}).toISO();
}

export function dateTimeFormat(dateTime: Date, format: string): string {
  return DateTime.fromJSDate(dateTime).toFormat(format);
}

export function getDiferentialFromNow(dateTime: Date): number {
  return Math.floor(Date.now() / 1000) - dateToEpoch(dateTime);
}

export function diffToNow(date: Date): any {
  const dateTime = DateTime.fromISO(date.toISOString());
  const diff = dateTime.diffNow([
    'years',
    'months',
    'days',
    'hours',
    'seconds'
  ]);
  return diff.values;
}

export function diffToNowInDays(date: Date): number {
  const dateTime = DateTime.fromISO(date.toISOString());
  return dateTime.diffNow(['days']).values?.days;
}

export function diffToNowInDaysForCsv(date: Date): number {
  const dateTime = DateTime.fromISO(date.toISOString());
  return Math.ceil(dateTime.diffNow(['days']).values?.days) || 0;
}

export function diffToNowInMinutes(date: Date): number {
  const dateTime = DateTime.fromISO(date.toISOString());
  return dateTime.diffNow(['minutes']).values?.minutes;
}

export function diffToNowInSeconds(date: Date): number {
  const dateTime = DateTime.fromISO(date.toISOString());
  return dateTime.diffNow(['seconds']).values?.seconds;
}

// todo: check incoming param type
export function diffToNowForHumans(date: Date): string {
  const dateTime: DateTime = DateTime.fromISO(date.toISOString());
  const diffValue: Duration = dateTime.diffNow();

  const years = Math.abs(diffValue.as('year'));
  if (years >= 1) {
    return years > 1
      ? `${Math.floor(years)} years`
      : `${Math.floor(years)} year`;
  }
  const months = Math.abs(diffValue.as('months'));
  if (months >= 1) {
    return months > 1
      ? `${Math.floor(months)} months`
      : `${Math.floor(months)} month`;
  }

  const days = Math.abs(diffValue.as('days'));
  if (days > 1) {
    return `${Math.floor(days)} days`;
  } else {
    return `1 day`;
  }
}

export async function getUniversalTime(): Promise<number | null> {
  try {
    const MILLISECONDS_IN_SECOND = 1000;
    return Math.floor(
      new Date(await getNetworkTime()).getTime() / MILLISECONDS_IN_SECOND
    );
  } catch (err) {
    console.error(`getNetworktime error: ${err}`);
    return null;
  }
}

export const isSameDate = (validDate: string, currentDate?:string): boolean => {
  let validateDate = DateTime.fromISO(validDate, {zone:'utc'})
  let someDate = null
  if (currentDate){
    someDate = DateTime.fromISO(currentDate);
  }else{
    someDate = DateTime.now();
  }
  return validateDate.hasSame(someDate,"day")
};

export const isPastDate = (validDate: Date, currentDate?:string): boolean => {
  let validateDate = DateTime.fromJSDate(validDate, {zone:'utc'})
  let someDate = null
  if (currentDate){
    someDate = DateTime.fromISO(currentDate);
  }else{
    someDate = DateTime.now();
  }
  return validateDate.startOf("day") <= someDate.startOf("day")
};

export const isFutureDate = (validDate: Date, currentDate?:string): boolean => {
  let validateDate = DateTime.fromJSDate(validDate, {zone:'utc'})
  let someDate = null
  if (currentDate){
    someDate = DateTime.fromISO(currentDate);
  }else{
    someDate = DateTime.utc();
  }
  return validateDate.startOf("day") >= someDate.startOf("day")
};

export const ISOtoCron = (ISOdate: string): string => 
{
    const date = DateTime.fromISO(ISOdate).toUTC();
    /*
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const days = date.getDate();
    const months = date.getMonth() + 1;
    const dayOfWeek = date.getDay();
    */
    const minutes = date.minute;
    const hours = date.hour;
    const days = date.day;
    const months = date.month;
    const dayOfWeek = date.weekday;

    return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;
};
