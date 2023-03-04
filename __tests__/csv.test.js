const fs = require('fs')
const Csv = require('../src/csv');

const CsvObject = new Csv();

describe('checkHoliday()', () => {
    test('正常に祝日判定される', () => {
        expect(CsvObject.checkHoliday(2022, (3 - 1), 21)).toBe(true);
    });

    test('正常に祝日でない判定される', () => {
        expect(CsvObject.checkHoliday(2022, (3 - 1), 20)).toBe(false);
    });
});

describe('getHolidayName()', () => {
    test('春分の日', () => {
        expect(CsvObject.getHolidayName(2022, (3 - 1), 21)).toBe('春分の日');
    });

    test('祝日でない場合はnull', () => {
        expect(CsvObject.getHolidayName(2022, (3 - 1), 20)).toBe(null);
    });
});

describe('checkDayBeforeHoliday()', () => {
    test('春分の日の前日が祝前日判定される', () => {
        expect(CsvObject.checkDayBeforeHoliday(2022, (3 - 1), 20)).toBe(true);
    });

    test('春分の日が祝前日判定されない', () => {
        expect(CsvObject.checkDayBeforeHoliday(2022, (3 - 1), 21)).toBe(false);
    });
});

describe('checkDayAfterHoliday()', () => {
    test('春分の日の翌日が祝後日判定される', () => {
        expect(CsvObject.checkDayAfterHoliday(2022, (3 - 1), 22)).toBe(true);
    });

    test('春分の日が祝前日判定されない', () => {
        expect(CsvObject.checkDayBeforeHoliday(2022, (3 - 1), 21)).toBe(false);
    });
});

describe('checkWeekEnd()', () => {
    test('土曜日がtrue', () => {
        expect(CsvObject.checkWeekEnd(2023, (3 - 1), 4)).toBe(true);
    });

    test('日曜日がtrue', () => {
        expect(CsvObject.checkWeekEnd(2023, (3 - 1), 5)).toBe(true);
    });

    test('月曜日がfalse', () => {
        expect(CsvObject.checkWeekEnd(2023, (3 - 1), 6)).toBe(false);
    });
});

describe('checkSunday()', () => {
    test('土曜日がfalse', () => {
        expect(CsvObject.checkSunday(2023, (3 - 1), 4)).toBe(false);
    });

    test('日曜日がtrue', () => {
        expect(CsvObject.checkSunday(2023, (3 - 1), 5)).toBe(true);
    });

    test('月曜日がfalse', () => {
        expect(CsvObject.checkSunday(2023, (3 - 1), 6)).toBe(false);
    });
});

describe('checkFurikaeHolidaySunday()', () => {
    test('2021年08月09日は山の日の振替休日', () => {
        expect(CsvObject.checkFurikaeHolidaySunday(2021, (8 - 1), 9)).toBe(true);
    });

    test('通常の平日', () => {
        expect(CsvObject.checkFurikaeHolidaySunday(2021, (8 - 1), 10)).toBe(false);
    });
});

describe('checkFurikaeHolidaySandwich()', () => {
    test('2019年04月30日は祝日扱い', () => {
        expect(CsvObject.checkFurikaeHolidaySandwich(2019, (4 - 1), 30)).toBe(true);
    });

    test('2019年05月02日は祝日扱い', () => {
        expect(CsvObject.checkFurikaeHolidaySandwich(2019, (5 - 1), 2)).toBe(true);
    });
});
