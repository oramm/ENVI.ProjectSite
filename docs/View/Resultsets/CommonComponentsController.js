"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFieldValuestoFormData = void 0;
function parseFieldValuestoFormData(data) {
    const formData = new FormData();
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];
            let parsedValue = '';
            if (typeof element === 'string')
                parsedValue = element;
            if (typeof element === 'object')
                parsedValue = JSON.stringify(element);
            if (typeof element === 'number')
                parsedValue = element.toString();
            formData.append(key, parsedValue);
        }
    }
    return formData;
}
exports.parseFieldValuestoFormData = parseFieldValuestoFormData;
