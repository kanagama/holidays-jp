import { Holiday } from './interface/holidayInterface';

import * as moment from 'moment';
import * as iconv from 'iconv-lite';

import * as fs from 'fs';
import * as parse from 'csv-parse/sync';

const csv = fs.readFileSync(__dirname + '/../csv/syukujitsu.csv');
const utf8csv: Array<string> = parse.parse(iconv.decode(csv, "Shift_JIS"));

/**
 * @class
 */
class Csv
{
  /**
   * @type {Record<number, Record<number, Record<number, Holiday>>>}
   */
  private holidays: Record<number, Record<number, Record<number, Holiday>>>;

  /**
   * 配列データを生成
   *
   * @constructor
   */
  constructor()
  {
    for (const line of utf8csv) {
      const publicHoliday: string[] = line[0].split('/');
      // 振替休日はロジックで判断させるため削除
      if (line[1] === '休日') {
        continue;
      }

      const year = publicHoliday[0];
      const month = Number(publicHoliday[1]) - 1;
      const date = publicHoliday[2];

      if (this.holidays === undefined) {
        this.holidays = [];
      }
      if (this.holidays[year] === undefined) {
        this.holidays[year] = [];
      }
      if (this.holidays[year][month] === undefined) {
        this.holidays[year][month] = [];
      }

      this.holidays[year][month][date] = {
        name: line[1],
        public_holiday: true
      };
    }
  }

  /**
   * @method
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkRealPublicHoliday(year: number, month: number, date: number): boolean {
    return this.holidays[year][month][date] !== undefined;
  }

  /**
   * 祝日を判定する
   *
   * @method
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkHoliday(year: number, month: number, date: number): boolean {
    return (
      this.checkRealPublicHoliday(year, month, date)
      ||
      this.checkFurikaeHolidaySandwich(year, month, date)
      ||
      this.checkFurikaeHolidaySunday(year, month, date)
    );
  }

  /**
   * 祝日名を取得する
   *
   * @method
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {string|null}
   */
  getHolidayName(year: number, month: number, date: number): string | null {
    if (this.checkHoliday(year, month, date)) {
      return this.holidays[year][month][date].name;
    }

    return null;
  }

  /**
   * 祝前日である
   *
   * @method
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @return {boolean}
   */
  checkDayBeforeHoliday(year: number, month: number, date: number): boolean {
    const westerday: moment.Moment = this.createMomentObject(year, month, date).add(1, 'days');
    return this.checkHoliday(westerday.year(), westerday.month(), westerday.date());
  }

  /**
   * 祝後日である
   *
   * @method
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkDayAfterHoliday(year: number, month: number, date: number): boolean {
    const westerday: moment.Moment = this.createMomentObject(year, month, date).subtract(1, 'days');
    return this.checkHoliday(westerday.year(), westerday.month(), westerday.date());
  }

  /**
   * 週末かどうかを判定する
   *
   * @method
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkWeekEnd(year: number, month: number, date: number): boolean {
    const checkday: moment.Moment = this.createMomentObject(year, month, date);

    return (checkday.day() === 0 || checkday.day() === 6);
  }

  /**
   * 日曜かどうかを判定する
   *
   * @method
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkSunday(year: number, month: number, date: number): boolean {
    const checkday: moment.Moment = this.createMomentObject(year, month, date);
    return (checkday.day() === 0);
  }

  /**
   * 祝日に挟まれた平日だった場合の振替休日かどうかを判定
   *
   * @method
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkFurikaeHolidaySandwich(year: number, month: number, date: number): boolean {
    return (
      !this.checkRealPublicHoliday(year, month, date)
      &&
      !this.checkWeekEnd(year, month, date)
      &&
      this.checkDayBeforeHoliday(year, month, date)
      &&
      this.checkDayAfterHoliday(year, month, date)
    );
  }

  /**
   * 日曜が祝日だった場合の振替休日かどうかを判定
   *
   * @method
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkFurikaeHolidaySunday(year: number, month: number, date: number): boolean {
    if (this.checkWeekEnd(year, month, date)) {
      return false;
    }

    const checkday: moment.Moment = this.createMomentObject(year, month, date);
    // ESLint のチェックを通過させるために余計な処理を入れたくないため、チェックをスキップする
    // eslint-disable-next-line no-constant-condition
    while (true) {
      checkday.subtract(1, 'days');

      if (!this.checkRealPublicHoliday(checkday.year(), checkday.month(), checkday.date())) {
        return false;
      }

      if (this.checkSunday(checkday.year(), checkday.month(), checkday.date())) {
        return true;
      }
    }
  }

  /**
   * moment オブジェクトを生成する
   *
   * @method
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {moment.Moment}
   */
  createMomentObject(year: number, month: number, date: number): moment.Moment {
    return moment({
      year: year,
      month: month,
      date: date,
    });
  }
}

module.exports = Csv;
