import * as sinon from 'sinon';
import { formatCurrency, serializeDate, getDateRange, hasMultipleYears } from '../utils/localization';
import {
  subDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subMonths,
  subQuarters,
  subYears
} from 'date-fns';


describe('serializeDate', () => {
  let clock: sinon.SinonFakeTimers;

  beforeAll(() => {
    const fixedDate = new Date('2023-11-07T12:00:00Z');
    clock = sinon.useFakeTimers(fixedDate.getTime());
  });

  afterAll(() => {
    clock.restore();
  });

  test('should serialize a date to ISO 8601 with timezone format correctly', () => {
    const date = new Date();
    const serialized = serializeDate(date, 'iso8601');
    expect(serialized).toBe(date.toISOString());
  });

  test('should serialize a date to local ISO Date without time correctly', () => {
    const date = new Date();
    const serialized = serializeDate(date, 'isoDateLocal');
    expect(serialized).toBe(date.toISOString().split('T')[0]);
  });

  test('should serialize a date to UTC ISO Date without time correctly', () => {
    const date = new Date();
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const serialized = serializeDate(date, 'isoDateUTC');
    expect(serialized).toBe(utcDate.toISOString().split('T')[0]);
  });

  test('should serialize a date to Unix timestamp string correctly', () => {
    const date = new Date();
    const serialized = serializeDate(date, 'unixTimestamp');
    expect(serialized).toBe(date.getTime().toString());
  });

  test('should serialize a date to RFC 2822 string correctly', () => {
    const date = new Date();
    const serialized = serializeDate(date, 'rfc2822');
    expect(serialized).toBe(date.toUTCString());
  });

  test('should throw an error for unsupported formats', () => {
    const date = new Date();
    expect(() => serializeDate(date, 'unsupportedFormat' as any)).toThrow('Unsupported format specified');
  });
});


describe('getDateRange', () => {
  let clock: sinon.SinonFakeTimers;
  const mockToday = new Date('2023-10-10T00:00:00.000Z');

  beforeAll(() => {
    // Use Sinon to fake the system clock
    clock = sinon.useFakeTimers(mockToday.getTime());
  });

  afterAll(() => {
    // Restore the real system clock
    clock.restore();
  });


  it('should return the last 7 days range including today', () => {
    const result = getDateRange('last7Days', true);
    expect(result).toEqual({
      from: subDays(mockToday, 6),
      to: mockToday,
    });
  });

  it('should return the last 7 days range excluding today', () => {
    const result = getDateRange('last7Days', false);
    expect(result).toEqual({
      from: subDays(mockToday, 7),
      to: subDays(mockToday, 1),
    });
  });

  it('should return the last 30 days range including today', () => {
    const result = getDateRange('last30Days', true);
    expect(result).toEqual({
      from: subDays(mockToday, 29),
      to: mockToday,
    });
  });

  it('should return the last 30 days range excluding today', () => {
    const result = getDateRange('last30Days', false);
    expect(result).toEqual({
      from: subDays(mockToday, 30),
      to: subDays(mockToday, 1),
    });
  });

  it('should return the last week range', () => {
    const startLastWeek = startOfWeek(subDays(mockToday, 7));
    const endLastWeek = subDays(startOfWeek(mockToday), 1);
    const result = getDateRange('lastWeek', false);
    expect(result).toEqual({
      from: startLastWeek,
      to: endLastWeek,
    });
  });

  it('should return the last month range', () => {
    const result = getDateRange('lastMonth', false);
    expect(result).toEqual({
      from: startOfMonth(subMonths(mockToday, 1)),
      to: endOfMonth(subMonths(mockToday, 1)),
    });
  });

  it('should return the last quarter range', () => {
    const result = getDateRange('lastQuarter', false);
    expect(result).toEqual({
      from: startOfQuarter(subQuarters(mockToday, 1)),
      to: endOfQuarter(subQuarters(mockToday, 1)),
    });
  });

  it('should return the last year range', () => {
    const result = getDateRange('lastYear', false);
    expect(result).toEqual({
      from: startOfYear(subYears(mockToday, 1)),
      to: endOfYear(subYears(mockToday, 1)),
    });
  });

  it('should return the MTD range including today', () => {
    const result = getDateRange('mtd', true);
    expect(result).toEqual({
      from: startOfMonth(mockToday),
      to: mockToday,
    });
  });

  it('should return the YTD range including today', () => {
    const result = getDateRange('ytd', true);
    expect(result).toEqual({
      from: startOfYear(mockToday),
      to: mockToday,
    });
  });

  // Add more tests as per your requirements and edge cases
});

describe('hasMultipleYears', () => {
  it('should return false for an array with dates from the same year', () => {
    const dates = [
      '2023-01-01',
      new Date('2023-05-15'),
      '2023-12-31T23:59:59.999Z'
    ];
    expect(hasMultipleYears(dates)).toBe(false);
  });

  it('should return true for an array with dates from different years', () => {
    const dates = [
      '2022-12-31',
      new Date('2023-01-01'),
      '2024-01-01T00:00:00.000Z'
    ];
    expect(hasMultipleYears(dates)).toBe(true);
  });

  it('should return false for an array with a single date', () => {
    const dates = ['2023-06-01'];
    expect(hasMultipleYears(dates)).toBe(false);
  });

  it('should return false for an empty array', () => {
    const dates:string[] = [];
    expect(hasMultipleYears(dates)).toBe(false);
  });

  // Add more test cases if necessary, such as invalid date formats, etc.
});



describe('formatCurrency', () => {
  test('formats without abbreviation', () => {
    expect(formatCurrency(1200, "USD", "en-US", false)).toBe("$1,200");
    expect(formatCurrency(5300, "EUR", "de-DE", false)).toContain(("€"));
    expect(formatCurrency(5300, "EUR", "de-DE", false)).toContain('5.300');
    expect(formatCurrency(5300, "GBP", "en-GB", false)).toBe("£5,300");
    expect(formatCurrency(1234, "JPY", "ja-JP", false)).toBe("￥1,234");
  });

  test('formats with abbreviation', () => {
    expect(formatCurrency(1200, "USD", "en-US", true)).toBe("$1.2k");
    expect(formatCurrency(2500000, "EUR", "de-DE", true)).toBe("2,5M €");
    expect(formatCurrency(1200000000, "GBP", "en-GB", true)).toBe("£1.2B");
  });

  test('formats edge cases correctly', () => {
    // Edge cases where the amount is right at the boundary of abbreviation
    expect(formatCurrency(1000, "USD", "en-US", true)).toBe("$1k");
    expect(formatCurrency(1000000, "USD", "en-US", true)).toBe("$1M");
    expect(formatCurrency(1000000000, "USD", "en-US", true)).toBe("$1B");
    expect(formatCurrency(1000000000000, "USD", "en-US", true)).toBe("$1T");
  });

  test('handles zero and negative amounts', () => {
    expect(formatCurrency(0, "USD", "en-US", true)).toBe("$0");
    expect(formatCurrency(-1000, "USD", "en-US", true)).toBe("-$1k");
    expect(formatCurrency(-1234, "GBP", "en-GB", false)).toBe("-£1,234");
  });

  test('handles amounts without trailing zeros', () => {
    expect(formatCurrency(1000.00, "USD", "en-US", false)).toBe("$1,000");
    expect(formatCurrency(1000.00, "EUR", "de-DE", true)).toBe("1k €");
  });

  test('abbreviates correctly with non-even division', () => {
    expect(formatCurrency(1200.00, "USD", "en-US", true)).toBe("$1.2k");
    expect(formatCurrency(1234, "USD", "en-US", true)).toBe("$1.23k");
    expect(formatCurrency(1234000, "EUR", "de-DE", true)).toBe("1,23M €");
  });

  // Add more tests as needed for different scenarios
});

