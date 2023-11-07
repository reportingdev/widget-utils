import { enUS, enGB, es, fr, de, it, nl, ru, zhCN, ja, ko, ar, hi, pt, sv } from 'date-fns/locale';
import { Locale, format, startOfWeek, subDays, startOfQuarter, startOfYear, startOfMonth, subMonths, subYears, endOfMonth, endOfQuarter, subQuarters, endOfYear } from 'date-fns'
import cc from 'currency-codes-ts';

const SUPPORTED_LOCALES = ['en-US', 'en-GB', 'es', 'fr', 'de', 'it', 'nl', 'ru', 'zh-CN', 'ja', 'ko', 'ar', 'hi', 'pt', 'sv'];
const SUPPORTED_CURRENCIES = cc.codes();
const SUPPORTED_DATE_FORMATS = ['default', 'shortMonthDay', 'shortMonthDayYear', 'longMonthDay', 'longMonthDayYear', 'us', 'european', 'asian'];
const SUPPORTED_VALUE_FORMATS = ['none', 'localized', 'abbreviated', 'currency']

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
export type DateFormat = typeof SUPPORTED_DATE_FORMATS[number];
export type ValueFormat = typeof SUPPORTED_VALUE_FORMATS[number];
export type ValueFormatter = (value: number) => string;

/**
 * @deprecated Use `formatDate` instead.
 */
export const shorthandDates = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const shortDate = `${month} ${day}`;
  return shortDate;
};


/**
 * Formats a given numerical amount into its currency representation based on specified parameters.
 * This function supports abbreviations like 'k', 'M', 'B', and 'T' for large numbers.
 *
 * @export
 * @param {number} amount - The numerical amount to be formatted.
 * @param {SupportedCurrency} [currency="USD"] - The currency in which the amount will be displayed.
 * @param {SupportedLocale} [locale='en-US'] - The locale to use for currency formatting.
 * @param {boolean} [shouldAbbreviate=false] - Determines if large numbers should be abbreviated.
 * @returns {string} - The formatted currency string.
 *
 * @example
 * formatCurrency(1200, "USD", "en-US", false);  // "$1,200"
 * formatCurrency(1200, "USD", "en-US", true);   // "$1.2k"
 * formatCurrency(1200000, "EUR", "de", true); // "1,2M €"
 */
export function formatCurrency(amount: number, currency: SupportedCurrency = "USD", locale: SupportedLocale = 'en-US', shouldAbbreviate: boolean = false): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  });

  const removeTrailingZeros = (formattedCurrency: string) => {
    return formattedCurrency.replace(/(\.00|,00)(?=\s*[^0-9]|$)/g, '');
  }

  if (!shouldAbbreviate) {
    return removeTrailingZeros(formatter.format(amount));
  }

  const currencyParts = formatter.formatToParts(1);
  const currencySymbol = currencyParts.find(part => part.type === 'currency')?.value || '';
  const isSymbolFirst = currencyParts[0]?.type === 'currency';

  let formattedAmount: string;

  let divisor = 1;
  let suffix = '';

  if (amount >= 1_000_000_000_000) {
    divisor = 1_000_000_000_000;
    suffix = 'T';
  } else if (amount >= 1_000_000_000) {
    divisor = 1_000_000_000;
    suffix = 'B';
  } else if (amount >= 1_000_000) {
    divisor = 1_000_000;
    suffix = 'M';
  } else if (amount >= 1_000) {
    divisor = 1_000;
    suffix = 'k';
  }

  // Check if number is evenly divisible by the various thresholds
  if (amount % divisor === 0 || amount % (divisor / 10) === 0 || amount % (divisor / 100) === 0) {
    formattedAmount = (amount / divisor).toLocaleString(locale);
  } else {
    return removeTrailingZeros(formatter.format(amount));
  }

  return isSymbolFirst ?
    `${currencySymbol}${formattedAmount}${suffix}` :
    `${formattedAmount}${suffix} ${currencySymbol}`;
}

/**
 * Formats a given number based on the locale and optionally abbreviates it.
 * Supports abbreviations like 'K', 'M', 'B', and 'T' for large numbers.
 *
 * @export
 * @param {number} num - The numerical value to be formatted.
 * @param {SupportedLocale} [locale='en-US'] - The locale to use for number formatting.
 * @param {boolean} [shouldAbbreviate=false] - Determines if large numbers should be abbreviated.
 * @returns {string} - The formatted number string.
 *
 * @example
 * formatNumberByLocale(1200, 'en-US', false);  // "1,200"
 * formatNumberByLocale(1200, 'en-US', true);   // "1.2K"
 * formatNumberByLocale(1200000, 'de-DE', true); // "1,2M"
 */
export function formatNumberByLocale(
  num: number,
  locale: SupportedLocale = 'en-US',
  shouldAbbreviate: boolean = false
): string {
  if (num < 1000 || !shouldAbbreviate) {
    return num.toLocaleString(locale);
  }

  let abbr: string;
  let divisor: number;

  if (num >= 1_000_000_000_000) {
    abbr = 'T';
    divisor = 1_000_000_000_000;
  } else if (num >= 1000000000) {
    abbr = 'B';
    divisor = 1000000000;
  } else if (num >= 1000000) {
    abbr = 'M';
    divisor = 1000000;
  } else {
    abbr = 'K';
    divisor = 1000;
  }

  // Check if number is evenly divisible by the various thresholds
  if (num % divisor === 0 || num % (divisor / 10) === 0 || num % (divisor / 100) === 0) {
    const value = num / divisor;
    return `${value.toLocaleString(locale)}${abbr}`;
  }

  // If not, then don't abbreviate
  return num.toLocaleString(locale);
}

type dayOfWeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/**
 * Retrieves the index of the first day of the week based on a given locale.
 * The index starts from 0, where 0 represents Sunday, 1 represents Monday, etc.
 *
 * @export
 * @param {SupportedLocale} locale - The locale identifier.
 * @returns {dayOfWeekIndex} - The index of the first day of the week based on the locale.
 *
 * @example
 * getFirstDayOfWeek('en-US'); // Returns 0 (Sunday)
 * getFirstDayOfWeek('fr');    // Returns 1 (Monday)
 */
export function getFirstDayOfWeek(locale: SupportedLocale): dayOfWeekIndex {
  const now = new Date();
  const start = startOfWeek(now, { locale: getDateFNSLocale(locale) });
  return start.getDay() as dayOfWeekIndex;  // Returns 0 for Sunday, 1 for Monday, etc.
}


/**
 * Retrieves the appropriate Locale object for date-fns based on the given locale string.
 *
 * @export
 * @param {SupportedLocale} locale - The locale identifier to be converted to a Locale object.
 * @returns {Locale} - The Locale object corresponding to the given locale.
 *
 * @example
 * getDateFNSLocale('en-US'); // Returns enUS Locale object
 * getDateFNSLocale('fr');    // Returns fr Locale object
 * getDateFNSLocale('xx');    // Returns enUS Locale object (fallback)
 */
export function getDateFNSLocale(locale: SupportedLocale): Locale {
  const localeMap: Record<SupportedLocale, Locale> = {
    'en-US': enUS,
    'en-GB': enGB,
    'es': es,
    'fr': fr,
    'de': de,
    'it': it,
    'nl': nl,
    'ru': ru,
    'zh-CN': zhCN,
    'ja': ja,
    'ko': ko,
    'ar': ar,
    'hi': hi,
    'pt': pt,
    'sv': sv,
  };

  return localeMap[locale] ?? enUS;
}

/**
 * Formats a given date based on the specified date format and locale.
 * Supports multiple date formats like 'default', 'us', 'european', 'asian', etc.
 *
 * @export
 * @param {Date | string} date - The date to be formatted, can be a Date object or a string representation of a date.
 * @param {DateFormat} [dateFormat='default'] - The format in which the date will be displayed.
 * @param {SupportedLocale} [locale='en-US'] - The locale to use for date formatting.
 * @returns {string} - The formatted date string.
 *
 * @example
 * formatDate(new Date(), 'default', 'en-US');  // "October 1, 2023"
 * formatDate('2023-10-01', 'us', 'en-US');     // "10/01/2023"
 * formatDate(new Date(), 'european', 'de-DE'); // "01/10/2023"
 * formatDate(new Date(), 'asian', 'zh-CN');    // "2023/10/01"
 */
export function formatDate(date: Date | string, dateFormat: DateFormat = 'default', locale: SupportedLocale = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const dateFNSLocale = getDateFNSLocale(locale);

  switch (dateFormat) {
    case 'default':
      return format(dateObj, 'PP', { locale: dateFNSLocale });
    case 'us':
      return format(dateObj, 'MM/dd/yyyy');
    case 'european':
      return format(dateObj, 'dd/MM/yyyy');
    case 'asian':
      return format(dateObj, 'yyyy/MM/dd');
    case 'shortMonthDay':
    case 'shortMonthDayYear':
    case 'longMonthDay':
    case 'longMonthDayYear':
      let options: Intl.DateTimeFormatOptions = {};
      if (dateFormat.includes('shortMonth')) options.month = 'short';
      if (dateFormat.includes('longMonth')) options.month = 'long';
      if (dateFormat.includes('Day')) options.day = 'numeric';
      if (dateFormat.includes('Year')) options.year = 'numeric';
      return dateObj.toLocaleDateString(locale, options);
    default:
      return format(dateObj, 'PP', { locale: dateFNSLocale });
  }
}

export const localizationArgTypes = {
  locale: {
    options: SUPPORTED_LOCALES,
    control: { type: "select" },
    description: 'The locale to be used within the widget. Changes how dates and currencies are rendered.',
    table: {
      category: "Localization"
    }
  },
  currency: {
    options: SUPPORTED_CURRENCIES,
    control: { type: "select" },
    description: 'The currency format to be used when data is a currency.',
    table: {
      category: "Localization"
    }
  },
  valueFormat: {
    options: SUPPORTED_VALUE_FORMATS,
    control: { type: 'select' },
    description: "Controls how values are formatted within the widget. Default is based on provided locale.",
    table: {
      category: "Localization",
    },
  },
  dateFormat: {
    options: SUPPORTED_DATE_FORMATS,
    control: { type: 'select' },
    description: 'How to format dates within the widget. Default is based on provided locale.',
    table: {
      category: "Localization"
    }
  },
};

export const DATE_RANGE_OPTIONS = [
  'last7Days',
  'last30Days',
  'lastWeek',
  'lastMonth',
  'lastQuarter',
  'lastYear',
  'mtd',
  'ytd'
];
export type DateRangeOptions = typeof DATE_RANGE_OPTIONS[number];

interface DateRange {
  from: Date;
  to: Date;
}


/**
 * Gets the current date, with the option to adjust to the start of the day in the local timezone.
 * By default, the function returns 'today' in UTC. If `localTimezone` is true, it adjusts
 * the date to the start of the day in the user's local timezone.
 *
 * @param {boolean} localTimezone - If true, returns the date adjusted to the local timezone.
 * @returns {Date} The date object representing today's date, adjusted based on the `localTimezone` parameter.
 */
export const getToday = (localTimezone?:boolean):Date => {
    // Assuming 'today' is in UTC for consistency across different time zones.
    let today = new Date(new Date().toUTCString());

    // If enableLocalDates is true, adjust 'today' to the start of the day in the user's local time zone.
    if (localTimezone) {
      // Subtract the time zone offset of the local time (user's time zone).
      const timezoneOffset = today.getTimezoneOffset() * 60000;
      today = new Date(today.getTime() + timezoneOffset);
      today.setHours(0, 0, 0, 0); // Set time to the start of the day.
    }
    return today;
}


/**
 * Gets a date range based on a specified option.
 * Supports various predefined date ranges like 'last7Days', 'last30Days', 'lastWeek', etc.
 *
 * @export
 * @param {DateRangeOptions} option - The predefined option to calculate the date range.
 * @param {boolean} enableToday - Determines if 'today' should be included in the 'to' date.
 * @returns {DateRange} - An object containing the 'from' and 'to' dates for the selected range.
 *
 * @example
 * getDateRange('last7Days', true);  // { from: "2023-09-25T00:00:00.000Z", to: "2023-10-01T00:00:00.000Z" }
 * getDateRange('lastWeek', false);  // { from: "2023-09-18T00:00:00.000Z", to: "2023-09-24T00:00:00.000Z" }
 * getDateRange('lastYear', false);  // { from: "2022-01-01T00:00:00.000Z", to: "2022-12-31T00:00:00.000Z" }
 */
export const getDateRange = (option: DateRangeOptions, enableToday: boolean, localTimezone?:boolean): DateRange => {
  const today = getToday(localTimezone)
  let to = enableToday ? today : subDays(today, 1);
  let from: Date | undefined;

  switch (option) {
    case 'last7Days':
      from = subDays(to, 6);
      break;
    case 'last30Days':
      from = subDays(to, 29);
      break;
    case 'lastWeek':
      from = startOfWeek(subDays(today, 7));
      to = subDays(startOfWeek(today), 1);
      break;
    case 'lastMonth':
      from = startOfMonth(subMonths(today, 1));
      to = endOfMonth(subMonths(today, 1));
      break;
    case 'lastQuarter':
      from = startOfQuarter(subQuarters(today, 1));
      to = endOfQuarter(subQuarters(today, 1));
      break;
    case 'lastYear':
      from = startOfYear(subYears(today, 1));
      to = endOfYear(subYears(today, 1));
      break;
    case 'mtd':
      from = startOfMonth(today);
      break;
    case 'ytd':
      from = startOfYear(today);
      break;
  }

  if (from === undefined) {
    from = subDays(to, 6);
  }

  return { from, to };
};

type DateRangeTexts = Record<DateRangeOptions, string>;

const dateRangeSelectText: Record<SupportedLocale, DateRangeTexts> = {
  'en-US': {
    'last7Days': 'Last 7 Days',
    'last30Days': 'Last 30 Days',
    'lastWeek': 'Last Week',
    'lastMonth': 'Last Month',
    'lastQuarter': 'Last Quarter',
    'lastYear': 'Last Year',
    'mtd': 'Month to Date',
    'ytd': 'Year to Date'
  },
  'en-GB': {
    'last7Days': 'Last 7 Days',
    'last30Days': 'Last 30 Days',
    'lastWeek': 'Last Week',
    'lastMonth': 'Last Month',
    'lastQuarter': 'Last Quarter',
    'lastYear': 'Last Year',
    'mtd': 'Month to Date',
    'ytd': 'Year to Date'
  },
  'es': {
    'last7Days': 'Últimos 7 días',
    'last30Days': 'Últimos 30 días',
    'lastWeek': 'Última semana',
    'lastMonth': 'Último mes',
    'lastQuarter': 'Último trimestre',
    'lastYear': 'Último año',
    'mtd': 'Mes hasta la fecha',
    'ytd': 'Año hasta la fecha'
  },
  'fr': {
    'last7Days': '7 derniers jours',
    'last30Days': '30 derniers jours',
    'lastWeek': 'La semaine dernière',
    'lastMonth': 'Le mois dernier',
    'lastQuarter': 'Le dernier trimestre',
    'lastYear': "L'année dernière",
    'mtd': 'Mois en cours',
    'ytd': 'Depuis le début de l’année'
  },
  'de': {
    'last7Days': 'Letzte 7 Tage',
    'last30Days': 'Letzte 30 Tage',
    'lastWeek': 'Letzte Woche',
    'lastMonth': 'Letzter Monat',
    'lastQuarter': 'Letztes Quartal',
    'lastYear': 'Letztes Jahr',
    'mtd': 'Monat bis heute',
    'ytd': 'Jahr bis heute'
  },
  'it': {
    'last7Days': 'Ultimi 7 giorni',
    'last30Days': 'Ultimi 30 giorni',
    'lastWeek': 'Ultima settimana',
    'lastMonth': 'Ultimo mese',
    'lastQuarter': 'Ultimo trimestre',
    'lastYear': 'Ultimo anno',
    'mtd': 'Mese fino ad oggi',
    'ytd': 'Anno fino ad oggi'
  },
  'nl': {
    'last7Days': 'Laatste 7 dagen',
    'last30Days': 'Laatste 30 dagen',
    'lastWeek': 'Afgelopen week',
    'lastMonth': 'Afgelopen maand',
    'lastQuarter': 'Afgelopen kwartaal',
    'lastYear': 'Afgelopen jaar',
    'mtd': 'Maand tot nu toe',
    'ytd': 'Jaar tot nu toe'
  },
  'ru': {
    'last7Days': 'Последние 7 дней',
    'last30Days': 'Последние 30 дней',
    'lastWeek': 'Последняя неделя',
    'lastMonth': 'Последний месяц',
    'lastQuarter': 'Последний квартал',
    'lastYear': 'Последний год',
    'mtd': 'Месяц до сегодняшнего дня',
    'ytd': 'Год до сегодняшнего дня'
  },
  'zh-CN': {
    'last7Days': '最近7天',
    'last30Days': '最近30天',
    'lastWeek': '上周',
    'lastMonth': '上个月',
    'lastQuarter': '上个季度',
    'lastYear': '去年',
    'mtd': '本月迄今为止',
    'ytd': '本年迄今为止'
  },
  'ja': {
    'last7Days': '過去7日間',
    'last30Days': '過去30日間',
    'lastWeek': '先週',
    'lastMonth': '先月',
    'lastQuarter': '先四半期',
    'lastYear': '昨年',
    'mtd': '今月の日数',
    'ytd': '今年の日数'
  },
  'ko': {
    'last7Days': '지난 7일',
    'last30Days': '지난 30일',
    'lastWeek': '지난 주',
    'lastMonth': '지난 달',
    'lastQuarter': '지난 분기',
    'lastYear': '지난 해',
    'mtd': '이 달까지',
    'ytd': '올 해까지'
  },
  'ar': {
    'last7Days': 'آخر 7 أيام',
    'last30Days': 'آخر 30 يومًا',
    'lastWeek': 'الأسبوع الماضي',
    'lastMonth': 'الشهر الماضي',
    'lastQuarter': 'الربع الأخير',
    'lastYear': 'العام الماضي',
    'mtd': 'الشهر حتى الآن',
    'ytd': 'السنة حتى الآن'
  },
  'hi': {
    'last7Days': 'पिछले 7 दिन',
    'last30Days': 'पिछले 30 दिन',
    'lastWeek': 'पिछला सप्ताह',
    'lastMonth': 'पिछला महीना',
    'lastQuarter': 'पिछली तिमाही',
    'lastYear': 'पिछला वर्ष',
    'mtd': 'महीने की तारीख तक',
    'ytd': 'वर्ष की तारीख तक'
  },
  'pt': {
    'last7Days': 'Últimos 7 dias',
    'last30Days': 'Últimos 30 dias',
    'lastWeek': 'Última semana',
    'lastMonth': 'Último mês',
    'lastQuarter': 'Último trimestre',
    'lastYear': 'Último ano',
    'mtd': 'Mês até à data',
    'ytd': 'Ano até à data'
  },
  'sv': {
    'last7Days': 'Senaste 7 dagarna',
    'last30Days': 'Senaste 30 dagarna',
    'lastWeek': 'Senaste veckan',
    'lastMonth': 'Senaste månaden',
    'lastQuarter': 'Senaste kvartalet',
    'lastYear': 'Senaste året',
    'mtd': 'Månad till datum',
    'ytd': 'År till datum'
  }
};

export const getLocalizedDateRangeSelectorText = (option: DateRangeOptions, locale: SupportedLocale = 'en-US') => {
  return dateRangeSelectText?.[locale]?.[option] ?? dateRangeSelectText['en-US']?.[option] ?? 'unknown';
}

/**
 * Checks if an array of dates spans across multiple years.
 *
 * @export
 * @param {string[]|Date[]} dates - An array of date objects or date strings to check.
 * @returns {boolean} - Returns `true` if the dates span multiple years, otherwise `false`.
 *
 * @example
 * hasMultipleYears(['2023-01-01', '2024-01-01']);  // true
 * hasMultipleYears([new Date('2023-01-01'), new Date('2023-12-31')]);  // false
 */
export const hasMultipleYears = (dates: string[] | Date[]): boolean => {
  // Extract years from the dates
  const years = dates.map((date) => new Date(date).getUTCFullYear());

  // Find the unique years using a Set
  const uniqueYears = new Set(years);

  // Check if there are multiple unique years
  return uniqueYears.size > 1;
};


/**
 * Creates and returns a value formatter function based on the given formatting options.
 *
 * @param {ValueFormat} valueFormat - The type of value formatting to apply. Can be one of 'localized', 'abbreviated', or 'currency'.
 * @param {SupportedLocale} locale - The locale to use for formatting the value.
 * @param {SupportedCurrency} currency - The currency to use when the value format is 'currency'.
 * @returns {ValueFormatter} A value formatter function that takes a number and returns it as a formatted string according to the specified options.
 *
 * @example
 * const formatter = createValueFormatter('currency', 'en-US', 'USD');
 * const formattedValue = formatter(1000);  // Output: "$1,000"
 */
export const createValueFormatter = (valueFormat: ValueFormat, locale: SupportedLocale, currency: SupportedCurrency): ValueFormatter => {
  return (value: number) => {
    if (valueFormat === 'localized') {
      return formatNumberByLocale(value, locale, false);
    }
    if (valueFormat === 'abbreviated') {
      return formatNumberByLocale(value, locale, true);
    }
    if (valueFormat === 'currency') {
      return formatCurrency(value, currency, locale, true);
    }
    return value + '';
  };
}