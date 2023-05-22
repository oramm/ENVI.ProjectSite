"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFieldValuestoFormData = void 0;
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
        let parsedValue = '';
        switch (typeof element) {
            case 'string':
            case 'number':
                parsedValue = element.toString();
                break;
            case 'object':
                parsedValue = JSON.stringify(element);
                break;
        }
        formData.append(key, parsedValue);
    }
    return formData;
}
exports.parseFieldValuestoFormData = parseFieldValuestoFormData;
