import { FieldValues } from "react-hook-form";

export function parseFieldValuestoFormData(data: FieldValues) {
    const formData = new FormData();
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];
            let parsedValue: string = '';
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