const fs = require('fs');
const parse = require('csv-parse/sync');
const iconv  = require('iconv-lite');

const csv = fs.readFileSync(__dirname + '/../csv/syukujitsu.csv');
const utf8csv = parse.parse(iconv.decode(csv, "Shift_JIS"));
const moment = require('moment');

class Csv
{
  #holidays;

  /**
   * 配列データを生成
   */
  constructor()
  {
    for (const line of utf8csv) {
      const holiday = line[0].split('/');
      // 振替休日はロジックで判断させるため削除
      if (line[1] === '休日') {
        continue;
      }

      const year = holiday[0];
      const month = holiday[1] - 1;
      const date = holiday[2];

      if (Csv.holidays === undefined) {
        Csv.holidays = [];
      }
      if (Csv.holidays[year] === undefined) {
        Csv.holidays[year] = [];
      }
      if (Csv.holidays[year][month] === undefined) {
        Csv.holidays[year][month] = [];
      }

      Csv.holidays[year][month][date] = {
        name: line[1],
        public_holiday: true
      };
    }
  }

  checkRealPublicHoliday(year, month, date)
  {
    return Csv.holidays[year][month][date] !== undefined;
  }

  /**
   * 祝日を判定する
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkHoliday(year, month, date)
  {
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
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {string|null}
   */
  getHolidayName(year, month, date)
  {
    if (this.checkHoliday(year, month, date)) {
      return Csv.holidays[year][month][date].name;
    }

    return null;
  }

  /**
   * 祝前日である
   *
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @return {boolean}
   */
  checkDayBeforeHoliday(year, month, date)
  {
    const westerday = this.createMomentObject(year, month, date).add(1, 'days');
    return this.checkHoliday(westerday.year(), westerday.month(), westerday.date());
  }

  /**
   * 祝後日である
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkDayAfterHoliday(year, month, date)
  {
    const westerday = this.createMomentObject(year, month, date).subtract(1, 'days');
    return this.checkHoliday(westerday.year(), westerday.month(), westerday.date());
  }

  /**
   * 週末かどうかを判定する
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkWeekEnd(year, month, date)
  {
    const checkday = this.createMomentObject(year, month, date);

    return (checkday.day() === 0 || checkday.day() === 6);
  }

  /**
   * 日曜かどうかを判定する
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkSunday(year, month, date)
  {
    const checkday = this.createMomentObject(year, month, date);
    return (checkday.day() === 0);
  }

  /**
   * 祝日に挟まれた平日だった場合の振替休日かどうかを判定
   *
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkFurikaeHolidaySandwich(year, month, date)
  {
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
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  checkFurikaeHolidaySunday(year, month, date)
  {
    if (this.checkWeekEnd(year, month, date)) {
      return false;
    }

    const checkday = this.createMomentObject(year, month, date);
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
   * @param {number} year
   * @param {number} month
   * @param {number} date
   * @returns {boolean}
   */
  createMomentObject(year, month, date)
  {
    return moment({
      year: year,
      month: month,
      date: date,
    });
  }
}

module.exports = Csv;
