export default class ToolsDate {
    static isStringAYMDDate(string: string) {
        var x = string.length;
        if (string && string.length == 10) {
            var parts = string.split("-");
            if (parts[0].length == 4 && parts[1].length == 2 && parts[2].length == 2) return true;
        } else return false;
    }
    /** Przekształca datę na string UTC w formacie YYYY-MM-DD
     * @param date
     * @returns
     */
    static toUTC(date: Date): string {
        const utcDate = new Date(
            Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
            )
        );
        const parsedDate = utcDate.toISOString().slice(0, 10);
        console.log(parsedDate);
        return parsedDate;
    }

    /** Przetwarza wszystkie daty w obiekcie na UTC */
    static convertDatesToUTC(obj: any) {
        if (!obj || typeof obj !== "object") return;

        for (let key in obj) {
            if (obj[key] instanceof Date) {
                obj[key] = this.toUTC(obj[key]);
            } else if (obj[key] && typeof obj[key] === "object") {
                this.convertDatesToUTC(obj[key]);
            }
        }
    }

    static isStringADMYDate(string: string) {
        if (string && string.length == 10) {
            var parts = string.split("-");
            if (parts[0].length == 2 && parts[1].length == 2 && parts[2].length == 4) return true;
        } else return false;
    }

    static isStringADate(string: string) {
        if (this.isStringADMYDate(string) || this.isStringAYMDDate(string)) return true;
        else return false;
    }
    //date może być {String || Date}
    static addDays(date: Date | string, days: number): Date {
        if (typeof date === "string" && this.isStringADate(date)) {
            date = new Date(date);
        }
        if (this.isValidDate(date as Date)) (date as Date).setDate((date as Date).getDate() + days / 1);
        return date as Date;
    }

    static getNextFridayDate() {
        var curr = new Date(); // get current date
        var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
        var last = first + 4; // last day is the first day + 6

        //var firstday = new Date(curr.setDate(first));
        return new Date(curr.setDate(last));
    }

    static getMaxDate(dates: number[]) {
        return new Date(Math.max.apply(null, dates));
    }

    static isValidDate(date: Date) {
        return date instanceof Date && !isNaN(date.getTime());
    }

    static dateJsToSql(jsDate: Date) {
        if (jsDate !== undefined) {
            var sqlDate = new Date(jsDate).toISOString().slice(0, 10);
            return sqlDate;
        }
        return jsDate;
    }

    static dateJStoDMY(inputDate: Date) {
        if (inputDate) {
            var dd = this.addZero(inputDate.getDate());
            var mm = this.addZero(inputDate.getMonth() + 1); //January is 0!
            var yyyy = inputDate.getFullYear();

            return dd + "-" + mm + "-" + yyyy;
        }
    }

    static dateDMYtoYMD(inputDate: string) {
        if (inputDate) {
            var parts = inputDate.split("-");
            if (parts[2].length == 4) return parts[2] + "-" + parts[1] + "-" + parts[0];
            else return inputDate;
        }
    }

    static dateYMDtoDMY(inputDate: string) {
        if (!inputDate) {
            throw new Error("The input date is null or undefined.");
        }

        const parts = inputDate.split("-");
        // check if the provided string has the correct length and structure for the YMD format
        if (parts.length !== 3 || parts[0].length !== 4 || parts[1].length !== 2 || parts[2].length !== 2) {
            throw new Error("Invalid input date format. The input should be in YMD format.");
        }

        return parts[2] + "-" + parts[1] + "-" + parts[0];
    }

    static timestampToString(timestamp: string | Date) {
        if (typeof timestamp === "string") timestamp = new Date(timestamp);
        var day = this.addZero(timestamp.getUTCDate());
        var month = this.addZero(timestamp.getUTCMonth() + 1); // months are zero-indexed
        var year = timestamp.getUTCFullYear();
        var h = this.addZero(timestamp.getUTCHours());
        var m = this.addZero(timestamp.getUTCMinutes());
        return day + "-" + month + "-" + year + " " + h + ":" + m;
    }

    /**dodaje przedrostek "0" do liczb 0-9 */
    private static addZero(num: number): string {
        return num.toString().padStart(2, "0");
    }
    /**odejmuje pierwszą datę od drugiej */
    static dateDiff(first: number, second: number) {
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }

    static countDaysLeftTo(expiryDate: string) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const expiryDateParsed = new Date(expiryDate);
        const diffDays = ToolsDate.dateDiff(today.getTime(), expiryDateParsed.getTime());
        return diffDays + 1;
    }

    /**Formatuje datę do postaci "DD-MM-YYYY HH:MM"
     */
    static formatTime(date: Date | string) {
        let dateToFormat = new Date(date);

        return dateToFormat.toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
}
