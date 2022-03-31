interface DateTimeFormatOptions {
  localeMatcher?: 'lookup' | 'best fit';
  weekday?: 'long' | 'short' | 'narrow';
  era?:  'long' | 'short' | 'narrow';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  timeZoneName?: 'long' | 'short';
  formatMatcher?: 'basic' | 'best fit';
  hour12?: boolean;
  timeZone?: string;
}

export const getDateFromUnixEpoch = (unixEpoch: number): Date => {
  return new Date(new Date(0).setUTCSeconds(unixEpoch));
};

export const getLocaleDateString = (date: Date, options?: DateTimeFormatOptions) => {
  // TODO: Support internationalization (different locales)
  return new Date(date).toLocaleDateString('en-US', options);
};
