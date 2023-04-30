import { RepositoryDataItem } from "./RepositoryReact";

export default class Tools {
    /** Aktualizuje dane obiektu na podstawie danych z formularza 
      * działa na kopii obiektu, nie zmienia obiektu w repozytorium
      */
    static updateObject(formData: FormData, obj: RepositoryDataItem): RepositoryDataItem {
        const updatedObj = { ...obj };
        formData.forEach((value, key) => {
            if (updatedObj.hasOwnProperty(key)) {
                if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('[')))
                    try {
                        updatedObj[key] = JSON.parse(value);
                    } catch (e) {
                        updatedObj[key] = value;
                    }
                else
                    updatedObj[key] = value;
            } else
                throw new Error(`Form data key ${key} does not match any attribute in current contract object`);
        });
        return updatedObj;
    }
    /**dodaje przedrostek "0" do liczb 0-9 */
    static addZero(i: number) {
        let label: string = i.toString();
        if (i < 10) {
            label = "0" + i;
        }
        return label;
    }


    //retrieves GET variables from URL
    static getUrlVars() {
        const vars: any = {};
        const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
            //@ts-ignore    
            function (m, key: string, value: string) {
                vars[key] = value;
            });
        return vars;
    }

    static stringToSql(string: string) {
        var sqlString = string.replace(/\'/gi, "\\'");
        sqlString = sqlString.replace(/\"/gi, '\\"');
        sqlString = sqlString.replace(/\%/gi, '\\%');
        sqlString = sqlString.replace(/\_/gi, '\\_');
        return sqlString;
    }

    static areEqualObjects(obj1: Object, obj2: Object) {
        //Loop through properties in object 1
        let p1: keyof typeof obj1;
        for (p1 in obj1) {
            //Check property exists on both objects
            if (obj1.hasOwnProperty(p1) !== obj2.hasOwnProperty(p1)) return false;

            switch (typeof (obj1[p1])) {
                //Deep compare objects
                case 'object':
                    if (!Tools.areEqualObjects(obj1[p1], obj2[p1])) return false;
                    break;
                //Compare function code
                case 'function':
                    if (typeof (obj2[p1]) == 'undefined' || obj1[p1].toString() != obj2[p1].toString()) return false;
                    break;
                //Compare values
                default:
                    if (obj1[p1] != obj2[p1]) return false;
            }
        }

        //Check object 2 for any extra properties
        let p2: keyof typeof obj2;
        for (p2 in obj2) {
            if (typeof (obj1[p2]) == 'undefined') return false;
        }
        return true;
    }
    /* https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
     * sprawdza który oiekt jest większy - do użycia w Array.sort()
     * @param {type} key - nazwa atrybutu obiektu
     * @param {type} order
     * @returns {Function}
     */
    static compareValues(key: string, order = 'asc') {
        return function (a: any, b: any) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0;
            let comparison = a[key].localeCompare(b[key]);
            return (
                (order == 'desc') ? (comparison * -1) : comparison
            );
        };
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
    static tryParseJSONObject(jsonString: string) {
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
    static b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
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

    static isObjectEmpty(object: Object) {
        for (const element in object) return true;
        return false;
    }
}