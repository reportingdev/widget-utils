import { isFinite } from "lodash";
import { enUS, enGB,es,fr,de,it,nl,ru,zhCN,ja,ko,ar,hi,pt,sv } from 'date-fns/locale';
import {format} from 'date-fns'

const percentageFormatter = (value:number) => {
  
  // round the value
  let percentage = Math.round((value + Number.EPSILON) * 100) / 100;

  if(!isFinite(percentage)) {
    // check non-numeric outcomes
    if(isNaN(percentage)) {
      percentage = 0;
    }
    if(Math.abs(percentage) === Infinity) {
      if(percentage>0) {
        return `+∞%`;
      } else {
        return '-∞%';
      }
    }
  }

  if(percentage > 0) {
    return `+${percentage}%`;
  }

  // handles negative and zero cases
  return `${percentage}%`;
}
const addCommasToNumber = (x:number) => x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
const abbreviateNumber = (num:number, digits = 1) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" }, // thousands
    { value: 1e6, symbol: "M" }, // millions
    { value: 1e9, symbol: "B" }, // billions
    { value: 1e12, symbol: "T" },// trillions
    { value: 1e15, symbol: "Q" },// quadrillion
    { value: 1e18, symbol: "QQ" } // quintrillion
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function (item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}
const roundToTwo = (num:number) => Math.round((num + Number.EPSILON) * 100) / 100;

const shorthandDates = (dateString:string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const shortDate = `${month} ${day}`;
    return shortDate;
};

type SupportedLocales = 'en-US' | 'en-GB' | 'es' | 'fr' | 'de' | 'it' | 'nl' | 'ru' | 'zh-CN' | 'ja' | 'ko' | 'ar' | 'hi' | 'pt' | 'sv';
type SupportedCurrencies = 'USD' | 'GPB' | 'EUR' | 'CNY' | 'JPY' | 'KRW' | 'INR' | 'SEK';

function formatCurrency(amount: number, currency:SupportedCurrencies="USD", locale:SupportedLocales='en-US'): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  });

  return formatter.format(amount);
}

type ParsedCurrency = {
  amount: number;
  currencyCode: SupportedCurrencies;
};

function parseCurrencyString(currencyString: string):ParsedCurrency | null {
  // Using regex to capture amount and currency symbol
  const regex = /([^\d]*)([\d.,]+)/;
  const matches = currencyString.match(regex);
  
  if (!matches) return null;

  const [, currencySymbol, amountString] = matches;

  // Remove commas and convert string to number
  const amount = parseFloat(amountString.replace(/,/g, ''));

  // Mapping currency symbols to currency codes
  const symbolToCode: { [key: string]: string } = {
    '$': 'USD',
    '£': 'GBP',
    '€': 'EUR',
    '¥': 'JPY',
    'CY¥': 'JPY',
    '₩': 'KRW',
    '₽': 'RUB',
    '₹': 'INR',
    'R$': 'BRL',
    'SEK': 'SEK',
    // Add more mappings as needed
  };

  const currencyCode = symbolToCode[currencySymbol.trim()] || 'Unknown';

  return {
    amount,
    currencyCode,
  };
};

type DateFormat = 'localized' | 'us' | 'us-short' | 'european' | 'european-short' | 'asian';

function formatDate(date:Date | string, locale:SupportedLocales='en-US', dateFormat:DateFormat='localized'):string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeMap = {
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

  switch (dateFormat) {
    case 'localized':
      return format(dateObj, 'PP', { locale: localeMap[locale] ?? enUS });
    case 'us':
      return format(dateObj, 'MM/dd/yyyy');
    case 'european':
      return format(dateObj, 'dd/MM/yyyy');
    case 'us-short':
      return format(dateObj, 'MM/dd');
    case 'european-short':
      return format(dateObj, 'dd/MM');
    case 'asian':
      return format(dateObj, 'yyyy/MM/dd');
    default:
      return format(dateObj, 'PP', { locale: localeMap[locale] ?? enUS });
  }
}


export {
  percentageFormatter,
  addCommasToNumber,
  abbreviateNumber,
  roundToTwo,
  shorthandDates,
  formatCurrency,
  formatDate,
  parseCurrencyString
};