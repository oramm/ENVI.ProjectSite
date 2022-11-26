"use strict";
var Tools = /** @class */ (function () {
    function Tools() {
    }
    //finds an alament in Array by its value
    Tools.search = function (nameKey, property, myArray) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i][property] == nameKey) {
                return myArray[i];
            }
        }
    };
    Tools.dateDMYtoYMD = function (inputDate) {
        if (inputDate) {
            var parts = inputDate.split("-");
            if (parts[2].length === 4)
                return parts[2] + '-' + parts[1] + '-' + parts[0];
            else
                return inputDate;
        }
    };
    Tools.timestampToString = function (timestamp) {
        if (typeof timestamp === 'string')
            timestamp = new Date(timestamp);
        var day = this.addZero(timestamp.getDate());
        var month = this.addZero(timestamp.getMonth() + 1);
        var year = timestamp.getFullYear();
        var h = this.addZero(timestamp.getHours());
        var m = this.addZero(timestamp.getMinutes());
        return day + '&#8209;' + month + '&#8209;' + year + ' ' +
            h + ':' + m;
    };
    Tools.addZero = function (i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    };
    Tools.dateJStoDMY = function (inputDate) {
        if (inputDate) {
            var dd = this.addZero(inputDate.getDate());
            var mm = this.addZero(inputDate.getMonth() + 1); //January is 0!
            var yyyy = inputDate.getFullYear();
            return dd + '-' + mm + '-' + yyyy;
        }
    };
    Tools.dateJStoYMD = function (inputDate) {
        return this.dateDMYtoYMD(this.dateJStoDMY(inputDate));
    };
    Tools.daysToMilliseconds = function (days) {
        return days * 24 * 60 * 60 * 1000;
    };
    Tools.loadjscssfile = function (filename, filetype) {
        if (filetype == "js") { //if filename is a external JavaScript file
            var fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", filename);
        }
        else if (filetype == "css") { //if filename is an external CSS file
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", filename);
        }
        if (typeof fileref != "undefined")
            document.getElementsByTagName("head")[0].appendChild(fileref);
    };
    //retrieves GET variables from URL
    Tools.getUrlVars = function () {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    };
    Tools.hasFunction = function (functionRef) {
        if (typeof functionRef === 'undefined') {
            throw new SyntaxError('Derived object must implement function');
        }
        else if (typeof functionRef !== 'function') {
            throw new SyntaxError("It's neither undefined nor a function. It's a " + typeof functionRef);
        }
    };
    Tools.stringToSql = function (string) {
        var sqlString = string.replace(/\'/gi, "\\'");
        sqlString = sqlString.replace(/\"/gi, '\\"');
        sqlString = sqlString.replace(/\%/gi, '\\%');
        sqlString = sqlString.replace(/\_/gi, '\\_');
        return sqlString;
    };
    Tools.cloneOfObject = function (object) {
        if (object)
            return JSON.parse(JSON.stringify(object));
    };
    Tools.areEqualObjects = function (obj1, obj2) {
        //Loop through properties in object 1
        for (var p in obj1) {
            //Check property exists on both objects
            if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p))
                return false;
            switch (typeof (obj1[p])) {
                //Deep compare objects
                case 'object':
                    if (!areEqualObjects(obj1[p], obj2[p]))
                        return false;
                    break;
                //Compare function code
                case 'function':
                    if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString()))
                        return false;
                    break;
                //Compare values
                default:
                    if (obj1[p] != obj2[p])
                        return false;
            }
        }
        //Check object 2 for any extra properties
        for (var p in obj2) {
            if (typeof (obj1[p]) == 'undefined')
                return false;
        }
        return true;
    };
    /* https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
     * sprawdza który oiekt jest większy - do użycia w Array.sort()
     * @param {type} key - nazwa atrybutu obiektu
     * @param {type} order
     * @returns {Function}
     */
    Tools.compareValues = function (key, order) {
        if (order === void 0) { order = 'asc'; }
        return function (a, b) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key))
                return 0;
            var comparison = a[key].localeCompare(b[key]);
            return ((order == 'desc') ? (comparison * -1) : comparison);
        };
    };
    //https://codeburst.io/javascript-array-distinct-5edc93501dc4
    Tools.ArrNoDuplicates = function (array) {
        var result = [];
        var map = new Map();
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var item = array_1[_i];
            if (!map.has(item.id)) {
                map.set(item.id, true); // set any value to Map
                result.push(item);
            }
        }
        console.log(result);
        return result;
    };
    /*
     * item {Object}
     */
    Tools.arrGetIndexOf = function (array, property, searchValue) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][property] === searchValue)
                return i;
        }
    };
    /**
     * If you don't care about primitives and only objects then this function
     * is for you, otherwise look elsewhere.
     * This function will return `false` for any valid json primitive.
     * EG, 'true' -> false
     *     '123' -> false
     *     'null' -> false
     *     '"I'm a string"' -> false
     */
    Tools.tryParseJSONObject = function (jsonString) {
        try {
            var o = JSON.parse(jsonString);
            // Handle non-exception-throwing cases:
            // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
            // but... JSON.parse(null) returns null, and typeof null === "object", 
            // so we must check for that, too. Thankfully, null is falsey, so this suffices:
            if (o && typeof o === "object")
                return o;
        }
        catch (e) { }
        return false;
    };
    //https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
    Tools.b64toBlob = function (b64Data, contentType, sliceSize) {
        if (contentType === void 0) { contentType = ''; }
        if (sliceSize === void 0) { sliceSize = 512; }
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    };
    return Tools;
}());
