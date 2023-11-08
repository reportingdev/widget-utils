import * as sinon from 'sinon';
import { formatCurrency, serializeDate } from '../utils/localization';


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

