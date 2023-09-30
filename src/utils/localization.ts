import { enUS, enGB, es, fr, de, it, nl, ru, zhCN, ja, ko, ar, hi, pt, sv } from 'date-fns/locale';
import { Locale, format } from 'date-fns'

const SUPPORTED_LOCALES = ['en-US', 'en-GB', 'es', 'fr', 'de', 'it', 'nl', 'ru', 'zh-CN', 'ja', 'ko', 'ar', 'hi','pt', 'sv'];
const SUPPORTED_CURRENCIES = ['USD', 'GPB' , 'EUR' , 'CNY' , 'JPY' , 'KRW' , 'INR' , 'SEK'];
const SUPPORTED_DATE_FORMATS = ['default' , 'shortMonthDay' , 'shortMonthDayYear' , 'longMonthDay' , 'longMonthDayYear' , 'us' , 'european' , 'asian'];

export type SupportedLocales = typeof SUPPORTED_LOCALES[number];
export type SupportedCurrencies = typeof SUPPORTED_CURRENCIES[number];
export type DateFormat = typeof SUPPORTED_DATE_FORMATS[number];

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

export function formatCurrency(amount: number, currency: SupportedCurrencies = "USD", locale: SupportedLocales = 'en-US'): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  });

  return formatter.format(amount);
}

export function getDateFNSLocale(locale: SupportedLocales):Locale {
  const localeMap:Record<SupportedLocales, Locale> = {
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

export function formatDate(date: Date | string, dateFormat: DateFormat = 'default', locale: SupportedLocales = 'en-US'): string {
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

export const localizationOptions = {
  currency: {
    options: SUPPORTED_CURRENCIES,
    control: {type: "select"},
    description: 'The currency format to be used when data is a currency.',
    table: {
      category: "Localization"
    }
  },
  dateFormat: {
    options: SUPPORTED_DATE_FORMATS,
    control: {type: 'select'},
    description: 'How to format dates within the widget. Default is based on provided locale.',
    table: {
      category: "Localization"
    }
  },
  locale: {
    options: SUPPORTED_LOCALES,
    control: { type: "select" },
    description: 'The locale to be used within the widget. Changes how dates and currencies are rendered.',
    table: {
      category: "Localization"
    }
  }
}