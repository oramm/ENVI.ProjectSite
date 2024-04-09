"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateObject = exports.parseFieldValuestoFormData = exports.parseFieldValuesToParams = void 0;
const ToolsDate_1 = __importDefault(require("../../React/ToolsDate"));
/** Przerabia obiekty na pary kluczy i wartości do przesłąnia parametrów filtra - GET */
function parseFieldValuesToParams(data) {
    const params = {};
    for (const key in data) {
        if (!data.hasOwnProperty(key))
            continue;
        const element = data[key];
        params[key] = processElement(element);
    }
    return params;
}
exports.parseFieldValuesToParams = parseFieldValuesToParams;
function parseFieldValuestoFormData(data) {
    const formData = new FormData();
    for (const key in data) {
        if (!data.hasOwnProperty(key))
            continue;
        const element = data[key];
        if (element instanceof File) {
            formData.append(key, element);
            continue;
        }
        if (element instanceof FileList) {
            for (let i = 0; i < element.length; i++) {
                formData.append(key, element[i]);
            }
            continue;
        }
        formData.append(key, processElement(element));
    }
    return formData;
}
exports.parseFieldValuestoFormData = parseFieldValuestoFormData;
function processElement(element) {
    let parsedValue = "";
    switch (typeof element) {
        case "string":
        case "number":
            parsedValue = element.toString();
            break;
        case "object":
            if (element instanceof Date) {
                parsedValue = ToolsDate_1.default.toUTC(element);
            }
            else {
                parsedValue = JSON.stringify(element);
            }
            break;
    }
    return parsedValue;
}
/** Aktualizuje dane obiektu na podstawie danych z formularza
 * działa na kopii obiektu, nie zmienia obiektu w repozytorium
 */
function updateObject(formData, obj) {
    const updatedObj = { ...obj };
    formData.forEach((value, key) => {
        if (updatedObj.hasOwnProperty(key)) {
            if (typeof value === "string" && (value.startsWith("{") || value.startsWith("[")))
                try {
                    updatedObj[key] = JSON.parse(value);
                }
                catch (e) {
                    updatedObj[key] = value;
                }
            else
                updatedObj[key] = value;
        }
        else
            console.log(`Form data key ${key} does not match any attribute in current object`);
    });
    return updatedObj;
}
exports.updateObject = updateObject;
