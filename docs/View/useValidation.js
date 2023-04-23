"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useValidation = void 0;
const react_1 = require("react");
/** Główna funkcja hooka useValidation
 * @param initialValue - początkowa wartość pola
 * @param validationFunction - funkcja walidująca wartość pola
 * @param fieldName - nazwa pola
 * @param validationMessage - komunikat walidacji
 * @param onValidationChange - funkcja wywoływana w GeneralModal przy zmianie wartości pola
 * @param afterChangeFunction - funkcja wywoływana po zmianie wartości pola
 */
function useValidation(options) {
    const { initialValue, validationFunction, fieldName, validationMessage, onValidationChange, } = options;
    const [isInitialUpdate, setIsInitialUpdate] = (0, react_1.useState)(true);
    const [value, setValue] = (0, react_1.useState)(initialValue);
    const [isValid, setIsValid] = (0, react_1.useState)(validationFunction(initialValue));
    const [previousIsValid, setPreviousIsValid] = (0, react_1.useState)(isValid);
    (0, react_1.useEffect)(() => {
        if (isInitialUpdate) {
            // Inicjujemy tablicę stanów dla pierwszego renderowania
            if (onValidationChange) {
                onValidationChange(fieldName, isValid);
            }
            setIsInitialUpdate(false);
        }
        else if (onValidationChange && isValid !== previousIsValid) {
            // Aktualizujemy tablicę stanów dla kolejnych zmian
            onValidationChange(fieldName, isValid);
            setPreviousIsValid(isValid);
        }
    }, [fieldName, isValid, onValidationChange, previousIsValid, isInitialUpdate]);
    // Funkcja obsługująca zmianę wartości pola
    const handleChange = (e) => {
        let newValue;
        if (typeof e.target?.value === 'string')
            newValue = e.target.value;
        else
            newValue = e;
        const validationFormula = validationFunction(newValue);
        setValue(newValue);
        setIsValid(validationFormula);
    };
    return { value, isValid, handleChange, validationMessage };
}
exports.useValidation = useValidation;
