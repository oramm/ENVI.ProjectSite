"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ToolsDate {
    static isStringAYMDDate(string) {
        var x = string.length;
        if (string && string.length == 10) {
            var parts = string.split("-");
            if (parts[0].length == 4 && parts[1].length == 2 && parts[2].length == 2)
                return true;
        }
        else
            return false;
    }
    /** Przekształca datę na string UTC w formacie YYYY-MM-DD
     * @param date
     * @returns
     */
    static toUTC(date) {
        let utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        return utcDate.toISOString().slice(0, 10);
    }
    /** Przetwarza wszystkie daty w obiekcie na UTC */
    static convertDatesToUTC(obj) {
        for (let key in obj) {
            if (obj[key] instanceof Date) {
                obj[key] = this.toUTC(obj[key]);
            }
        }
    }
    static isStringADMYDate(string) {
        if (string && string.length == 10) {
            var parts = string.split("-");
            if (parts[0].length == 2 && parts[1].length == 2 && parts[2].length == 4)
                return true;
        }
        else
            return false;
    }
    static isStringADate(string) {
        if (this.isStringADMYDate(string) || this.isStringAYMDDate(string))
            return true;
        else
            return false;
    }
    //date może być {String || Date}
    static addDays(date, days) {
        if (typeof date === 'string' && this.isStringADate(date)) {
            date = new Date(date);
        }
        if (this.isValidDate(date))
            date.setDate(date.getDate() + days / 1);
        return date;
    }
    static getNextFridayDate() {
        var curr = new Date; // get current date
        var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
        var last = first + 4; // last day is the first day + 6
        //var firstday = new Date(curr.setDate(first));
        return new Date(curr.setDate(last));
    }
    static getMaxDate(dates) {
        return new Date(Math.max.apply(null, dates));
    }
    static isValidDate(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }
    static dateJsToSql(jsDate) {
        if (jsDate !== undefined) {
            var sqlDate = new Date(jsDate).toISOString().slice(0, 10);
            return sqlDate;
        }
        return jsDate;
    }
    static dateJStoDMY(inputDate) {
        if (inputDate) {
            var dd = this.addZero(inputDate.getDate());
            var mm = this.addZero(inputDate.getMonth() + 1); //January is 0!
            var yyyy = inputDate.getFullYear();
            return dd + '-' + mm + '-' + yyyy;
        }
    }
    static dateDMYtoYMD(inputDate) {
        if (inputDate) {
            var parts = inputDate.split("-");
            if (parts[2].length == 4)
                return parts[2] + '-' + parts[1] + '-' + parts[0];
            else
                return inputDate;
        }
    }
    static dateYMDtoDMY(inputDate) {
        if (!inputDate) {
            throw new Error("The input date is null or undefined.");
        }
        const parts = inputDate.split("-");
        // check if the provided string has the correct length and structure for the YMD format
        if (parts.length !== 3 || parts[0].length !== 4 || parts[1].length !== 2 || parts[2].length !== 2) {
            throw new Error("Invalid input date format. The input should be in YMD format.");
        }
        return parts[2] + '-' + parts[1] + '-' + parts[0];
    }
    static timestampToString(timestamp) {
        if (typeof timestamp === 'string')
            timestamp = new Date(timestamp);
        var day = this.addZero(timestamp.getUTCDate());
        var month = this.addZero(timestamp.getUTCMonth() + 1); // months are zero-indexed
        var year = timestamp.getUTCFullYear();
        var h = this.addZero(timestamp.getUTCHours());
        var m = this.addZero(timestamp.getUTCMinutes());
        return day + '-' + month + '-' + year + ' ' + h + ':' + m;
    }
    /**dodaje przedrostek "0" do liczb 0-9 */
    static addZero(num) {
        return num.toString().padStart(2, '0');
    }
    static dateDiff(first, second) {
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }
}
exports.default = ToolsDate;
