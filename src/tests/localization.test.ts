import * as sinon from 'sinon';
import { formatCurrency, getToday } from '../utils/localization';

describe('getToday', () => {
  let clock: sinon.SinonFakeTimers;
  let OriginalDate: DateConstructor;

  function setDateObject(){
    global.Date = class extends OriginalDate {
      constructor() {
        super();
        return new OriginalDate(clock.now);
      }
  
      static now() {
        return clock.now; // this will ensure Date.now() is using the mocked time
      }
  
      // static UTC(year: number, month: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number) {
      //   // Adjust the arguments to account for any defaults.
      //   const args = [year, month, date ?? 1, hours ?? 0, minutes ?? 0, seconds ?? 0, ms ?? 0];
      //   // Use the apply function to call the original Date.UTC with the adjusted arguments
      //   return OriginalDate.UTC.apply(null, args);
      // }
    } as unknown as DateConstructor;
  }

  beforeEach(() => {
    OriginalDate = global.Date;
    //clock = sinon.useFakeTimers(new Date('2023-11-07T23:30:00-06:00').getTime());
  });
  
  afterEach(() => {
    clock.restore();
    global.Date = OriginalDate;
  });

  it('should return the UTC date', () => {
    clock = sinon.useFakeTimers(new Date('2023-11-07T11:30:00Z').getTime());
    setDateObject();
    const todayUTC = getToday(false);
    expect(todayUTC.getDate()).toBe(7)
  });

  it('should return local date', () => {
    clock = sinon.useFakeTimers(new Date('2023-11-07T11:30:00Z').getTime());
    setDateObject();
    const todayLocal = getToday(true);
    expect(todayLocal.getDate()).toBe(7);
  });

  it('should handle Daylight Saving Time transition correctly', () => {
    // Example for PST transition:
    // Mock the current time to a specific point
    const mockedCurrentTime = new OriginalDate('2023-03-12T10:00:00Z').getTime();
    clock = sinon.useFakeTimers(mockedCurrentTime);
    setDateObject();
    const dstTransitionDay = getToday(true);
    expect(dstTransitionDay.getDate()).toBe(12); // Assuming the transition is on 12th March
  });

  it('should handle the time around midnight correctly', () => {
    // Set the fake time to 11:59 PM UTC
    const mockedCurrentTime = new OriginalDate('2023-11-07T23:59:00Z').getTime()
    clock = sinon.useFakeTimers(mockedCurrentTime);
    setDateObject();

    // Override the global Date object
    const justBeforeMidnightUTC = getToday(false);
    expect(justBeforeMidnightUTC.getDate()).toBe(new Date(clock.now).getUTCDate());
    
    // Move 2 seconds ahead to cross midnight
    clock.tick(2000);
    const justAfterMidnightUTC = getToday(false);
    expect(justAfterMidnightUTC.getDate()).toBe(new Date(clock.now).getUTCDate());
  });

  it('should handle when UTC time is tomorrow but local time is today', () => {
    // Mock the current time to a specific point
    const mockedCurrentTime = new OriginalDate('2023-11-07T23:30:00-06:00').getTime();
    clock = sinon.useFakeTimers(mockedCurrentTime);
    setDateObject();
  
    const todayUTC = getToday(false);
    expect(todayUTC.getUTCDate()).toBe(8); // Expecting the date to be 8th UTC
  
    const todayLocal = getToday(true);
    expect(todayLocal.getDate()).toBe(7); // Expecting the local date to be 7th
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

