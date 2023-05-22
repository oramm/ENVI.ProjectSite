import { FieldValues } from "react-hook-form";

export function parseFieldValuestoFormData(data: FieldValues) {
    const formData = new FormData();
    for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;

        const element = data[key];
        if (element instanceof File) {
            formData.append(key, element);
            continue;
        }

        let parsedValue: string = '';
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
