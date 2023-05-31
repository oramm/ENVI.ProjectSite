"use strict";
class Tools {
    /** finds an elament in Array by its value */
    static search(nameKey, property, myArray) {
        for (const element of myArray) {
            if (element[property] == nameKey) {
                return element;
            }
        }
    }
    static dateDMYtoYMD(inputDate) {
        if (inputDate) {
            const parts = inputDate.split("-");
            if (parts[2].length === 4)
                return parts[2] + '-' + parts[1] + '-' + parts[0];
            else
                return inputDate;
        }
    }
    static timestampToString(timestamp) {
        if (typeof timestamp === 'string')
            timestamp = new Date(timestamp);
        var day = this.addZero(timestamp.getUTCDate());
        var month = this.addZero(timestamp.getUTCMonth() + 1); // months are zero-indexed
        var year = timestamp.getUTCFullYear();
        var h = this.addZero(timestamp.getUTCHours());
        var m = this.addZero(timestamp.getUTCMinutes());
        return day + '&#8209;' + month + '&#8209;' + year + ' ' +
            h + ':' + m;
    }
    /**dodaje przedrostek "0" do liczb 0-9 */
    static addZero(num) {
        return num.toString().padStart(2, '0');
    }
    static dateJStoDMY(inputDate) {
        const dd = this.addZero(inputDate.getDate());
        const mm = this.addZero(inputDate.getMonth() + 1); //January is 0!
        const yyyy = inputDate.getFullYear();
        return dd + '-' + mm + '-' + yyyy;
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
    static dateJStoYMD(inputDate) {
        return this.dateDMYtoYMD(this.dateJStoDMY(inputDate));
    }
    static daysToMilliseconds(days) {
        return days * 24 * 60 * 60 * 1000;
    }
    static loadjscssfile(filename, filetype) {
        let fileref;
        if (filetype == "js") { //if filename is a external JavaScript file
            fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", filename);
        }
        else if (filetype == "css") { //if filename is an external CSS file
            fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", filename);
        }
        if (typeof fileref != "undefined")
            document.getElementsByTagName("head")[0].appendChild(fileref);
    }
    //retrieves GET variables from URL
    static getUrlVars() {
        const vars = {};
        const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, 
        //@ts-ignore    
        function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    }
    static hasFunction(functionRef) {
        if (typeof functionRef === 'undefined') {
            throw new SyntaxError('Derived object must implement function');
        }
        else if (typeof functionRef !== 'function') {
            throw new SyntaxError("It's neither undefined nor a function. It's a " + typeof functionRef);
        }
    }
    static stringToSql(string) {
        var sqlString = string.replace(/\'/gi, "\\'");
        sqlString = sqlString.replace(/\"/gi, '\\"');
        sqlString = sqlString.replace(/\%/gi, '\\%');
        sqlString = sqlString.replace(/\_/gi, '\\_');
        return sqlString;
    }
    static cloneOfObject(object) {
        if (object)
            return JSON.parse(JSON.stringify(object));
    }
    static areEqualObjects(obj1, obj2) {
        //Loop through properties in object 1
        let p1;
        for (p1 in obj1) {
            //Check property exists on both objects
            if (obj1.hasOwnProperty(p1) !== obj2.hasOwnProperty(p1))
                return false;
            switch (typeof (obj1[p1])) {
                //Deep compare objects
                case 'object':
                    if (!Tools.areEqualObjects(obj1[p1], obj2[p1]))
                        return false;
                    break;
                //Compare function code
                case 'function':
                    if (typeof (obj2[p1]) == 'undefined' || obj1[p1].toString() != obj2[p1].toString())
                        return false;
                    break;
                //Compare values
                default:
                    if (obj1[p1] != obj2[p1])
                        return false;
            }
        }
        //Check object 2 for any extra properties
        let p2;
        for (p2 in obj2) {
            if (typeof (obj1[p2]) == 'undefined')
                return false;
        }
        return true;
    }
    /* https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
     * sprawdza który oiekt jest większy - do użycia w Array.sort()
     * @param {type} key - nazwa atrybutu obiektu
     * @param {type} order
     * @returns {Function}
     */
    static compareValues(key, order = 'asc') {
        return function (a, b) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key))
                return 0;
            let comparison = a[key].localeCompare(b[key]);
            return ((order == 'desc') ? (comparison * -1) : comparison);
        };
    }
    //https://codeburst.io/javascript-array-distinct-5edc93501dc4
    static ArrNoDuplicates(array) {
        const result = [];
        const map = new Map();
        for (const item of array) {
            if (!map.has(item.id)) {
                map.set(item.id, true); // set any value to Map
                result.push(item);
            }
        }
        console.log(result);
        return result;
    }
    /*
     * item {Object}
     */
    static arrGetIndexOf(array, property, searchValue) {
        for (let i = 0; i < array.length; i++) {
            if (array[i][property] === searchValue)
                return i;
        }
    }
    /**
     * If you don't care about primitives and only objects then this function
     * is for you, otherwise look elsewhere.
     * This function will return `false` for any valid json primitive.
     * EG, 'true' -> false
     *     '123' -> false
     *     'null' -> false
     *     '"I'm a string"' -> false
     */
    static tryParseJSONObject(jsonString) {
        try {
            const o = JSON.parse(jsonString);
            // Handle non-exception-throwing cases:
            // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
            // but... JSON.parse(null) returns null, and typeof null === "object", 
            // so we must check for that, too. Thankfully, null is falsey, so this suffices:
            if (o && typeof o === "object")
                return o;
        }
        catch (e) { }
        return false;
    }
    //https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
    static b64toBlob(b64Data, contentType = '', sliceSize = 512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    static isObjectEmpty(object) {
        for (const element in object)
            return true;
        return false;
    }
}
