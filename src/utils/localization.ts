import { enUS, enGB, es, fr, de, it, nl, ru, zhCN, ja, ko, ar, hi, pt, sv } from 'date-fns/locale';
import { Locale, format, startOfWeek,subDays,startOfQuarter,startOfYear,startOfMonth,subMonths,subYears,endOfMonth,endOfQuarter,subQuarters,endOfYear } from 'date-fns'

const SUPPORTED_LOCALES = ['en-US', 'en-GB', 'es', 'fr', 'de', 'it', 'nl', 'ru', 'zh-CN', 'ja', 'ko', 'ar', 'hi', 'pt', 'sv'];
const SUPPORTED_CURRENCIES = ['USD', 'GPB', 'EUR', 'CNY', 'JPY', 'KRW', 'INR', 'SEK'];
const SUPPORTED_DATE_FORMATS = ['default', 'shortMonthDay', 'shortMonthDayYear', 'longMonthDay', 'longMonthDayYear', 'us', 'european', 'asian'];

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

type dayOfWeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export function getFirstDayOfWeek(locale: SupportedLocales): dayOfWeekIndex {
  const now = new Date();
  const start = startOfWeek(now, { locale: getDateFNSLocale(locale) });
  return start.getDay() as dayOfWeekIndex;  // Returns 0 for Sunday, 1 for Monday, etc.
}

export function getDateFNSLocale(locale: SupportedLocales): Locale {
  const localeMap: Record<SupportedLocales, Locale> = {
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
    control: { type: "select" },
    description: 'The currency format to be used when data is a currency.',
    table: {
      category: "Localization"
    }
  },
  dateFormat: {
    options: SUPPORTED_DATE_FORMATS,
    control: { type: 'select' },
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
export const getDateRange = (option: DateRangeOptions, enableToday: boolean): DateRange => {
  const today = new Date();
  let to = enableToday ? new Date(today) : subDays(today, 1);
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

const dateRangeSelectText:Record<SupportedLocales, DateRangeTexts> = {
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

export const getLocalizedDateRangeSelectorText = (option:DateRangeOptions, locale:SupportedLocales='en-US') => {
  return dateRangeSelectText?.[locale]?.[option] ?? dateRangeSelectText['en-US']?.[option] ?? 'unknown';
}
