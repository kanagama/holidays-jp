"use strict";
exports.__esModule = true;
var moment = require("moment");
var iconv = require("iconv-lite");
var fs = require('fs');
var parse = require('csv-parse/sync');
var csv = fs.readFileSync(__dirname + '/../csv/syukujitsu.csv');
var utf8csv = parse.parse(iconv.decode(csv, "Shift_JIS"));
/**
 * @cass
 */
var Csv = /** @class */ (function () {
    /**
     * 配列データを生成
     *
     * @constructor
     */
    function Csv() {
        for (var _i = 0, utf8csv_1 = utf8csv; _i < utf8csv_1.length; _i++) {
            var line = utf8csv_1[_i];
            var publicHoliday = line[0].split('/');
            // 振替休日はロジックで判断させるため削除
            if (line[1] === '休日') {
                continue;
            }
            var year = publicHoliday[0];
            var month = Number(publicHoliday[1]) - 1;
            var date = publicHoliday[2];
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
    Csv.prototype.checkRealPublicHoliday = function (year, month, date) {
        return this.holidays[year][month][date] !== undefined;
    };
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
    Csv.prototype.checkHoliday = function (year, month, date) {
        return (this.checkRealPublicHoliday(year, month, date)
            ||
                this.checkFurikaeHolidaySandwich(year, month, date)
            ||
                this.checkFurikaeHolidaySunday(year, month, date));
    };
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
    Csv.prototype.getHolidayName = function (year, month, date) {
        if (this.checkHoliday(year, month, date)) {
            return this.holidays[year][month][date].name;
        }
        return null;
    };
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
    Csv.prototype.checkDayBeforeHoliday = function (year, month, date) {
        var westerday = this.createMomentObject(year, month, date).add(1, 'days');
        return this.checkHoliday(westerday.year(), westerday.month(), westerday.date());
    };
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
    Csv.prototype.checkDayAfterHoliday = function (year, month, date) {
        var westerday = this.createMomentObject(year, month, date).subtract(1, 'days');
        return this.checkHoliday(westerday.year(), westerday.month(), westerday.date());
    };
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
    Csv.prototype.checkWeekEnd = function (year, month, date) {
        var checkday = this.createMomentObject(year, month, date);
        return (checkday.day() === 0 || checkday.day() === 6);
    };
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
    Csv.prototype.checkSunday = function (year, month, date) {
        var checkday = this.createMomentObject(year, month, date);
        return (checkday.day() === 0);
    };
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
    Csv.prototype.checkFurikaeHolidaySandwich = function (year, month, date) {
        return (!this.checkRealPublicHoliday(year, month, date)
            &&
                !this.checkWeekEnd(year, month, date)
            &&
                this.checkDayBeforeHoliday(year, month, date)
            &&
                this.checkDayAfterHoliday(year, month, date));
    };
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
    Csv.prototype.checkFurikaeHolidaySunday = function (year, month, date) {
        if (this.checkWeekEnd(year, month, date)) {
            return false;
        }
        var checkday = this.createMomentObject(year, month, date);
        while (true) {
            checkday.subtract(1, 'days');
            if (!this.checkRealPublicHoliday(checkday.year(), checkday.month(), checkday.date())) {
                return false;
            }
            if (this.checkSunday(checkday.year(), checkday.month(), checkday.date())) {
                return true;
            }
        }
    };
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
    Csv.prototype.createMomentObject = function (year, month, date) {
        return moment({
            year: year,
            month: month,
            date: date
        });
    };
    return Csv;
}());
module.exports = Csv;
