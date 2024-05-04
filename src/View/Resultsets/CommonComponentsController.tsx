import { FieldErrors, FieldValues } from "react-hook-form";
import { RepositoryDataItem } from "../../../Typings/bussinesTypes";
import ToolsDate from "../../React/ToolsDate";

/** Przerabia obiekty na pary kluczy i wartości do przesłąnia parametrów filtra - GET */
export function parseFieldValuesToParams(data: FieldValues) {
    const params: { [key: string]: any } = {};
    for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;

        const element = data[key];
        params[key] = processElement(element);
    }
    return params;
}

export function parseFieldValuestoFormData(data: FieldValues) {
    const formData = new FormData();
    for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;

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

function processElement(element: any) {
    let parsedValue = "";
    switch (typeof element) {
        case "string":
        case "number":
            parsedValue = element.toString();
            break;
        case "object":
            if (element instanceof Date) {
                parsedValue = ToolsDate.toUTC(element);
            } else {
                parsedValue = JSON.stringify(element);
            }
            break;
    }

    return parsedValue;
}

/** Aktualizuje dane obiektu na podstawie danych z formularza
 * działa na kopii obiektu, nie zmienia obiektu w repozytorium
 */
export function updateObject(formData: FormData, obj: any) {
    const updatedObj = { ...obj };
    formData.forEach((value, key) => {
        if (updatedObj.hasOwnProperty(key)) {
            if (typeof value === "string" && (value.startsWith("{") || value.startsWith("[")))
                try {
                    updatedObj[key] = JSON.parse(value);
                } catch (e) {
                    updatedObj[key] = value;
                }
            else updatedObj[key] = value;
        } else console.log(`Form data key ${key} does not match any attribute in current object`);
    });
    return updatedObj;
}

interface NestedFieldErrors extends FieldErrors {
    [key: string]: NestedFieldErrors | any;
}

/**
 * Zwraca true jeśli w obiekcie errors jest błąd dla podanej ścieżki
 * @param errors obiekt błędów
 * @param path ścieżka do sprawdzenia
 * @returns true jeśli błąd istnieje
 * @example hasError(errors, "_offerBond.paymentData")
 */
export function hasError(errors: NestedFieldErrors, path: string) {
    const keys = path.split(".");
    let current: any = errors;
    for (let key of keys) {
        if (current && current[key]) {
            current = current[key];
        } else {
            return false; // No error at this path
        }
    }
    return current && current.type ? true : false;
}
